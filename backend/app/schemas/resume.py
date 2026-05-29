from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime


class ExperienceItem(BaseModel):
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = "Present"
    location: Optional[str] = None
    description: Optional[str] = None
    achievements: Optional[List[str]] = []


class EducationItem(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    achievements: Optional[List[str]] = []


class ProjectItem(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: Optional[List[str]] = []
    url: Optional[str] = None
    github_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class CertificationItem(BaseModel):
    name: str
    issuer: str
    date: Optional[str] = None
    expiry: Optional[str] = None
    credential_url: Optional[str] = None


class LanguageItem(BaseModel):
    language: str
    proficiency: str  # Beginner, Intermediate, Advanced, Native


class ResumeCreate(BaseModel):
    title: str
    template: Optional[str] = "modern"
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[List[ExperienceItem]] = []
    education: Optional[List[EducationItem]] = []
    skills: Optional[List[str]] = []
    certifications: Optional[List[CertificationItem]] = []
    projects: Optional[List[ProjectItem]] = []
    languages: Optional[List[LanguageItem]] = []
    awards: Optional[List[Dict[str, Any]]] = []


class ResumeUpdate(ResumeCreate):
    title: Optional[str] = None


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    template: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None
    ai_summary: Optional[str] = None
    experience: Optional[List[Any]] = []
    education: Optional[List[Any]] = []
    skills: Optional[List[str]] = []
    certifications: Optional[List[Any]] = []
    projects: Optional[List[Any]] = []
    languages: Optional[List[Any]] = []
    awards: Optional[List[Any]] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AISummaryRequest(BaseModel):
    job_title: str
    skills: List[str]
    experience_years: int
    key_achievements: Optional[List[str]] = []
