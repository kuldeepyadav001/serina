from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

from app.config import settings
from app.models import HealthResponse
from app.routers.chat import router as chat_router
from app.routers.documents import router as doc_router

app = FastAPI(
    title="DocuChat AI",
    description="Conversational AI with PDF intelligence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(chat_router)
app.include_router(doc_router)  # <--- Mounted document endpoints


@app.get("/health", response_model=HealthResponse)
async def health_check():
    ollama_status = "unhealthy"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.ollama_url}/api/tags",
                timeout=5.0,
            )
            if response.status_code == 200:
                ollama_status = "healthy"
    except Exception:
        pass

    qdrant_status = "unhealthy"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.qdrant_url}/healthz",
                timeout=5.0,
            )
            if response.status_code == 200:
                qdrant_status = "healthy"
    except Exception:
        pass

    redis_status = "unhealthy"
    try:
        import redis
        r = redis.from_url(settings.redis_url)
        r.ping()
        redis_status = "healthy"
    except Exception:
        pass

    overall = (
        "healthy"
        if all(s == "healthy" for s in [ollama_status, qdrant_status, redis_status])
        else "degraded"
    )

    return HealthResponse(
        status=overall,
        ollama=ollama_status,
        qdrant=qdrant_status,
        redis=redis_status,
    )