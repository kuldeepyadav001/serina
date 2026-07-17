from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models import ChatRequest, ChatResponse
from app.services.session import get_or_create_session, add_message
from app.services.llm import chat, chat_stream
from app.services.rag import rag_chat, rag_chat_stream

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    session_id, session_data = get_or_create_session(request.session_id)

    # Use document_id from request, or fall back to session
    active_docs = (
        [request.document_id]
        if request.document_id
        else session_data.get("active_document_ids", [])
    )

    if active_docs:
        result = await rag_chat(
            session_data["messages"],
            request.message,
            active_docs[0]
        )
        reply = result["reply"]
    else:
        reply = await chat(session_data["messages"], request.message)

    add_message(session_id, session_data, "user", request.message)
    add_message(session_id, session_data, "assistant", reply)

    return ChatResponse(reply=reply, session_id=session_id)


@router.post("/chat/stream")
async def chat_stream_endpoint(request: ChatRequest):
    session_id, session_data = get_or_create_session(request.session_id)

    # Use document_id from request, or fall back to session
    active_docs = (
        [request.document_id]
        if request.document_id
        else session_data.get("active_document_ids", [])
    )

    collected_reply = []
    collected_sources = []

    async def stream_general():
        async for chunk in chat_stream(session_data["messages"], request.message):
            collected_reply.append(chunk)
            yield chunk

        full_reply = "".join(collected_reply)
        add_message(session_id, session_data, "user", request.message)
        add_message(session_id, session_data, "assistant", full_reply)

    async def stream_rag():
        import json
        full_text = []

        async for chunk in rag_chat_stream(
            session_data["messages"],
            request.message,
            active_docs[0]
        ):
            if chunk.startswith("__SOURCES__"):
                sources_json = chunk.replace("__SOURCES__", "")
                collected_sources.extend(json.loads(sources_json))
            else:
                full_text.append(chunk)
                yield chunk

        full_reply = "".join(full_text)
        add_message(session_id, session_data, "user", request.message)
        add_message(session_id, session_data, "assistant", full_reply)

        if collected_sources:
            yield f"\n__SOURCES__{json.dumps(collected_sources)}"

    stream_fn = stream_rag if active_docs else stream_general

    return StreamingResponse(
        stream_fn(),
        media_type="text/plain",
        headers={"X-Session-Id": session_id},
    )