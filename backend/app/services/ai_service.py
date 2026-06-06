import google.generativeai as genai
from app.config import settings
from app.utils.logger import app_logger
from typing import Optional, List

genai.configure(api_key=settings.GEMINI_API_KEY)

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


def _make_model(system_prompt: str, temperature: float, max_tokens: int):
    return genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,
        system_instruction=system_prompt,
        generation_config=genai.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        ),
    )


async def call_openai(
    system_prompt: str,
    user_message: str,
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 2000,
    response_format: Optional[dict] = None,
) -> str:
    """Gemini drop-in replacement for the old call_openai function."""
    try:
        gemini_model = _make_model(system_prompt, temperature, max_tokens)
        response = await gemini_model.generate_content_async(user_message)
        return response.text or ""
    except Exception as e:
        app_logger.error(f"Gemini API error: {e}")
        raise RuntimeError(f"AI service temporarily unavailable: {str(e)}")


async def call_openai_with_history(
    system_prompt: str,
    messages: List[dict],
    model: Optional[str] = None,
    temperature: float = 0.8,
    max_tokens: int = 1500,
) -> str:
    """Gemini drop-in replacement for call_openai_with_history."""
    try:
        gemini_model = _make_model(system_prompt, temperature, max_tokens)

        # Convert OpenAI message format to Gemini format
        # Gemini roles: "user" or "model"
        history = []
        for msg in messages[:-1]:
            role = "model" if msg["role"] == "assistant" else "user"
            history.append({"role": role, "parts": [msg["content"]]})

        last_message = messages[-1]["content"] if messages else ""

        chat = gemini_model.start_chat(history=history)
        response = await chat.send_message_async(last_message)
        return response.text or ""
    except Exception as e:
        app_logger.error(f"Gemini API error: {e}")
        raise RuntimeError(f"AI service temporarily unavailable: {str(e)}")
