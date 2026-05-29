from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SalaryPrediction(Base):
    __tablename__ = "salary_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Input parameters
    job_title = Column(String(255), nullable=False)
    experience_years = Column(Float, nullable=False)
    country = Column(String(100), nullable=False)
    city = Column(String(100), nullable=True)
    education_level = Column(String(100), nullable=True)
    skills = Column(JSON, default=list)
    industry = Column(String(100), nullable=True)
    company_size = Column(String(50), nullable=True)

    # Prediction results
    predicted_min = Column(Float, nullable=True)
    predicted_max = Column(Float, nullable=True)
    predicted_median = Column(Float, nullable=True)
    currency = Column(String(10), default="USD")

    # Analysis
    market_insights = Column(Text, nullable=True)
    skill_impact = Column(JSON, default=dict)       # How each skill affects salary
    location_factor = Column(Float, nullable=True)
    experience_factor = Column(Float, nullable=True)
    comparable_roles = Column(JSON, default=list)   # Similar roles and their salaries
    growth_projection = Column(JSON, default=dict)  # 1/3/5 year salary projections

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="salary_predictions")

    def __repr__(self):
        return f"<SalaryPrediction(id={self.id}, job={self.job_title}, median={self.predicted_median})>"
