const API_KEYS = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);
let currentKeyIndex = 0;

async function getEmbedding(text, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const apiKey = API_KEYS[currentKeyIndex];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/gemini-embedding-001",
          content: { parts: [{ text: text }] },
        }),
      }
    );

    if (response.status === 429) {
      // Try switching to the next available key before retrying/backing off
      if (currentKeyIndex < API_KEYS.length - 1) {
        currentKeyIndex++;
        console.log(`Key ${currentKeyIndex} rate limited, switching to key ${currentKeyIndex + 1}`);
        continue; // immediately retry with the new key, no wait needed
      }

      // All keys exhausted — fall back to normal backoff
      if (attempt < retries) {
        const waitTime = 1000 * Math.pow(2, attempt);
        console.log(`All keys rate limited, retrying in ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
    }

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding.values;
  }
}



/*//const GEMINI_API_KEY = process.env.GEMINI_API_KEY;//for production, use the main key(for showing in the demo). For development, use GEMINI_API_KEY_DEV.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY_2; // switched to key 2

async function getEmbedding(text, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
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

    if (response.status === 429 && attempt < retries) {
      const waitTime = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
      console.log(`Rate limited, retrying in ${waitTime}ms (attempt ${attempt + 1})`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      continue; // try again
    }

    if (!response.ok) {
  if (response.status === 429) {
    throw new Error(
      "Gemini API rate limit reached. This may be a short-term limit (wait a minute and retry) or your daily quota (resets at midnight Pacific Time). Check your usage at aistudio.google.com."
    );
  }
  throw new Error(`Gemini API error: ${response.status}`);
}
    const data = await response.json();
    return data.embedding.values;
  }
}*/

async function embedChunks(chunks) {
  const embeddedChunks = [];

  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk.code);
    embeddedChunks.push({ ...chunk, embedding: embedding });
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return embeddedChunks;
}
module.exports = { getEmbedding, embedChunks };