#   → knows about prompt building and model logic
#   → does NOT know about HTTP or FastAPI
#   ← abstraction layer over ollama client

from app.clients.ollama import generate_chat_response, generate_chat_stream

SYSTEM_PROMPT = (
    "You are DocuChat AI — a helpful, friendly, and natural conversational assistant. "
    "Answer clearly and concisely. If you don't know something, say so honestly."
)


def build_messages(history: list[dict], user_message: str) -> list[dict]:
    """Build the message list for Ollama: system + history + new message."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})
    return messages


async def chat(history: list[dict], user_message: str) -> str:
    """Non-streaming chat. Returns full response."""
    messages = build_messages(history, user_message)
    return await generate_chat_response(messages, stream=False)


async def chat_stream(history: list[dict], user_message: str):
    """Streaming chat. Yields text chunks."""
    messages = build_messages(history, user_message)
    async for chunk in generate_chat_stream(messages):
        yield chunk