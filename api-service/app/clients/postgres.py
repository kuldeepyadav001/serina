from sqlmodel import SQLModel, Session, create_engine, select
from uuid import UUID
from app.config import settings
from app.models.database import ChatSession, Message  # noqa: F401

engine = create_engine(settings.postgres_url)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
        
 

def save_message_to_db(
    session_id: UUID,
    role: str,
    content: str,
    mode: str = "general",
    document_id: str | None = None,
) -> Message:
    """Save a message to Postgres. Returns the created Message with DB-assigned id."""
    with Session(engine) as db:
        # Create the Message object
        new_message = Message(
            session_id=session_id,
            role=role,
            content=content,
            mode=mode,
            document_id=document_id,
        )
        
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        
        return new_message



def get_messages_from_db(session_id: UUID, limit: int = 20) -> list[Message]:
    """Read last N messages for a session, ordered chronologically."""
    with Session(engine) as db:
 
        statement=select(Message).where(Message.session_id == session_id).order_by(Message.created_at).limit(limit)
      
        results = db.exec(statement).all()
        
        return results
    


def create_session_in_db(title: str = "New Chat") -> ChatSession:
    """Create a new chat session in Postgres. Returns the created session with DB-assigned id."""
    with Session(engine) as db:
        new_session = ChatSession(title=title)
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return new_session
    