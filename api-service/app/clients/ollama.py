#   → knows how to call Ollama's API
#   → does NOT know about chat logic
#    ← talks to Ollama API

import httpx
import json
from app.config import settings


def build_prompt(messages: list[dict]) -> str:
    """Convert messages array to a single prompt string."""
    prompt = ""
    for msg in messages:
        role = msg["role"].capitalize()
        prompt += f"{role}: {msg['content']}\n"
    prompt += "Assistant:"
    return prompt


async def generate_chat_response(messages: list[dict], stream: bool = False) -> str:
    """Calls Ollama /api/generate endpoint."""
    prompt = build_prompt(messages)

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.ollama_url}/api/generate",
            json={
                "model": settings.chat_model,
                "prompt": prompt,
                "stream": False,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["response"]


async def generate_chat_stream(messages: list[dict]):
    """Streams Ollama /api/generate response chunk by chunk."""
    prompt = build_prompt(messages)

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            f"{settings.ollama_url}/api/generate",
            json={
                "model": settings.chat_model,
                "prompt": prompt,
                "stream": True,
            },
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line:
                    chunk = json.loads(line)
                    if "response" in chunk:
                        yield chunk["response"]
                        
async def generate_embeddings(text: str) -> list[float]:
    """Generates a 768-dimensional embedding vector for the given text."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.ollama_url}/api/embeddings",
            json={
                "model": settings.embedding_model,
                "prompt": text,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["embedding"]                        