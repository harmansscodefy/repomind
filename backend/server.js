require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");const { parseGithubUrl, walkRepo } = require("./services/githubservice");
const { chunkFiles } = require("./services/chunkingService");
const { embedChunks } = require("./services/embeddingService");
const Chunk = require("./models/Chunk");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const requireAuth = require("./middleware/requireAuth");



const app = express();

// --- Middleware ---
app.use(cors());          // allows your frontend (different port) to talk to this server
app.use(express.json());  // parses incoming JSON request bodies into req.body




app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "Email and a password (min 6 characters) are required" });
  }

  try {
    // Hash the password BEFORE storing anything
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ email, passwordHash });

    // Immediately log them in after registering, by issuing a token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, email: user.email });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB's duplicate-key error code, triggered by our "unique: true" on email
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    console.error("Registration failed:", error.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, email: user.email });
  } catch (error) {
    console.error("Login failed:", error.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// --- A simple test route, to confirm the server is alive ---
app.get("/", (req, res) => {
  res.send("RepoMind backend is running");
});

// --- Connect to MongoDB, then start the server ---
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1); // stop the process entirely if we can't connect to the DB
  }
}

app.post("/ingest", requireAuth,async (req, res) => {
  const { repoUrl } = req.body;

  // Step 1: Validate input
  const isValidUrl = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/.test(repoUrl);
  if (!repoUrl || !isValidUrl) {
    return res.status(400).json({ error: "Please provide a valid GitHub repo URL" });
  }

  try {
    // Step 2: Parse owner/repo
    const { owner, repo } = parseGithubUrl(repoUrl);

    // Step 3: Fetch all relevant files
    const files = await walkRepo(owner, repo);
    if (files.length === 0) {
      return res.status(404).json({ error: "No relevant files found in this repo" });
    }

    // Step 4: Chunk every file
    const chunks = chunkFiles(files);

    // Step 5: Generate embeddings for every chunk
    const embeddedChunks = await embedChunks(chunks);

    // Step 6: Attach repoUrl to every chunk, then save all of them
    const chunksToSave = embeddedChunks.map((chunk) => ({
  ...chunk,
  repoUrl: repoUrl,
  userId: req.user.userId, // ← new line
}));

    const saved = await Chunk.insertMany(chunksToSave);

    // Step 7: Respond with a summary
    res.json({
      message: "Ingestion complete",
      repoUrl: repoUrl,
      filesProcessed: files.length,
      chunksStored: saved.length,
    });
  } catch (error) {
    console.error("Ingestion failed:", error.message);
    res.status(500).json({ error: "Ingestion failed", details: error.message });
  }
});



const { getEmbedding } = require("./services/embeddingService");

app.post("/query", requireAuth,async (req, res) => {
  const { repoUrl, question } = req.body;

  if (!repoUrl || !question || typeof question !== "string" || question.length > 500) {
    return res.status(400).json({ error: "Please provide a valid repoUrl and question" });
  }

  try {
    // Step 1: Embed the user's question
    const questionEmbedding = await getEmbedding(question);

    // inside your /query route, before the aggregate call:
   const userIdObjectId = new mongoose.Types.ObjectId(req.user.userId);


    // Step 2: Vector search MongoDB for the closest matching chunks,
    // scoped to only this repo
    const results = await Chunk.aggregate([
      {
        $vectorSearch: {
      index: "code_vector_index",
      path: "embedding",
      queryVector: questionEmbedding,
      numCandidates: 100,
      limit: 5,
      filter: {
        repoUrl: repoUrl,
        userId: userIdObjectId, // ← now a real ObjectId, matches correctly
      },
    },
      },
      {
        $project: {
          fileName: 1,
          code: 1,
          startLine: 1,
          endLine: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    if (results.length === 0) {
      return res.json({
        answer: "I couldn't find any relevant code for this question in the ingested repo.",
        sources: [],
      });
    }

    // Step 3: Build the prompt using retrieved chunks
    const context = results
      .map(
        (chunk) =>
          `File: ${chunk.fileName} (lines ${chunk.startLine}-${chunk.endLine})\n${chunk.code}`
      )
      .join("\n\n---\n\n");

    const prompt = `You are a code assistant answering questions about a specific GitHub repository.
Use ONLY the code snippets below to answer the question. Always cite the file name and line numbers you used.
If the provided code doesn't contain enough information to answer confidently, say so clearly instead of guessing.

CODE CONTEXT:
${context}

QUESTION:
${question}

ANSWER:`;

    // Step 4: Call Gemini to generate the final answer
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const geminiData = await geminiResponse.json();

    if (!geminiData.candidates) {
      return res.status(500).json({
        error: "Gemini did not return candidates",
        geminiRawResponse: geminiData,
      });
    }

    const answer = geminiData.candidates[0].content.parts[0].text;

    res.json({
      answer: answer,
      sources: results.map((r) => ({
        fileName: r.fileName,
        startLine: r.startLine,
        endLine: r.endLine,
        score: r.score,
      })),
    });
  } catch (error) {
    console.error("Query failed:", error.message);
    res.status(500).json({ error: "Query failed", details: error.message });
  }
});


app.get("/my-repos", requireAuth, async (req, res) => {
  try {
    const userIdObjectId = new mongoose.Types.ObjectId(req.user.userId);

    const repos = await Chunk.aggregate([
      { $match: { userId: userIdObjectId } },
      {
        $group: {
          _id: "$repoUrl",
          chunkCount: { $sum: 1 },
          lastIngested: { $max: "$createdAt" },
        },
      },
      { $sort: { lastIngested: -1 } },
    ]);

    res.json({
      repos: repos.map((r) => ({
        repoUrl: r._id,
        chunkCount: r.chunkCount,
        lastIngested: r.lastIngested,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch repos:", error.message);
    res.status(500).json({ error: "Failed to fetch repos" });
  }
});

app.delete("/repos/:repoUrl", requireAuth, async (req, res) => {
  try {
    const userIdObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const repoUrl = decodeURIComponent(req.params.repoUrl);

    const result = await Chunk.deleteMany({
      userId: userIdObjectId,
      repoUrl: repoUrl,
    });

    res.json({
      message: "Repo deleted",
      chunksDeleted: result.deletedCount,
    });
  } catch (error) {
    console.error("Failed to delete repo:", error.message);
    res.status(500).json({ error: "Failed to delete repo" });
  }
});
startServer();