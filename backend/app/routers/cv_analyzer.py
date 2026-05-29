from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.ats_report import ATSReport
from app.models.activity_log import ActivityLog
from app.schemas.ats_report import ATSReportResponse
from app.utils.file_handler import save_upload_file
from app.utils.pdf_extractor import extract_text_from_file
from app.services.cv_analyzer_service import perform_full_ats_analysis, suggest_cv_changes, generate_improved_cv
from app.utils.cv_pdf_generator import generate_cv_pdf
from app.utils.logger import app_logger

router = APIRouter(prefix="/cv-analyzer", tags=["CV Analyzer"])


@router.post("/analyze", response_model=ATSReportResponse, status_code=status.HTTP_201_CREATED)
async def analyze_cv(
    file: UploadFile = File(..., description="Resume file (PDF or DOCX)"),
    job_description: Optional[str] = Form(None, description="Job description for keyword matching"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload and analyze a CV/resume for ATS compatibility."""
    # Enforce PDF-only uploads
    if file.content_type != "application/pdf" and not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are accepted. Please upload a PDF version of your resume.",
        )

    # Save the uploaded file
    file_path = await save_upload_file(file, subfolder=f"cv/{current_user.id}")

    try:
        # Extract text
        extracted_text = extract_text_from_file(file_path)
        if not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract text from the file. Please ensure it's not a scanned image.",
            )

        # Run AI analysis
        analysis = await perform_full_ats_analysis(extracted_text, job_description or "")

        # Save report to database
        report = ATSReport(
            user_id=current_user.id,
            original_filename=file.filename,
            file_path=file_path,
            job_description=job_description,
            extracted_text=extracted_text[:5000],
            overall_score=analysis["overall_score"],
            keyword_score=analysis["keyword_score"],
            format_score=analysis["format_score"],
            readability_score=analysis["readability_score"],
            completeness_score=analysis["completeness_score"],
            matched_keywords=analysis["matched_keywords"],
            missing_keywords=analysis["missing_keywords"],
            skill_gaps=analysis["skill_gaps"],
            formatting_issues=analysis["formatting_issues"],
            improvement_suggestions=analysis["improvement_suggestions"],
            extracted_skills=analysis["extracted_skills"],
            section_analysis=analysis["section_analysis"],
        )
        db.add(report)

        # Log activity
        db.add(ActivityLog(
            user_id=current_user.id,
            action="cv_analyzed",
            module="cv_analyzer",
            description=f"CV analyzed: {file.filename}, Score: {analysis['overall_score']}",
            extra_data={"score": analysis["overall_score"], "filename": file.filename},
        ))
        db.commit()
        db.refresh(report)

        app_logger.info(f"CV analyzed for user {current_user.id}, score: {analysis['overall_score']}")
        return report

    except HTTPException:
        raise
    except Exception as e:
        app_logger.error(f"CV analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}",
        )


@router.get("/reports", response_model=List[ATSReportResponse])
async def get_my_reports(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all ATS reports for the current user."""
    reports = (
        db.query(ATSReport)
        .filter(ATSReport.user_id == current_user.id)
        .order_by(ATSReport.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return reports


@router.get("/reports/{report_id}", response_model=ATSReportResponse)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific ATS report."""
    report = db.query(ATSReport).filter(
        ATSReport.id == report_id,
        ATSReport.user_id == current_user.id,
    ).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report


@router.get("/reports/{report_id}/suggestions")
async def get_cv_suggestions(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return AI-generated specific change suggestions for a CV."""
    report = db.query(ATSReport).filter(
        ATSReport.id == report_id,
        ATSReport.user_id == current_user.id,
    ).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    analysis = {
        "missing_keywords": report.missing_keywords or [],
        "extracted_skills": report.extracted_skills or [],
        "improvement_suggestions": report.improvement_suggestions or [],
    }
    suggestions = await suggest_cv_changes(report.extracted_text or "", analysis)
    return {"suggestions": suggestions}


@router.post("/reports/{report_id}/improve")
async def download_improved_cv(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Apply suggestions to the CV and return an improved PDF for download."""
    report = db.query(ATSReport).filter(
        ATSReport.id == report_id,
        ATSReport.user_id == current_user.id,
    ).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    analysis = {
        "missing_keywords": report.missing_keywords or [],
        "extracted_skills": report.extracted_skills or [],
        "improvement_suggestions": report.improvement_suggestions or [],
    }
    suggestions = await suggest_cv_changes(report.extracted_text or "", analysis)
    improved_text = await generate_improved_cv(report.extracted_text or "", suggestions)
    pdf_bytes = generate_cv_pdf(improved_text)

    filename = f"improved_cv_{report_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an ATS report."""
    report = db.query(ATSReport).filter(
        ATSReport.id == report_id,
        ATSReport.user_id == current_user.id,
    ).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    db.delete(report)
    db.commit()
