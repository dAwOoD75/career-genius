from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False, default="My Cover Letter")
    company_name = Column(String(255), nullable=True)
    job_title = Column(String(255), nullable=True)
    job_description = Column(Text, nullable=True)
    applicant_name = Column(String(255), nullable=True)
    tone = Column(String(50), default="professional")  # professional, friendly, enthusiastic

    content = Column(Text, nullable=False)
    file_path = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="cover_letters")

    def __repr__(self):
        return f"<CoverLetter(id={self.id}, title={self.title})>"
