from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ATSReport(Base):
    __tablename__ = "ats_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)

    # Uploaded file info
    original_filename = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    job_description = Column(Text, nullable=True)

    # ATS Scores
    overall_score = Column(Float, default=0.0)
    keyword_score = Column(Float, default=0.0)
    format_score = Column(Float, default=0.0)
    readability_score = Column(Float, default=0.0)
    completeness_score = Column(Float, default=0.0)

    # Analysis Results (JSON)
    matched_keywords = Column(JSON, default=list)
    missing_keywords = Column(JSON, default=list)
    skill_gaps = Column(JSON, default=list)
    formatting_issues = Column(JSON, default=list)
    improvement_suggestions = Column(JSON, default=list)
    extracted_skills = Column(JSON, default=list)
    extracted_experience = Column(JSON, default=list)
    section_analysis = Column(JSON, default=dict)

    # Raw extracted text
    extracted_text = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="ats_reports")
    resume = relationship("Resume", back_populates="ats_reports")

    def __repr__(self):
        return f"<ATSReport(id={self.id}, score={self.overall_score}, user_id={self.user_id})>"
