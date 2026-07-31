#This exposes the /documents/upload endpoint, saves files locally, and manages the ingestion pipeline.
import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.chunker import split_text_into_chunks
from app.services.embedder import embed_and_store_chunks
from uuid import uuid4
from uuid import UUID
from app.clients.postgres import (
    get_all_documents_from_db,
    get_document_by_id,
    delete_document_from_db,
)
from app.clients.qdrant import qdrant_client
from qdrant_client.http import models as qdrant_models
from app.clients.postgres import (
    create_document_in_db,
    update_document_status,
)
from app.config import settings

router = APIRouter(prefix="/documents")

UPLOAD_DIR = "/app/storage/uploads"


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # Step 1: Validate PDF format
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Step 2: Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Step 3-4: Read file and get size
    file_bytes = await file.read()
    file_size = len(file_bytes)

    # Step 5-6: Generate UUID and build path
    new_id = uuid4()
    file_path = os.path.join(UPLOAD_DIR, f"{new_id}.pdf")

    # Step 7: Save file to disk
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Step 8: Create Document row (status="processing")
    document = create_document_in_db(
        id=new_id,
        filename=file.filename,
        file_path=file_path,
        file_size=file_size,
    )

    # Steps 9-16: Try processing, handle failure
    try:
        # Step 9: Extract pages from PDF
        pages_data = extract_text_from_pdf(file_path)
        if not pages_data:
            raise ValueError("The PDF contains no readable text.")

        # Step 10: Chunk text
        chunks = split_text_into_chunks(pages_data)

        # Step 11: Embed and store in Qdrant
        await embed_and_store_chunks(chunks, file.filename, str(new_id))

        # Step 12: Update Document → ready
        update_document_status(
            document_id=new_id,
            status="ready",
            chunks_count=len(chunks),
        )

        # Step 13: Return document data
        return {
            "id": str(new_id),
            "filename": document.filename,
            "file_size": document.file_size,
            "chunks_count": len(chunks),
            "status": "ready",
            "created_at": document.created_at.isoformat(),
        }

    except Exception as e:
        # Step 14: Update Document → failed
        update_document_status(
            document_id=new_id,
            status="failed",
            error_message=str(e),
        )

        # Step 15: Delete file from disk
        if os.path.exists(file_path):
            os.remove(file_path)

        # Step 16: Return error
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
    
    
@router.get("")
async def list_documents():
    documents = get_all_documents_from_db()
    return [
        {
            "id": str(doc.id),
            "filename": doc.filename,
            "file_size": doc.file_size,
            "chunks_count": doc.chunks_count,
            "status": doc.status,
            "error_message": doc.error_message,
            "created_at": doc.created_at.isoformat(),
        }
        for doc in documents
    ]
    
@router.delete("/{document_id}")
async def delete_document(document_id: UUID):
    # 1. Fetch document
    doc = get_document_by_id(document_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 2. Delete Qdrant chunks
    try:
        qdrant_client.delete(
            collection_name=settings.collection_name,
            points_selector=qdrant_models.FilterSelector(
                filter=qdrant_models.Filter(
                    must=[
                        qdrant_models.FieldCondition(
                            key="document_id",
                            match=qdrant_models.MatchValue(value=str(document_id)),
                        )
                    ]
                )
            ),
        )
    except Exception as e:
        print(f"Warning: Qdrant delete failed: {e}")
    
    # 3. Delete file from disk
    try:
        os.remove(doc.file_path)
    except Exception as e:
        print(f"Warning: File delete failed: {e}")
    
    # 4. Delete Postgres row
    delete_document_from_db(document_id)
    
    return {"status": "deleted", "id": str(document_id)}