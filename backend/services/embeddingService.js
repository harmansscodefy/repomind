// ============================================================
// embeddingService.js
// ============================================================
// WHAT CHANGED FROM THE ORIGINAL VERSION:
// - OLD: getEmbedding(text) sent ONE HTTP request per chunk of code.
//        Ingesting a 104-chunk repo meant 104 separate API calls,
//        which blew through Gemini's per-minute rate limit and
//        caused "Gemini API error: 429" during large-repo ingestion.
// - NEW: getBatchEmbeddings(texts) sends up to 20 chunks in a SINGLE
//        HTTP request using Gemini's batchEmbedContents endpoint.
//        A 104-chunk repo now takes ~6 requests instead of 104.
// - getEmbedding(text) still exists (used by /query for embedding
//   a single user question) but is now just a thin wrapper that
//   calls getBatchEmbeddings with a "batch of one" — so /query
//   didn't need any changes in server.js.
// - Key rotation (switching from GEMINI_API_KEY to GEMINI_API_KEY_2
//   on a 429) was preserved from the original and now applies at
//   the batch level instead of the per-chunk level.
// ============================================================

// Two Gemini API keys, used as fallbacks for each other.
// .filter(Boolean) drops GEMINI_API_KEY_2 from the array if it's
// not set in your environment, so this works fine with just one key too.
const API_KEYS = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);

// Tracks which key we're currently using. Starts at the first key (index 0)
// and only moves forward (never resets) once a key gets rate-limited.
let currentKeyIndex = 0;

// How many chunks to send to Gemini in a single batch request.
// 20 is a safe middle ground: large enough to cut request count
// way down, small enough to avoid hitting any single-request size limits.
const BATCH_SIZE = 20;

// ------------------------------------------------------------
// getBatchEmbeddings(texts, retries)
// ------------------------------------------------------------
// Sends an ARRAY of text strings to Gemini's batchEmbedContents
// endpoint in ONE HTTP request, and gets back an array of
// embeddings in the same order. This is the core fix for the
// rate-limit bug — one network call handles many chunks at once
// instead of one call per chunk.
//
// Handles two kinds of failure automatically:
//   1. If the CURRENT key is rate-limited (429) and we have another
//      key available, switch to the next key and retry immediately
//      (no waiting needed — it's a fresh key with its own quota).
//   2. If ALL keys are rate-limited, fall back to exponential
//      backoff (wait 1s, then 2s, then 4s between retries) before
//      giving up after `retries` attempts.
async function getBatchEmbeddings(texts, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const apiKey = API_KEYS[currentKeyIndex];

    // Single request carrying ALL texts in this batch —
    // this replaces what used to be one request per chunk.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Gemini's batch endpoint wants an array of individual
          // "requests," one per text, even though they all travel
          // together in this one HTTP call.
          requests: texts.map((text) => ({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text }] },
          })),
        }),
      }
    );

    if (response.status === 429) {
      // Case 1: we have another key we haven't tried yet — switch and retry now.
      if (currentKeyIndex < API_KEYS.length - 1) {
        currentKeyIndex++;
        console.log(`Key ${currentKeyIndex} rate limited, switching to key ${currentKeyIndex + 1}`);
        continue; // loop back immediately with the new key, no delay
      }

      // Case 2: every key is rate-limited — back off and try again.
      if (attempt < retries) {
        const waitTime = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
        console.log(`All keys rate limited, retrying batch in ${waitTime}ms`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
    }

    if (!response.ok) {
      throw new Error(`Gemini batch API error: ${response.status}`);
    }

    const data = await response.json();
    // Gemini returns embeddings in the SAME ORDER as the texts we sent,
    // so embeddings[i] corresponds to texts[i].
    return data.embeddings.map((e) => e.values);
  }
}

// ------------------------------------------------------------
// getEmbedding(text)
// ------------------------------------------------------------
// Embeds a SINGLE piece of text (used by /query to embed the
// user's typed question, which is always just one string).
//
// This didn't exist as a separate implementation before — it's
// now just a "batch of one" wrapper around getBatchEmbeddings,
// so /query keeps working exactly as before with zero changes
// needed in server.js (same function name, same signature).
async function getEmbedding(text) {
  const [embedding] = await getBatchEmbeddings([text]);
  return embedding;
}

// ------------------------------------------------------------
// embedChunks(chunks)
// ------------------------------------------------------------
// Takes ALL the chunks from one repo ingestion and embeds them,
// BATCH BY BATCH instead of one at a time.
//
// OLD behavior: looped over every chunk individually, calling
// getEmbedding() once per chunk (104 chunks = 104 API calls).
//
// NEW behavior: slices the chunks into groups of BATCH_SIZE (20),
// and calls getBatchEmbeddings() once per group (104 chunks =
// ~6 API calls: 5 full batches of 20 + 1 partial batch of 4).
async function embedChunks(chunks) {
  const embeddedChunks = [];

  // Walk through the chunks array in steps of BATCH_SIZE,
  // e.g. for 104 chunks: 0, 20, 40, 60, 80, 100
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    // Grab the next 20 chunks (or fewer, if we're at the end of the array)
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((chunk) => chunk.code);

    // One network call embeds this entire batch at once
    const embeddings = await getBatchEmbeddings(texts);

    // Match each chunk back up with its corresponding embedding
    // (same order as the batch array, per Gemini's response guarantee)
    batch.forEach((chunk, index) => {
      embeddedChunks.push({ ...chunk, embedding: embeddings[index] });
    });

    // Small pause BETWEEN batches (not between every single chunk
    // like the old version did) — just enough breathing room to
    // stay comfortably under the rate limit without slowing things
    // down unnecessarily. Skipped after the very last batch.
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return embeddedChunks;
}

// Both functions are exported because both are used elsewhere:
// - getEmbedding  -> used by /query (embedding one question)
// - embedChunks   -> used by /ingest (embedding all chunks of a repo)
module.exports = { getEmbedding, embedChunks };