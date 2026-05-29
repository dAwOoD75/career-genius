from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.salary_prediction import SalaryPrediction
from app.models.activity_log import ActivityLog
from app.schemas.salary_prediction import SalaryPredictionCreate, SalaryPredictionResponse
from app.services.salary_service import estimate_salary, get_ai_salary_insights

router = APIRouter(prefix="/salary", tags=["Salary Predictor"])


@router.post("/predict", response_model=SalaryPredictionResponse, status_code=status.HTTP_201_CREATED)
async def predict_salary(
    data: SalaryPredictionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Predict salary range based on skills, experience, and location."""
    # Always Pakistan / PKR
    country = "Pakistan"

    # Get base salary estimate
    estimate = estimate_salary(
        job_title=data.job_title,
        experience_years=data.experience_years,
        country=country,
        skills=data.skills or [],
    )

    # Get AI insights
    insights = await get_ai_salary_insights(
        job_title=data.job_title,
        experience_years=data.experience_years,
        country=country,
        skills=data.skills or [],
        industry=data.industry,
        estimated=estimate,
    )

    prediction = SalaryPrediction(
        user_id=current_user.id,
        job_title=data.job_title,
        experience_years=data.experience_years,
        country=country,
        city=data.city,
        education_level=data.education_level,
        skills=data.skills or [],
        industry=data.industry,
        company_size=data.company_size,
        predicted_min=estimate["predicted_min"],
        predicted_max=estimate["predicted_max"],
        predicted_median=estimate["predicted_median"],
        currency=estimate["currency"],
        market_insights=insights.get("market_insights"),
        skill_impact=estimate["skill_impact"],
        comparable_roles=insights.get("comparable_roles", []),
        growth_projection=estimate["growth_projection"],
    )
    db.add(prediction)
    db.add(ActivityLog(
        user_id=current_user.id,
        action="salary_predicted",
        module="salary_predictor",
        description=f"Salary predicted for {data.job_title} in Pakistan",
        extra_data={"job_title": data.job_title, "median": estimate["predicted_median"]},
    ))
    db.commit()
    db.refresh(prediction)
    return prediction


@router.get("/predictions", response_model=List[SalaryPredictionResponse])
async def get_predictions(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all salary predictions for the current user."""
    return (
        db.query(SalaryPrediction)
        .filter(SalaryPrediction.user_id == current_user.id)
        .order_by(SalaryPrediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/predictions/{prediction_id}", response_model=SalaryPredictionResponse)
async def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific salary prediction."""
    prediction = db.query(SalaryPrediction).filter(
        SalaryPrediction.id == prediction_id,
        SalaryPrediction.user_id == current_user.id,
    ).first()
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    return prediction
