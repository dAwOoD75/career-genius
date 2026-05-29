from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ATSAnalysisRequest(BaseModel):
    job_description: Optional[str] = None


class SectionAnalysis(BaseModel):
    has_contact: bool = False
    has_summary: bool = False
    has_experience: bool = False
    has_education: bool = False
    has_skills: bool = False
    has_certifications: bool = False
    completeness_percentage: float = 0.0


class ATSReportResponse(BaseModel):
    id: int
    user_id: int
    original_filename: Optional[str] = None
    job_description: Optional[str] = None

    # Scores
    overall_score: float
    keyword_score: float
    format_score: float
    readability_score: float
    completeness_score: float

    # Analysis
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    skill_gaps: List[str] = []
    formatting_issues: List[str] = []
    improvement_suggestions: List[str] = []
    extracted_skills: List[str] = []
    section_analysis: Dict[str, Any] = {}

    created_at: datetime

    model_config = {"from_attributes": True}
