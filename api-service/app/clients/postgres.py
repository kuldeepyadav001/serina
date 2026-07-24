from sqlmodel import SQLModel, Session, create_engine, select
from uuid import UUID
from app.config import settings
from app.models.database import ChatSession, Message ,Document  # noqa: F401

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


def create_document_in_db(
    id: UUID,                    # ← NEW parameter
    filename: str,
    file_path: str,
    file_size: int,
) -> Document:
    with Session(engine) as db:
        new_document = Document(
            id=id,               # ← pass it explicitly instead of letting DB generate
            filename=filename,
            file_path=file_path,
            file_size=file_size,
             chunks_count=0, 
            status="processing"
        )
        db.add(new_document)
        db.commit()
        db.refresh(new_document)
        return new_document

def update_document_status(
    document_id: UUID,
    status: str,
    chunks_count: int = 0,
    error_message: str | None = None,
) -> None:
    """Updates a document's status after processing."""    
    with Session(engine) as db:
        new=db.get(Document,document_id)
        if not new:
            return
        new.status=status;
        if chunks_count is not None:
            new.chunks_count=chunks_count
        if error_message is not None:
            new.error_message=error_message
            
        db.add(new)
        db.commit()
        
def get_all_documents_from_db() -> list[Document]:
    """Returns all documents, newest first."""
    with Session(engine) as db: 
        doc=select(Document).order_by(Document.created_at.desc())
        return db.exec(doc).all()


def delete_document_from_db(document_id: UUID) -> bool:
    """Deletes a document row. Returns True if deleted."""
    with Session(engine) as db:
        doc = db.get(Document, document_id)
        if not doc:
            return False
        db.delete(doc)       
        db.commit()
        return True