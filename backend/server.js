require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// --- Middleware ---
app.use(cors());          // allows your frontend (different port) to talk to this server
app.use(express.json());  // parses incoming JSON request bodies into req.body

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

const { parseGithubUrl, walkRepo } = require("./services/githubservice");
const { chunkFiles } = require("./services/chunkingService");
const { embedChunks } = require("./services/embeddingService");

app.get("/test-embedding", async (req, res) => {
  try {
    const { owner, repo } = parseGithubUrl("https://github.com/sindresorhus/is-online");
    const files = await walkRepo(owner, repo);
    const chunks = chunkFiles(files);

    // To keep this test FAST and cheap, only embed the first 3 chunks
    const testChunks = chunks.slice(0, 3);
    const embedded = await embedChunks(testChunks);

    res.json({
      totalChunks: chunks.length,
      testedChunks: embedded.length,
      sample: {
        fileName: embedded[0].fileName,
        embeddingLength: embedded[0].embedding.length,
        first5Numbers: embedded[0].embedding.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
startServer();