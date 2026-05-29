import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.chat_session import ChatSession, ChatMessage
from app.models.activity_log import ActivityLog
from app.schemas.chat_session import (
    ChatSessionCreate, ChatMessageCreate,
    ChatSessionResponse, ChatSessionSummaryResponse, ChatMessageResponse,
)
from app.services.interview_service import generate_10_questions, generate_session_feedback

router = APIRouter(prefix="/interview", tags=["Interview Chatbot"])

TOTAL_QUESTIONS = 10


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    data: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a new technical interview — pre-generates 10 unique questions."""
    job_role = data.job_role or "Software Engineer"

    # Pre-generate all 10 unique questions upfront
    questions = await generate_10_questions(job_role)

    session = ChatSession(
        user_id=current_user.id,
        title=f"Technical Interview - {job_role}",
        interview_type="technical",
        difficulty="intermediate",
        job_role=job_role,
        technology_stack=json.dumps(questions),  # store questions in this field
    )
    db.add(session)
    db.flush()

    # Post Question 1 as the opening message
    opening = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=f"Question 1: {questions[0]}",
        question_type="technical",
    )
    db.add(opening)

    db.add(ActivityLog(
        user_id=current_user.id,
        action="interview_started",
        module="interview",
        description=f"Technical interview started for: {job_role}",
    ))
    db.commit()
    db.refresh(session)
    return session


@router.post("/sessions/{session_id}/message", response_model=ChatMessageResponse)
async def send_message(
    session_id: int,
    data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit answer — returns next question or completion message after 10."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.ended_at:
        raise HTTPException(status_code=400, detail="Session has ended")

    # Load pre-generated questions
    try:
        questions = json.loads(session.technology_stack or "[]")
    except Exception:
        questions = []

    # Save user answer
    user_msg = ChatMessage(session_id=session_id, role="user", content=data.content)
    db.add(user_msg)
    db.flush()

    answered = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id,
        ChatMessage.role == "user",
    ).count()

    session.total_questions = answered

    if answered >= TOTAL_QUESTIONS:
        ai_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content="Thank you for completing all 10 questions! Generating your performance report now...",
            question_type="closing",
        )
    else:
        next_q = questions[answered] if answered < len(questions) else f"Final question: What makes you a strong fit for the {session.job_role} role?"
        ai_msg = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=f"Question {answered + 1}: {next_q}",
            question_type="technical",
        )

    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)
    return ai_msg


@router.post("/sessions/{session_id}/end")
async def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze all answers and return knowledge / grammar / attempt_style scores."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = [{"role": m.role, "content": m.content} for m in session.messages]
    feedback = await generate_session_feedback(messages, session.job_role)

    session.ended_at = datetime.now(timezone.utc)
    session.session_feedback = feedback.get("summary", "")
    session.overall_score = feedback.get("overall_score", 60)

    db.add(ActivityLog(
        user_id=current_user.id,
        action="interview_completed",
        module="interview",
        description=f"Interview completed. Score: {session.overall_score}",
    ))
    db.commit()
    return {"message": "Session ended", "feedback": feedback, "session_id": session_id}


@router.get("/sessions", response_model=List[ChatSessionSummaryResponse])
async def get_sessions(
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .offset(skip).limit(limit).all()
    )


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
