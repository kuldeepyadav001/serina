# This service splits our raw pages of text into manageable chunks. It respects page numbers and carries page metadata with every chunk.

from app.config import settings


def split_text_into_chunks(pages_data: list[dict]) -> list[dict]:
    """
    Splits text into chunks of CHUNK_SIZE with CHUNK_OVERLAP.
    Carries metadata (page_number) forward.
    """
    chunks = []
    chunk_size = settings.chunk_size
    overlap = settings.chunk_overlap

    for page in pages_data:
        text = page["text"]
        page_num = page["page_number"]
        start = 0

        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]

            chunks.append({
                "text": chunk_text,
                "page_number": page_num
            })

            # Move start point forward by (size - overlap)
            start += (chunk_size - overlap)

    return chunks