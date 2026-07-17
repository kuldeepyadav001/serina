from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    document_id: str | None = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str


class HealthResponse(BaseModel):
    status: str
    ollama: str
    qdrant: str
    redis: str