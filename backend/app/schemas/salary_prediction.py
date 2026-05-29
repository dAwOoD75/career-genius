from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


class SalaryPredictionCreate(BaseModel):
    job_title: str
    experience_years: float
    country: str = "Pakistan"
    city: Optional[str] = None
    education_level: Optional[str] = None
    skills: Optional[List[str]] = []
    industry: Optional[str] = None
    company_size: Optional[str] = None

    @field_validator("experience_years")
    @classmethod
    def validate_experience(cls, v: float) -> float:
        if v < 0 or v > 50:
            raise ValueError("Experience years must be between 0 and 50")
        return v


class GrowthProjection(BaseModel):
    year_1: float
    year_3: float
    year_5: float


class SalaryPredictionResponse(BaseModel):
    id: int
    user_id: int
    job_title: str
    experience_years: float
    country: str
    city: Optional[str] = None
    education_level: Optional[str] = None
    skills: List[str] = []
    industry: Optional[str] = None
    company_size: Optional[str] = None

    # Predictions
    predicted_min: Optional[float] = None
    predicted_max: Optional[float] = None
    predicted_median: Optional[float] = None
    currency: str = "USD"

    # Insights
    market_insights: Optional[str] = None
    skill_impact: Dict[str, Any] = {}
    comparable_roles: List[Dict[str, Any]] = []
    growth_projection: Dict[str, Any] = {}

    created_at: datetime

    model_config = {"from_attributes": True}
