from app.clients.ollama import generate_embeddings
from app.clients.qdrant import qdrant_client
from app.config import settings

RAG_SYSTEM_PROMPT = """You are Serina — a friendly and helpful AI assistant.
Answer the user's question naturally and conversationally using the document context below.
When you reference specific information, mention the page number casually like 'on page 3' or 'according to page 5'.
Keep answers concise and human. If the answer is not in the context, say so honestly."""


def build_rag_prompt(chunks: list[dict], history: list[dict], question: str) -> str:
    """Build a prompt string with document context + history + question."""
    # Build context section
    context_lines = []
    for chunk in chunks:
        page = chunk["page_number"]
        text = chunk["text"]
        context_lines.append(f"[Page {page}]\n{text}")

    context = "\n\n".join(context_lines)

    # Build history section
    history_text = ""
    for msg in history[-6:]:  # last 3 pairs
        role = msg["role"].capitalize()
        history_text += f"{role}: {msg['content']}\n"

    prompt = f"""{RAG_SYSTEM_PROMPT}

--- DOCUMENT CONTEXT ---
{context}

--- CONVERSATION HISTORY ---
{history_text}
--- CURRENT QUESTION ---
User: {question}

Answer:"""

    return prompt


async def retrieve_chunks(question: str, document_id: str) -> list[dict]:
    """Embed question and search Qdrant for relevant chunks."""
    # Embed the question
    question_vector = await generate_embeddings(question)

    # Search Qdrant — filter by document_id
    results = qdrant_client.search(
        collection_name=settings.collection_name,
        query_vector=question_vector,
        limit=settings.top_k,
        query_filter={
            "must": [
                {
                    "key": "document_id",
                    "match": {"value": document_id}
                }
            ]
        },
        with_payload=True,
    )

    # Extract payload from results
    chunks = []
    for result in results:
        chunks.append({
            "text": result.payload["text"],
            "page_number": result.payload["page_number"],
            "filename": result.payload["filename"],
            "score": result.score,
        })

    return chunks


async def rag_chat(history: list[dict], question: str, document_id: str) -> dict:
    """Non-streaming RAG response."""
    chunks = await retrieve_chunks(question, document_id)

    if not chunks:
        return {
            "reply": "I could not find relevant information in the uploaded document.",
            "sources": []
        }

    prompt = build_rag_prompt(chunks, history, question)

    # Use generate directly with our built prompt
    import httpx
    from app.config import settings as cfg

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{cfg.ollama_url}/api/generate",
            json={
                "model": cfg.chat_model,
                "prompt": prompt,
                "stream": False,
            },
        )
        response.raise_for_status()
        reply = response.json()["response"]

    # Build sources list for citations
    sources = []
    seen_pages = set()
    for chunk in chunks:
        page = chunk["page_number"]
        if page not in seen_pages:
            sources.append({
                "filename": chunk["filename"],
                "page": page,
            })
            seen_pages.add(page)

    return {"reply": reply, "sources": sources}


async def rag_chat_stream(history: list[dict], question: str, document_id: str):
    """Streaming RAG response. Yields text chunks then sources."""
    chunks = await retrieve_chunks(question, document_id)

    if not chunks:
        yield "I could not find relevant information in the uploaded document."
        return

    prompt = build_rag_prompt(chunks, history, question)

    import httpx
    import json
    from app.config import settings as cfg

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            f"{cfg.ollama_url}/api/generate",
            json={
                "model": cfg.chat_model,
                "prompt": prompt,
                "stream": True,
            },
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line:
                    chunk_data = json.loads(line)
                    if "response" in chunk_data:
                        yield chunk_data["response"]

    # Build sources list
    sources = []
    seen_pages = set()
    for chunk in chunks:
        page = chunk["page_number"]
        if page not in seen_pages:
            sources.append({
                "filename": chunk["filename"],
                "page": page,
            })
            seen_pages.add(page)

    # Yield sources as a special marker at the end
    yield f"\n\n__SOURCES__{json.dumps(sources)}"