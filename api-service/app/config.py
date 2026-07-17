from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Ollama
    ollama_url: str = "http://ollama:11434"
    chat_model: str = "qwen2.5:1.5b"
    embedding_model: str = "nomic-embed-text"

    # Qdrant
    qdrant_url: str = "http://qdrant:6333"
    collection_name: str = "pdf_chunks"

    # Redis
    redis_url: str = "redis://redis:6379"

    # Chunking & RAG
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k: int = 4

    # Session
    session_ttl: int = 3600
    max_history: int = 10

    class Config:
        env_file = ".env"


settings = Settings()