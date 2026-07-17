#This coordinates calling Ollama to generate embeddings and storing those embeddings inside Qdrant as points.


import uuid
from qdrant_client.http.models import PointStruct
from app.clients.ollama import generate_embeddings
from app.clients.qdrant import store_vectors


async def embed_and_store_chunks(chunks: list[dict], filename: str, doc_id: str):
    """
    Takes text chunks, embeds each one async via Ollama,
    and upserts them into Qdrant.
    """
    points = []

    for idx, chunk in enumerate(chunks):
        # Generate the vector embedding
        vector = await generate_embeddings(chunk["text"])

        # Create unique ID for this specific chunk
        chunk_id = str(uuid.uuid4())

        # Build payload for metadata search later
        payload = {
            "document_id": doc_id,
            "filename": filename,
            "page_number": chunk["page_number"],
            "chunk_index": idx,
            "text": chunk["text"]
        }

        # Build structural Qdrant point
        points.append(
            PointStruct(
                id=chunk_id,
                vector=vector,
                payload=payload
            )
        )

    # Batch save vectors in Qdrant
    store_vectors(points)