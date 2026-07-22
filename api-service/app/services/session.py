#  ← session read/write logic
import uuid
from app.clients.redis import get_session, save_session, create_session
from app.config import settings
from app.clients.postgres import get_messages_from_db, create_session_in_db ,save_message_to_db
from app.models.database import ChatSession, Message  # noqa: F401
from uuid import UUID
def get_or_create_session(session_id: str | None) -> tuple[str, dict]:
    # Case 1: session_id provided
    if session_id:
        # Try Redis first (fast)
        try:
            session_data = get_session(session_id)
            if session_data:
                return session_id, session_data
        except Exception as e:
            print(f"Warning: Redis cache lookup failed: {e}")   
        # Cache miss — try Postgres
        messages = get_messages_from_db(UUID(session_id))
        if messages:
            # Rebuild session_data from Postgres
            session_data = create_session()
            session_data["messages"] = [
                {"role": m.role, "content": m.content}
                for m in messages
            ]
            # Warm the cache
            save_session(session_id, session_data)
            return session_id, session_data
    
    # Case 2: no session_id — create new
    new_chat_session = create_session_in_db()
    new_id = str(new_chat_session.id)
    session_data = create_session()
    save_session(new_id, session_data)
    return new_id, session_data


def add_message(
    session_id: str,
    session_data: dict,
    role: str,
    content: str,
    mode: str = "general",
    document_id: str | None = None,
):
    # 1. Save to Postgres (source of truth)
    save_message_to_db(
        session_id=UUID(session_id),
        role=role,
        content=content,
        mode=mode,
        document_id=document_id,
    )
    
    # Redis — optional cache, fail gracefully
    try:
        session_data["messages"].append({"role": role, "content": content})
        max_msgs = settings.max_history * 2
        if len(session_data["messages"]) > max_msgs:
            session_data["messages"] = session_data["messages"][-max_msgs:]
        save_session(session_id, session_data)
    except Exception as e:
        print(f"Warning: Redis cache update failed: {e}")