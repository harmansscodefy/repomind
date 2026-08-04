const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function getEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text: text }] },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

// Takes an array of chunks and returns the SAME chunks, each with an
// "embedding" field added — ready to be saved to MongoDB
async function embedChunks(chunks) {
  const embeddedChunks = [];

  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk.code);
    embeddedChunks.push({
      ...chunk,
      embedding: embedding,
    });
  }

  return embeddedChunks;
}

module.exports = { getEmbedding, embedChunks };