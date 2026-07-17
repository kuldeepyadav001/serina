#This file handles reading the PDF file and extracting text page-by-page.
from PyPDF2 import PdfReader


def extract_text_from_pdf(file_path: str) -> list[dict]:
    """
    Reads a PDF file page by page.
    Returns a list of dicts: [{"page_number": 1, "text": "..."}]
    """
    pages_data = []
    reader = PdfReader(file_path)

    for idx, page in enumerate(reader.pages):
        page_num = idx + 1
        text = page.extract_text() or ""
        text = text.strip()

        if text:
            pages_data.append({
                "page_number": page_num,
                "text": text
            })

    return pages_data