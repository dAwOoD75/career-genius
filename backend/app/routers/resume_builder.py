from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.activity_log import ActivityLog
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeResponse, AISummaryRequest
from app.services.resume_service import generate_ai_summary

router = APIRouter(prefix="/resume-builder", tags=["Resume Builder"])


@router.post("/resumes", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    data: ResumeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new resume."""
    resume = Resume(
        user_id=current_user.id,
        title=data.title,
        template=data.template or "modern",
        full_name=data.full_name or current_user.full_name,
        email=data.email or current_user.email,
        phone=data.phone,
        location=data.location,
        linkedin=data.linkedin,
        github=data.github,
        website=data.website,
        summary=data.summary,
        experience=[e.model_dump() for e in data.experience] if data.experience else [],
        education=[e.model_dump() for e in data.education] if data.education else [],
        skills=data.skills or [],
        certifications=[c.model_dump() for c in data.certifications] if data.certifications else [],
        projects=[p.model_dump() for p in data.projects] if data.projects else [],
        languages=[l.model_dump() for l in data.languages] if data.languages else [],
        awards=data.awards or [],
    )
    db.add(resume)
    db.add(ActivityLog(
        user_id=current_user.id,
        action="resume_created",
        module="resume_builder",
        description=f"Resume created: {data.title}",
    ))
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/resumes", response_model=List[ResumeResponse])
async def get_resumes(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all resumes for the current user."""
    return (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/resumes/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific resume."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    return resume


@router.put("/resumes/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: int,
    data: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing resume."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

    update_data = data.model_dump(exclude_none=True)

    # Serialize list fields
    for list_field in ["experience", "education", "certifications", "projects", "languages"]:
        if list_field in update_data and update_data[list_field]:
            update_data[list_field] = [
                item.model_dump() if hasattr(item, "model_dump") else item
                for item in update_data[list_field]
            ]

    for field, value in update_data.items():
        setattr(resume, field, value)

    db.add(ActivityLog(
        user_id=current_user.id,
        action="resume_updated",
        module="resume_builder",
        description=f"Resume updated: {resume.title}",
    ))
    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/resumes/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a resume."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
    db.delete(resume)
    db.commit()


@router.post("/ai-summary")
async def generate_summary(
    data: AISummaryRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate an AI-powered professional summary."""
    summary = await generate_ai_summary(
        job_title=data.job_title,
        skills=data.skills,
        experience_years=data.experience_years,
        key_achievements=data.key_achievements,
    )
    return {"summary": summary}
