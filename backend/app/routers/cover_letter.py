from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.cover_letter import CoverLetter
from app.models.ats_report import ATSReport
from app.models.activity_log import ActivityLog
from app.schemas.cover_letter import CoverLetterCreate, CoverLetterUpdate, CoverLetterResponse
from app.services.cover_letter_service import generate_cover_letter

router = APIRouter(prefix="/cover-letter", tags=["Cover Letter"])


@router.post("/generate", response_model=CoverLetterResponse, status_code=status.HTTP_201_CREATED)
async def create_cover_letter(
    data: CoverLetterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate an AI cover letter and save it."""
    # Auto-fetch latest CV report to use as context
    latest_report = (
        db.query(ATSReport)
        .filter(ATSReport.user_id == current_user.id)
        .order_by(ATSReport.created_at.desc())
        .first()
    )
    cv_text = latest_report.extracted_text if latest_report else None
    cv_skills = latest_report.extracted_skills if latest_report else None

    try:
        content = await generate_cover_letter(
            company_name=data.company_name,
            job_title=data.job_title,
            job_description=data.job_description,
            applicant_name=data.applicant_name or current_user.full_name,
            tone=data.tone or "professional",
            additional_context=data.additional_context,
            cv_text=cv_text,
            cv_skills=cv_skills,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    letter = CoverLetter(
        user_id=current_user.id,
        title="Cover Letter" + (f" - {data.job_title}" if data.job_title else "") + (f" at {data.company_name}" if data.company_name else ""),
        company_name=data.company_name,
        job_title=data.job_title,
        job_description=data.job_description,
        applicant_name=data.applicant_name or current_user.full_name,
        tone=data.tone or "professional",
        content=content,
    )
    db.add(letter)
    db.add(ActivityLog(
        user_id=current_user.id,
        action="cover_letter_generated",
        module="cover_letter",
        description=f"Cover letter generated for {data.job_title} at {data.company_name}",
    ))
    db.commit()
    db.refresh(letter)
    return letter


@router.get("/letters", response_model=List[CoverLetterResponse])
async def get_cover_letters(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all cover letters for the current user."""
    return (
        db.query(CoverLetter)
        .filter(CoverLetter.user_id == current_user.id)
        .order_by(CoverLetter.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/letters/{letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(
    letter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific cover letter."""
    letter = db.query(CoverLetter).filter(
        CoverLetter.id == letter_id,
        CoverLetter.user_id == current_user.id,
    ).first()
    if not letter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cover letter not found")
    return letter


@router.put("/letters/{letter_id}", response_model=CoverLetterResponse)
async def update_cover_letter(
    letter_id: int,
    data: CoverLetterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a cover letter."""
    letter = db.query(CoverLetter).filter(
        CoverLetter.id == letter_id,
        CoverLetter.user_id == current_user.id,
    ).first()
    if not letter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cover letter not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(letter, field, value)
    db.commit()
    db.refresh(letter)
    return letter


@router.delete("/letters/{letter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cover_letter(
    letter_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a cover letter."""
    letter = db.query(CoverLetter).filter(
        CoverLetter.id == letter_id,
        CoverLetter.user_id == current_user.id,
    ).first()
    if not letter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cover letter not found")
    db.delete(letter)
    db.commit()
