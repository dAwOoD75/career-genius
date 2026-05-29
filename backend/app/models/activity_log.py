from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    action = Column(String(100), nullable=False)    # e.g., "cv_analyzed", "resume_created"
    module = Column(String(50), nullable=False)      # e.g., "cv_analyzer", "resume_builder"
    description = Column(Text, nullable=True)
    extra_data = Column(JSON, default=dict)          # Additional context data
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activity_logs")

    def __repr__(self):
        return f"<ActivityLog(id={self.id}, action={self.action}, user_id={self.user_id})>"
