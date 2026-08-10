# RepoMind

**Stop grepping. Start asking.**

RepoMind is an AI-powered tool that lets you ask natural-language questions about any public GitHub repository and get answers grounded in the actual source code — with exact file and line citations for every claim, so you can verify what it tells you instead of blindly trusting it.

Built as a full-stack Retrieval-Augmented Generation (RAG) system, from scratch — no LangChain, no black-box frameworks. Every step of the pipeline (chunking, embeddings, vector search, prompting) is hand-built to understand and demonstrate exactly how it works.

## How It Works

1. **Paste a GitHub repo URL** — RepoMind recursively fetches every relevant code file
2. **Function-aware chunking** — code is split into meaningful pieces (not arbitrary character chunks), preserving context
3. **Embeddings** — each chunk is converted into a vector using Google's Gemini embedding model
4. **Vector storage & search** — chunks and their embeddings are stored in MongoDB Atlas Vector Search, scoped per repository
5. **Ask a question** — your question is embedded and matched against the stored chunks by *meaning*, not keywords
6. **Grounded answer generation** — the top matching chunks are fed to Gemini, which answers using *only* that retrieved code and cites the exact file/line source for every claim

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, shadcn/ui
**Backend:** Node.js, Express.js
**Database:** MongoDB Atlas (with native Vector Search)
**AI:** Google Gemini (embeddings + generation)

## Key Engineering Decisions

- **Hand-built RAG pipeline** — no LangChain or similar frameworks, to demonstrate deep understanding of retrieval, chunking, and prompt-grounding rather than relying on abstracted library calls
- **Function/class-aware chunking** — a custom chunker that preserves complete code logic per chunk, with a "leftover" capture mechanism ensuring no file content is silently dropped
- **Citation-enforced prompting** — the LLM is explicitly instructed to answer only from retrieved context and cite file/line sources, with a rule to admit uncertainty rather than hallucinate
- **Retry-with-backoff on rate limits** — automatically retries failed embedding calls with exponential backoff, rather than failing outright on transient API limits
- **Security-conscious design** — GitHub URL validation to prevent malformed/malicious input, rate limiting on API-cost-sensitive endpoints, and strict separation of secrets via environment variables

## Vector Search Configuration

MongoDB Atlas Vector Search index configuration:
- **Similarity metric:** Cosine similarity
- **Embedding dimensions:** 3072 (Gemini `gemini-embedding-001`)
- **Search parameters:** `numCandidates: 100`, `limit: 5` per query, filtered by `repoUrl` to scope results to the ingested repository

## Getting Started

### Prerequisites
- Node.js
- A MongoDB Atlas account (free tier works) with a Vector Search index configured
- A Google Gemini API key
- A GitHub personal access token

### Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`

Create a `.env` file in `backend/`:
\`\`\`
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
PORT=5050
\`\`\`

Run the backend:
\`\`\`bash
npm run dev
\`\`\`

### Frontend Setup
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Try It Yourself — Small Test Repos

RepoMind works on any public GitHub repo, but these are good small/quick options for testing without a long ingestion wait:

- `https://github.com/sindresorhus/is-online`
- `https://github.com/octocat/Spoon-Knife`
- `https://github.com/sindresorhus/query-string`
- `https://github.com/jonschlinkert/is-glob`
- `https://github.com/sindresorhus/p-limit`
- `https://github.com/lukeed/clsx`
- `https://github.com/sindresorhus/type-fest`
- `https://github.com/jaywcjlove/hotkeys-js`

## Performance Notes

Formal benchmarking is a planned next step. Based on manual testing with small-to-medium repos (10-15 chunks), query response time (embedding + vector search + LLM generation) is typically in the low single-digit seconds — dominated primarily by the Gemini generation call rather than the retrieval step.

## Known Limitations & Planned Improvements

- Ingestion currently runs synchronously; a background job queue (Redis/BullMQ) is planned for handling large repos without blocking
- Chunking uses a regex/brace-counting approach; upgrading to AST-based parsing (e.g. `@babel/parser`) would improve accuracy on complex syntax like arrow functions
- Confidence handling for "I don't know" responses is currently prompt-level only; a code-level similarity-score threshold would make this more robust
- Free-tier API rate limits (Gemini, MongoDB Atlas) constrain how large a repo can be ingested in one pass

## Resume Summary

**RepoMind — Full-Stack Codebase Q&A Engine (RAG)**

- Engineered a hand-built RAG pipeline using Node.js, Express, MongoDB Atlas Vector Search, and Google Gemini API, enabling natural-language code queries with exact file/line citation enforcement.
- Developed a custom function-aware code chunking algorithm with a fallback mechanism, preserving logical context across functions/classes and eliminating silently dropped code segments.
- Improved ingestion resilience by implementing exponential backoff retry logic for embedding calls and rate limiting on API-cost-sensitive endpoints to guard against upstream quota limits.
- Built a responsive frontend with React, Vite, Tailwind CSS, and shadcn/ui, streaming grounded AI answers alongside clickable source citations.

## Author

**Harmandeep Kour**
[GitHub](https://github.com/harmansscodefy)