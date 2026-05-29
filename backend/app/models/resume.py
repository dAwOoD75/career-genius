from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    template = Column(String(50), default="modern")
    is_primary = Column(Boolean, default=False)

    # Personal Info
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    location = Column(String(200), nullable=True)
    linkedin = Column(String(500), nullable=True)
    github = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    summary = Column(Text, nullable=True)

    # Structured Sections (stored as JSON)
    experience = Column(JSON, default=list)      # List of work experience dicts
    education = Column(JSON, default=list)        # List of education dicts
    skills = Column(JSON, default=list)           # List of skill strings
    certifications = Column(JSON, default=list)   # List of certification dicts
    projects = Column(JSON, default=list)         # List of project dicts
    languages = Column(JSON, default=list)        # List of language dicts
    awards = Column(JSON, default=list)           # List of award dicts

    # AI generated content
    ai_summary = Column(Text, nullable=True)

    # Metadata
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="resumes")
    ats_reports = relationship("ATSReport", back_populates="resume", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Resume(id={self.id}, title={self.title}, user_id={self.user_id})>"
