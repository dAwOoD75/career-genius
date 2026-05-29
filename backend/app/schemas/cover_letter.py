from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CoverLetterCreate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    applicant_name: Optional[str] = None
    tone: Optional[str] = "professional"  # professional, friendly, enthusiastic, formal
    additional_context: Optional[str] = None


class CoverLetterUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    tone: Optional[str] = None


class CoverLetterResponse(BaseModel):
    id: int
    user_id: int
    title: str
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    applicant_name: Optional[str] = None
    tone: str
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
