#This exposes the /documents/upload endpoint, saves files locally, and manages the ingestion pipeline.

import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_extractor import extract_text_from_pdf
from app.services.chunker import split_text_into_chunks
from app.services.embedder import embed_and_store_chunks

router = APIRouter(prefix="/documents")

UPLOAD_DIR = "/app/storage/uploads"


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Generate document ID and local file path
    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")

    try:
        # 1. Save uploaded file to disk
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # 2. Extract pages from PDF
        pages_data = extract_text_from_pdf(file_path)
        if not pages_data:
            raise HTTPException(status_code=400, detail="The PDF contains no readable text.")

        # 3. Create overlapping text chunks
        chunks = split_text_into_chunks(pages_data)

        # 4. Generate embeddings and save to Qdrant
        await embed_and_store_chunks(chunks, file.filename, doc_id)

        return {
            "status": "success",
            "document_id": doc_id,
            "filename": file.filename,
            "chunks_count": len(chunks)
        }

    except Exception as e:
        # Cleanup file if something failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")