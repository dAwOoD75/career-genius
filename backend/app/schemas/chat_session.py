from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatSessionCreate(BaseModel):
    interview_type: str = "mixed"     # technical, hr, behavioral, mixed
    difficulty: str = "intermediate"  # beginner, intermediate, advanced
    job_role: Optional[str] = None
    technology_stack: Optional[str] = None


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    feedback: Optional[str] = None
    score: Optional[int] = None
    question_type: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    interview_type: str
    difficulty: str
    job_role: Optional[str] = None
    technology_stack: Optional[str] = None
    total_questions: int
    session_feedback: Optional[str] = None
    overall_score: Optional[int] = None
    messages: Optional[List[ChatMessageResponse]] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ChatSessionSummaryResponse(BaseModel):
    id: int
    title: str
    interview_type: str
    difficulty: str
    job_role: Optional[str] = None
    total_questions: int
    overall_score: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
