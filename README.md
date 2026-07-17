# DocuChat AI

A Dockerized conversational AI that chats naturally and answers questions from your uploaded PDFs.

## Stack

- **Frontend** — React + Vite + Tailwind
- **Backend** — FastAPI (Python)
- **LLM + Embeddings** — Ollama (local, no API key needed)
- **Vector DB** — Qdrant
- **Session Cache** — Redis
- **Reverse Proxy** — Nginx

## Quick Start

### 1. Clone the repo
git clone <your-repo-url>
cd docuchat-ai

### 2. Copy environment file
cp .env.example .env

### 3. Start infrastructure
docker-compose up -d ollama qdrant redis

### 4. Pull models
docker exec docuchat-ollama ollama pull qwen2.5:3b
docker exec docuchat-ollama ollama pull nomic-embed-text

### 5. Start everything
docker-compose up -d --build

### 6. Open
http://localhost

## Services

| Service  | URL                        |
|----------|----------------------------|
| App      | http://localhost           |
| API Docs | http://localhost/api/docs  |
| Qdrant   | http://localhost:6333      |
| Ollama   | http://localhost:11434     |

## Swap the LLM model

In `.env`:
CHAT_MODEL=mistral:7b

No code changes needed.