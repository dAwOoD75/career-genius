from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List

from app.dependencies import get_current_user
from app.services.cv_generator_service import generate_ats_cv

router = APIRouter(prefix="/cv-generator", tags=["CV Generator"])


class ExperienceItem(BaseModel):
    company: str = ""
    role: str
    duration: str = ""
    description: str = ""


class EducationItem(BaseModel):
    institution: str = ""
    degree: str
    year: str = ""


class CVGenerateRequest(BaseModel):
    full_name: str
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    summary: str = ""
    skills: List[str] = []
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []


@router.post("/generate")
async def generate_cv(
    data: CVGenerateRequest,
    current_user=Depends(get_current_user),
):
    try:
        result = generate_ats_cv(data.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
