from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.ats_report import ATSReport
from app.models.cover_letter import CoverLetter
from app.models.chat_session import ChatSession
from app.models.salary_prediction import SalaryPrediction
from app.models.activity_log import ActivityLog
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current user profile."""
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/dashboard")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard statistics for the current user."""
    user_id = current_user.id

    stats = {
        "total_resumes": db.query(Resume).filter(Resume.user_id == user_id).count(),
        "total_ats_reports": db.query(ATSReport).filter(ATSReport.user_id == user_id).count(),
        "total_cover_letters": db.query(CoverLetter).filter(CoverLetter.user_id == user_id).count(),
        "total_interview_sessions": db.query(ChatSession).filter(ChatSession.user_id == user_id).count(),
        "total_salary_predictions": db.query(SalaryPrediction).filter(SalaryPrediction.user_id == user_id).count(),
    }

    # Average ATS score
    avg_score = db.query(func.avg(ATSReport.overall_score)).filter(ATSReport.user_id == user_id).scalar()
    stats["avg_ats_score"] = round(avg_score or 0, 1)

    # Recent activities
    recent_activities = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
        .all()
    )
    stats["recent_activities"] = [
        {
            "action": a.action,
            "module": a.module,
            "description": a.description,
            "created_at": a.created_at.isoformat(),
        }
        for a in recent_activities
    ]

    # Recent resumes
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
        .limit(5)
        .all()
    )
    stats["recent_resumes"] = [
        {"id": r.id, "title": r.title, "template": r.template, "created_at": r.created_at.isoformat()}
        for r in resumes
    ]

    # Recent ATS reports
    reports = (
        db.query(ATSReport)
        .filter(ATSReport.user_id == user_id)
        .order_by(ATSReport.created_at.desc())
        .limit(5)
        .all()
    )
    stats["recent_ats_reports"] = [
        {
            "id": r.id,
            "filename": r.original_filename,
            "overall_score": r.overall_score,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]

    return stats


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete current user account and all associated data."""
    db.delete(current_user)
    db.commit()
