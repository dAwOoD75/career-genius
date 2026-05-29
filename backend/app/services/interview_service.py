import json
from typing import List, Dict, Optional
from app.services.ai_service import call_openai, SYSTEM_PROMPTS
from app.utils.logger import app_logger


async def generate_10_questions(job_role: str) -> List[str]:
    """Pre-generate 10 unique, diverse technical questions for the given role."""
    prompt = f"""Generate exactly 10 unique technical interview questions for a {job_role} position.

Rules:
- All 10 questions must be DIFFERENT — no repetition of topics
- Cover a wide range: fundamentals, data structures/algorithms, system design, frameworks/tools, best practices, debugging, real-world scenarios
- Each question must be specific and meaningful, not vague
- Questions should be appropriate for a mid-level {job_role}
- Do NOT number them in the text, just return the array

Return ONLY a valid JSON array of 10 strings:
["question 1 text", "question 2 text", ..., "question 10 text"]"""

    try:
        response = await call_openai(
            system_prompt="You are a senior technical interviewer. Return only valid JSON.",
            user_message=prompt,
            temperature=0.8,
            max_tokens=1200,
        )
        cleaned = response.strip()
        if "```" in cleaned:
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.split("```")[0]
        questions = json.loads(cleaned.strip())
        if isinstance(questions, list) and len(questions) == 10:
            return questions
        raise ValueError("Did not get 10 questions")
    except Exception as e:
        app_logger.error(f"Question generation failed: {e}")
        return [
            f"Can you explain the core responsibilities of a {job_role} and what a typical day looks like?",
            "What data structures do you use most frequently, and can you explain time complexity of common operations?",
            "Describe a challenging technical problem you solved. What was your approach?",
            "How do you ensure code quality in your projects? What tools or practices do you use?",
            "Explain the difference between synchronous and asynchronous programming with an example.",
            "How would you design a scalable REST API? Walk me through your design decisions.",
            "What is your experience with version control? Describe your branching strategy.",
            "How do you approach debugging a production issue under pressure?",
            "What are SOLID principles? Give an example of one you apply regularly.",
            "Where do you see yourself improving most technically in the next year?",
        ]


async def generate_session_feedback(
    messages: List[Dict[str, str]],
    job_role: Optional[str] = None,
) -> Dict:
    """Analyze all 10 answers and return knowledge, grammar, attempt_style scores out of 10."""
    # Extract only user answers with their question context
    conversation_text = "\n\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in messages
    )

    prompt = f"""You are evaluating a completed 10-question technical interview for: {job_role or 'Software Engineer'}.

Full interview transcript:
{conversation_text}

Carefully read ALL the candidate's answers and evaluate them honestly.

Return ONLY valid JSON (no markdown, no extra text):
{{
  "knowledge_score": 7,
  "grammar_score": 8,
  "attempt_style_score": 6,
  "knowledge_feedback": "Specific observation about their technical knowledge depth and accuracy across the 10 answers.",
  "grammar_feedback": "Specific observation about their language clarity, grammar, and communication style.",
  "attempt_style_feedback": "Specific observation about how they structured and approached their answers (e.g. direct, thorough, vague, etc.).",
  "overall_score": 70,
  "summary": "2-3 sentence honest overall summary of the candidate's performance in this interview."
}}

Scoring guide (out of 10):
- 8-10: Excellent, detailed, accurate answers
- 6-7: Good understanding with minor gaps
- 4-5: Basic knowledge, significant gaps
- 1-3: Weak answers, mostly incorrect or skipped

Be honest. Do not inflate scores."""

    try:
        response = await call_openai(
            system_prompt=SYSTEM_PROMPTS["interview"],
            user_message=prompt,
            temperature=0.2,
            max_tokens=600,
        )
        cleaned = response.strip()
        if "```" in cleaned:
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.split("```")[0]
        return json.loads(cleaned.strip())
    except Exception as e:
        app_logger.error(f"Session feedback failed: {e}")
        return {
            "knowledge_score": 6,
            "grammar_score": 7,
            "attempt_style_score": 6,
            "knowledge_feedback": "Demonstrated basic technical knowledge across the questions.",
            "grammar_feedback": "Communication was generally clear and understandable.",
            "attempt_style_feedback": "Answers were reasonably structured.",
            "overall_score": 63,
            "summary": "The candidate showed foundational knowledge. Continued practice will help improve depth and confidence.",
        }
