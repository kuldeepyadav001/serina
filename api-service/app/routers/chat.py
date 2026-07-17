#   → knows about HTTP requests/responses
#   → does NOT know how Ollama works
#   ← /chat endpoint
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models import ChatRequest, ChatResponse
from app.services.session import get_or_create_session, add_message
from app.services.llm import chat, chat_stream

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Non-streaming chat endpoint."""
    session_id, session_data = get_or_create_session(request.session_id)

    # Get response from LLM
    reply = await chat(session_data["messages"], request.message)

    # Save both messages to session
    add_message(session_id, session_data, "user", request.message)
    add_message(session_id, session_data, "assistant", reply)

    return ChatResponse(reply=reply, session_id=session_id)


@router.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    """Streaming chat endpoint."""
    session_id, session_data = get_or_create_session(request.session_id)

    collected_reply = []

    async def stream_response():
        async for chunk in chat_stream(session_data["messages"], request.message):
            collected_reply.append(chunk)
            yield chunk

        # After streaming completes, save to session
        full_reply = "".join(collected_reply)
        add_message(session_id, session_data, "user", request.message)
        add_message(session_id, session_data, "assistant", full_reply)

    return StreamingResponse(
        stream_response(),
        media_type="text/plain",
        headers={"X-Session-Id": session_id},
    )