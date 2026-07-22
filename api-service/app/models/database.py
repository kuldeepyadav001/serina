from sqlmodel import SQLModel, Field
from uuid import uuid4, UUID
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as SQLUUID

class ChatSession(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    title: str = "New Chat"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)




class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: UUID = Field(
    sa_column=Column(
        SQLUUID(as_uuid=True),
        ForeignKey("chatsession.id", ondelete="CASCADE"),
        nullable=False,
    )
    )
    role: str
    content: str
    mode: str = "general"
    document_id: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)