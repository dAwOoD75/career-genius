from openai import AsyncOpenAI
from app.config import settings
from app.utils.logger import app_logger
from typing import Optional, List

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPTS = {
    "cv_analyzer": """You are an expert ATS (Applicant Tracking System) analyst and career coach.
    Analyze resumes thoroughly and provide detailed, actionable feedback.
    Always respond with valid JSON matching the requested schema.""",

    "resume_summary": """You are a professional resume writer with 15+ years of experience.
    Write compelling, ATS-optimized professional summaries that highlight achievements and value proposition.""",

    "cover_letter": """You are an expert cover letter writer who creates personalized, compelling cover letters
    that perfectly match candidates to job requirements. Write in a professional yet engaging tone.""",

    "interview": """You are an experienced technical interviewer and career coach conducting a professional
    interview simulation. Ask relevant questions, evaluate answers, and provide constructive feedback.
    Adapt your questions to the candidate's responses and maintain a realistic interview flow.""",

    "salary": """You are a compensation analyst with deep knowledge of global salary markets across industries.
    Provide accurate, data-driven salary insights based on role, skills, experience, and location.""",
}


async def call_openai(
    system_prompt: str,
    user_message: str,
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 2000,
    response_format: Optional[dict] = None,
) -> str:
    """Generic OpenAI API call with error handling."""
    try:
        kwargs = {
            "model": model or settings.OPENAI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format:
            kwargs["response_format"] = response_format

        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.content or ""

    except Exception as e:
        app_logger.error(f"OpenAI API error: {e}")
        raise RuntimeError(f"AI service temporarily unavailable: {str(e)}")


async def call_openai_with_history(
    system_prompt: str,
    messages: List[dict],
    model: Optional[str] = None,
    temperature: float = 0.8,
    max_tokens: int = 1500,
) -> str:
    """OpenAI call with conversation history (for chatbot)."""
    try:
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        response = await client.chat.completions.create(
            model=model or settings.OPENAI_MODEL,
            messages=full_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        app_logger.error(f"OpenAI API error: {e}")
        raise RuntimeError(f"AI service temporarily unavailable: {str(e)}")
