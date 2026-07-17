#  ← session read/write logic
import uuid
from app.clients.redis import get_session, save_session, create_session
from app.config import settings


def get_or_create_session(session_id: str | None) -> tuple[str, dict]:
    """
    Returns (session_id, session_data).
    Creates new session if session_id is None or not found.
    """
    if session_id:
        session_data = get_session(session_id)
        if session_data:
            return session_id, session_data

    # Create new session
    new_id = str(uuid.uuid4())
    session_data = create_session()
    save_session(new_id, session_data)
    return new_id, session_data


def add_message(session_id: str, session_data: dict, role: str, content: str):
    """Add a message to session and save. Trims to max_history."""
    session_data["messages"].append({"role": role, "content": content})

    # Keep only last N messages
    max_msgs = settings.max_history * 2  # pairs of user + assistant
    if len(session_data["messages"]) > max_msgs:
        session_data["messages"] = session_data["messages"][-max_msgs:]

    save_session(session_id, session_data)