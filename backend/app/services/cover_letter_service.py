from datetime import date
from app.services.ai_service import call_openai, SYSTEM_PROMPTS
from app.utils.logger import app_logger
from typing import Optional, List

TONE_DESCRIPTIONS = {
    "professional": "formal and professional",
    "friendly": "warm, friendly, and approachable",
    "enthusiastic": "highly enthusiastic and passionate",
    "formal": "very formal and traditional",
}


def _fallback_cover_letter(applicant_name: str, cv_text: str) -> str:
    """Template-based cover letter when AI is unavailable."""
    today = date.today().strftime("%B %d, %Y")
    name = applicant_name.strip() or "Applicant"

    # Try to pull a few lines from the CV as context
    lines = [l.strip() for l in cv_text.split("\n") if l.strip() and len(l.strip()) > 10]
    cv_excerpt = " ".join(lines[:6])[:400] if lines else ""

    body = (
        f"My background includes {cv_excerpt} " if cv_excerpt
        else "Throughout my career I have developed a strong set of technical and professional skills. "
    )

    return f"""{today}

Dear Hiring Manager,

I am writing to express my strong interest in joining your organisation. With a solid foundation in my field and a commitment to continuous growth, I am confident I can make a meaningful contribution to your team.

{body}I am known for my attention to detail, ability to work collaboratively, and dedication to delivering high-quality results under pressure.

I am excited about the opportunity to bring my skills and experience to your team and would welcome the chance to discuss how I can add value to your organisation.

Thank you for considering my application. I look forward to hearing from you.

Yours sincerely,
{name}"""


async def generate_cover_letter(
    company_name: Optional[str] = None,
    job_title: Optional[str] = None,
    job_description: Optional[str] = None,
    applicant_name: Optional[str] = None,
    tone: str = "professional",
    additional_context: Optional[str] = None,
    cv_text: Optional[str] = None,
    cv_skills: Optional[List[str]] = None,
) -> str:
    """Generate a cover letter purely from CV content — no extra input needed."""
    tone_desc = TONE_DESCRIPTIONS.get(tone, "professional")
    name_line = f"Applicant Name: {applicant_name}" if applicant_name else ""

    if not cv_text or len(cv_text.strip()) < 50:
        raise RuntimeError("CV text too short. Please re-upload and analyze your CV — make sure it is a text-based PDF (not a scanned image).")

    skills_line = f"Key Skills: {', '.join(cv_skills[:20])}" if cv_skills else ""

    prompt = f"""You are a professional cover letter writer. Write a compelling, personalized cover letter based ONLY on the candidate's CV below.

{name_line}
Tone: {tone_desc}
{skills_line}

Candidate's CV:
{cv_text[:4000]}

Instructions:
1. Read the CV carefully — extract the candidate's name, experience, skills, education, and achievements.
2. Write a cover letter that highlights their strongest qualifications.
3. Opening: introduce the candidate and express enthusiasm for the field they work in.
4. Body (2 paragraphs): highlight specific skills, experience, and achievements from the CV.
5. Closing: professional call to action.
6. Use real details from the CV — do NOT use placeholder text like [Company Name] or [Job Title].
7. Tone: {tone_desc}.
8. Length: 300-400 words, 4 paragraphs.
9. Include today's date, greeting (Dear Hiring Manager), and a proper sign-off.
10. Do NOT invent any information not present in the CV.

Write the cover letter now:"""

    try:
        return await call_openai(
            system_prompt=SYSTEM_PROMPTS["cover_letter"],
            user_message=prompt,
            temperature=0.75,
            max_tokens=800,
        )
    except Exception as e:
        app_logger.error(f"Cover letter AI failed, using fallback: {e}")
        return _fallback_cover_letter(applicant_name or "", cv_text)
