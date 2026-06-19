import json
from typing import List, Dict, Optional
from app.services.ai_service import call_openai, SYSTEM_PROMPTS
from app.utils.logger import app_logger


def _basic_score_fallback(answer: str) -> Dict:
    """Rule-based scoring used when the AI API is unavailable."""
    words = answer.strip().split()
    word_count = len(words)
    answer_lower = answer.lower().strip()

    # Empty answer
    if word_count == 0:
        return {"score": 0, "feedback": "No answer provided.", "grammar_score": 0}

    # Short / yes-no answers (≤5 words)
    if word_count <= 5:
        return {"score": 0, "feedback": "Answer is too short or non-substantive.", "grammar_score": 0}

    # "I don't know" type answers
    non_answers = [
        "i don't know", "i dont know", "dont know", "no idea", "not sure",
        "n/a", "none", "skip", "pass", "idk",
    ]
    if any(na in answer_lower for na in non_answers):
        return {"score": 0, "feedback": "Answer not provided.", "grammar_score": 0}

    # Gibberish detection: very low vowel ratio
    letters = [c for c in answer if c.isalpha()]
    if letters:
        vowel_ratio = sum(1 for c in letters if c in "aeiouAEIOU") / len(letters)
        if vowel_ratio < 0.10:
            return {"score": 0, "feedback": "Answer appears to be random text.", "grammar_score": 0}

    # Has real content but AI unavailable to judge quality
    grammar = min(6, max(2, word_count // 10))
    return {
        "score": 4,
        "feedback": "Answer received. Enable a valid Gemini API key for accurate AI scoring.",
        "grammar_score": grammar,
    }


async def score_single_answer(question: str, answer: str, job_role: str) -> Dict:
    """Score one interview answer in real-time. Returns score 0-10, feedback, grammar_score 0-10."""
    answer_words = answer.strip().split()
    is_short = len(answer_words) <= 5  # yes/no or very short answers skip grammar

    grammar_rule = (
        '"grammar_score": 0'
        if is_short
        else '"grammar_score": <integer 0-10 — rate language clarity, grammar, and professionalism>'
    )

    prompt = f"""You are a strict technical interview evaluator for a {job_role} position.

Question: {question}
Candidate Answer: {answer}

SCORE rules (0-10) — use the FULL range, be strict:
- 9-10: Excellent. Detailed, accurate, expert-level with real examples.
- 7-8: Good. Mostly correct, minor gaps only.
- 5: Normal/Average. Basic, on-topic but vague or incomplete.
- 3-4: Partial. Slightly correct but major gaps or partially wrong.
- 0: Wrong, irrelevant, "I don't know", or empty answer.

Return ONLY valid JSON:
{{"score": <integer 0-10>, "feedback": "<one specific sentence about this answer>", {grammar_rule}}}"""

    try:
        response = await call_openai(
            system_prompt="You are a strict interview evaluator. Return only valid JSON.",
            user_message=prompt,
            temperature=0.1,
            max_tokens=150,
        )
        cleaned = response.strip()
        if "```" in cleaned:
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.split("```")[0]
        result = json.loads(cleaned.strip())
        if is_short:
            result["grammar_score"] = 0
        return result
    except Exception as e:
        app_logger.error(f"Single answer scoring failed: {e}")
        return _basic_score_fallback(answer)


async def generate_10_questions(job_role: str) -> List[str]:
    """Pre-generate 10 questions across technical, problem-solving, and analytical categories."""
    prompt = f"""Generate exactly 10 interview questions for a {job_role} position.

You MUST follow this exact breakdown:
- Questions 1-4: TECHNICAL — specific knowledge about tools, languages, frameworks, system design, or core concepts relevant to {job_role}
- Questions 5-7: PROBLEM SOLVING — give a scenario or coding/logic challenge and ask how they would solve it (e.g. "You have a list of 1 million unsorted records and need to find duplicates efficiently — what approach would you use and why?")
- Questions 8-9: ANALYTICAL — require reasoning, trade-off analysis, or data-driven thinking (e.g. "How would you decide which database to use for a high-read, low-write application?")
- Question 10: BEHAVIORAL/SITUATIONAL — a real-world situation relevant to {job_role}

Additional rules:
- All 10 questions must be completely different in topic
- Each question must be specific and meaningful, not generic
- Do NOT number them in the text
- Return ONLY a valid JSON array of 10 strings

["question 1", "question 2", ..., "question 10"]"""

    try:
        response = await call_openai(
            system_prompt="You are a senior technical interviewer. Return only valid JSON.",
            user_message=prompt,
            temperature=0.8,
            max_tokens=1400,
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
            f"What are the core technical skills required for a {job_role} and which ones do you feel strongest in?",
            "Explain how you would design a RESTful API for a large-scale e-commerce platform. What trade-offs would you consider?",
            "What is the difference between SQL and NoSQL databases? When would you choose one over the other?",
            "How does garbage collection work in your primary programming language, and how can poor memory management affect performance?",
            "You have an array of 10 million integers and need to find all pairs that sum to a target value. What is the most efficient algorithm and what is its time/space complexity?",
            "A production server is returning 500 errors intermittently for 5% of requests. Walk me through your debugging process step by step.",
            "You need to build a feature that sends notifications to 1 million users within 10 minutes. How would you architect this system?",
            "Your team has two options: a mature but slower monolith or a faster microservices architecture that is harder to maintain. How do you decide which to use?",
            "Given a dataset showing user drop-off at checkout, what metrics would you analyze and what conclusions would you draw?",
            "Describe a situation where you disagreed with a technical decision made by your team. How did you handle it?",
        ]


async def generate_session_feedback(
    messages: List[Dict[str, str]],
    job_role: Optional[str] = None,
    answer_scores: Optional[List[int]] = None,
) -> Dict:
    """Analyze all 10 answers and return knowledge, grammar, attempt_style scores out of 10."""
    # Extract only user answers with their question context
    conversation_text = "\n\n".join(
        f"{m['role'].upper()}: {m['content']}" for m in messages
    )

    prompt = f"""You are a strict but fair evaluator for a completed 10-question interview for: {job_role or 'Software Engineer'}.

Full interview transcript:
{conversation_text}

Read ALL the candidate's answers carefully. Score each dimension honestly based on ACTUAL answer quality.

SCORING RULES (0-10 scale) — use the FULL range:
- 9-10: Exceptional. Detailed, accurate, demonstrates expert-level understanding with real examples.
- 7-8: Good. Correct understanding, mostly complete, minor gaps.
- 5-6: Average. Basic knowledge only, vague or missing key details.
- 3-4: Below average. Significant gaps, partially wrong, or very shallow answers.
- 1-2: Poor. Mostly incorrect, completely vague, or one-word answers with no depth.
- 0: No answer given or completely irrelevant response.

GRAMMAR SCORE rule: If a candidate gave yes/no answers or very short answers (≤5 words), grammar_score must be 0 for that — do not reward brevity.

IMPORTANT RULES:
- If the candidate gave short or vague answers, score 1-4. Do NOT give 6+ for weak answers.
- If the candidate skipped or said "I don't know" multiple times, score must reflect that (1-3).
- Do NOT default to middle scores. A mediocre answer is 4-5, not 6-7.
- overall_score = weighted average of the three scores × 10 (round to nearest integer).

Return ONLY valid JSON (no markdown, no extra text):
{{
  "knowledge_score": <integer 0-10>,
  "grammar_score": <integer 0-10>,
  "attempt_style_score": <integer 0-10>,
  "knowledge_feedback": "Specific, honest observation about their technical knowledge depth and accuracy. Mention what was strong or weak.",
  "grammar_feedback": "Specific observation about language clarity and grammar. If most answers were yes/no or one-liners, note that grammar_score reflects that.",
  "attempt_style_feedback": "Specific observation about how they structured answers — were they direct, thorough, vague, rushed?",
  "overall_score": <integer 0-100>,
  "summary": "2-3 sentence honest overall assessment. Be direct about strengths and clear weaknesses."
}}"""

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
        # Use stored per-answer scores to compute fallback rather than hardcoded values
        if answer_scores and len(answer_scores) > 0:
            avg = sum(answer_scores) / len(answer_scores)
            k = max(0, round(avg))
            g = max(0, round(avg * 0.85))
            s = max(0, round(avg * 0.9))
            overall = max(0, round((k + g + s) / 3 * 10))
        else:
            k, g, s, overall, avg = 0, 0, 0, 0, 0
        return {
            "knowledge_score": k,
            "grammar_score": g,
            "attempt_style_score": s,
            "knowledge_feedback": f"Average per-answer score: {round(avg, 1)}/10. Enable AI scoring for detailed feedback.",
            "grammar_feedback": "Score estimated from per-answer evaluations.",
            "attempt_style_feedback": "Score estimated from per-answer evaluations.",
            "overall_score": overall,
            "summary": f"Interview completed with an average answer score of {round(avg, 1)}/10. For accurate AI analysis, configure a valid Gemini API key.",
        }
