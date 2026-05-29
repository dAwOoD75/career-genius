from app.services.ai_service import call_openai, SYSTEM_PROMPTS
from app.utils.logger import app_logger
from typing import List, Optional


async def generate_ai_summary(
    job_title: str,
    skills: List[str],
    experience_years: int,
    key_achievements: Optional[List[str]] = None,
) -> str:
    """Generate an AI-powered professional summary."""
    achievements_str = "\n".join(f"- {a}" for a in (key_achievements or []))

    prompt = f"""Write a compelling 3-4 sentence professional resume summary for:
- Job Title: {job_title}
- Years of Experience: {experience_years}
- Key Skills: {', '.join(skills[:10])}
- Key Achievements: {achievements_str or 'Not specified'}

Requirements:
- Start with a strong adjective and job title
- Highlight years of experience
- Mention top 2-3 skills
- Include a value proposition
- Keep it concise and ATS-friendly
- Do NOT use "I" or "my"

Return only the summary text, no extra explanation."""

    try:
        return await call_openai(
            system_prompt=SYSTEM_PROMPTS["resume_summary"],
            user_message=prompt,
            temperature=0.7,
            max_tokens=300,
        )
    except Exception as e:
        app_logger.error(f"Summary generation failed: {e}")
        return f"Results-driven {job_title} with {experience_years}+ years of experience in {', '.join(skills[:3])}. Proven track record of delivering high-quality solutions and driving measurable business outcomes."
