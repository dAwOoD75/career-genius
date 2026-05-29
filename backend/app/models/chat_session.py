from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class DifficultyLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class InterviewType(str, enum.Enum):
    technical = "technical"
    hr = "hr"
    behavioral = "behavioral"
    mixed = "mixed"


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), default="Interview Session")
    interview_type = Column(String(50), default="mixed")
    difficulty = Column(String(20), default="intermediate")
    job_role = Column(String(255), nullable=True)
    technology_stack = Column(String(500), nullable=True)

    # Session summary
    total_questions = Column(Integer, default=0)
    session_feedback = Column(Text, nullable=True)
    overall_score = Column(Integer, nullable=True)  # 0-100

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

    def __repr__(self):
        return f"<ChatSession(id={self.id}, type={self.interview_type})>"


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)

    role = Column(String(20), nullable=False)   # "user" or "assistant"
    content = Column(Text, nullable=False)
    feedback = Column(Text, nullable=True)       # AI feedback on user answer
    score = Column(Integer, nullable=True)        # Per-answer score 0-10
    question_type = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("ChatSession", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, role={self.role})>"
