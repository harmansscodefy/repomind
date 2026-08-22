RepoMind — Full-Stack Codebase Q&A Engine (RAG)
Stop grepping. Start asking.

An end-to-end, hand-built Retrieval-Augmented Generation (RAG) platform that transforms any public GitHub repository into an interactive, context-aware AI knowledge base — delivering answer citations down to the exact file path and line number.

💡 System Architecture
RepoMind operates on a custom-engineered pipeline built completely from scratch without black-box frameworks like LangChain. Every step—from recursion to vector scoring—is controlled natively in Node.js.
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────────────┐
│  GitHub Public  │ ──> │ Custom Ingestion Engine │ ──> │ Function-Aware Chunking │
│   Repository    │     │  (Recursive Crawling)│     │  (AST/Brace Fallback)  │
└─────────────────┘     └──────────────────────┘     └────────────────────────┘
                                                                 │
                                                                 ▼
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────────────┐
│  Grounded Answer│ <── │ Google Gemini API    │ <── │ MongoDB Atlas Vector   │
│ + Source Lines  │     │ (Citation Prompting) │     │ Search (3072 dims)     │
└─────────────────┘     └──────────────────────┘     └────────────────────────┘
🛠️ Key Technical Features
Custom Ingestion & Chunking Pipeline: Recursively traverses directory structures, stripping non-code assets while preserving multi-file code hierarchies. Uses a custom function-aware chunking algorithm with brace-level fallbacks to preserve syntactic context.
Semantic Vector Retrieval: Converts code blocks into high-density vector representations using Google Gemini embeddings (gemini-embedding-001), performing cosine similarity queries within MongoDB Atlas.
Strict Citation & Hallucination Defense: Utilizes citation-enforced system prompts that restrict output strictly to retrieved context chunks, outputting exact file locations and line counts for zero-trust verification.
Resilient Infrastructure: Implements exponential backoff retries on rate-sensitive LLM endpoints and isolated per-repo workspace scoping.
⚡ Tech Stack
Layer	Technology
Frontend	React, Vite, Tailwind CSS, shadcn/ui
Backend	Node.js, Express.js, JWT Authentication
Vector DB	MongoDB Atlas Native Vector Search
AI Models	Google Gemini (gemini-embedding-001 + gemini-1.5-pro)
Cloud/DevOps	Microsoft Azure App Service, GitHub Actions (CI/CD)
📊 Vector Index Configuration
Engine: MongoDB Atlas Vector Search
Similarity Metric: Cosine Similarity
Vector Dimensions: 3072
Search Execution: Top-k nearest neighbors (numCandidates: 100, limit: 5), dynamically filtered by repository namespace (repoUrl).
🧪 Quick Test Repositories
Because the system runs on API-managed free tiers, try these lightweight repositories for quick evaluation:
sindresorhus/is-online
octocat/Spoon-Knife
lukeed/clsx
sindresorhus/p-limit
🚀 Getting Started
Prerequisites
Node.js (v18+)
MongoDB Atlas Cluster with Vector Index enabled
Gemini API Key & GitHub Access Token
Local Setup
Bash
# 1. Clone repository
git clone https://github.com/your-username/repomind.git
cd repomind

# 2. Configure Backend
cd backend
npm install
Create a .env file in /backend:
Code snippet
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
PORT=5050
Bash
# Run Backend
npm run dev

# 3. Configure Frontend
cd ../frontend
npm install
npm run dev
🧠 Engineering Trade-Offs & Roadmap
Async Queue Processing: Currently processing ingestion synchronously. Transitioning to Redis + BullMQ to handle large-scale repository ingestion asynchronously without hitting gateway timeouts.
AST Parsing: Upgrading from brace-counting regex splitting to full AST parsing via @babel/parser for improved syntax resolution on modern asynchronous JavaScript/TypeScript.
Similarity Thresholding: Introducing hard dynamic cosine similarity score cutoffs to enforce programmatic "Insufficient Context" guardrails before calling the generation model.
Author: Harmandeep Kour — GitHub Profile
