#  ← talks to Redis
import json
import redis
from app.config import settings

redis_client = redis.from_url(settings.redis_url, decode_responses=True)


def get_session(session_id: str) -> dict | None:
    """Get session data from Redis."""
    data = redis_client.get(f"session:{session_id}")
    if data:
        return json.loads(data)
    return None


def save_session(session_id: str, session_data: dict):
    """Save session data to Redis with TTL."""
    redis_client.setex(
        f"session:{session_id}",
        settings.session_ttl,
        json.dumps(session_data),
    )


def create_session() -> dict:
    """Create a new empty session structure."""
    return {
        "messages": [],
        "active_document_ids": [],
        "mode": "general",
    }