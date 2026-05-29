import json
import re
from typing import Dict, Any, List
from app.services.ai_service import call_openai, SYSTEM_PROMPTS
from app.utils.logger import app_logger

# Common ATS keywords by category
COMMON_TECH_KEYWORDS = [
    "python", "javascript", "typescript", "react", "node.js", "sql", "postgresql",
    "mongodb", "docker", "kubernetes", "aws", "azure", "gcp", "git", "agile",
    "scrum", "rest api", "graphql", "machine learning", "deep learning", "tensorflow",
    "pytorch", "fastapi", "django", "flask", "spring boot", "java", "c++", "c#",
    "microservices", "ci/cd", "devops", "linux", "html", "css", "tailwind",
    "redux", "vue.js", "angular", "next.js", "data analysis", "pandas", "numpy"
]

RESUME_SECTIONS = ["contact", "summary", "experience", "education", "skills", "certifications"]


def calculate_keyword_score(text: str, job_description: str = "") -> Dict[str, Any]:
    """Calculate keyword matching score between resume and job description."""
    text_lower = text.lower()

    if job_description:
        # Extract keywords from job description
        jd_words = set(re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.-]{1,}\b', job_description.lower()))
        stop_words = {"the", "a", "an", "is", "are", "was", "be", "to", "of", "and", "or",
                      "in", "on", "at", "for", "with", "this", "that", "will", "can", "our",
                      "your", "we", "you", "as", "by", "from", "have", "has", "had", "not"}
        jd_keywords = jd_words - stop_words
        matched = [kw for kw in jd_keywords if kw in text_lower and len(kw) > 2]
        missing = [kw for kw in jd_keywords if kw not in text_lower and len(kw) > 3]
        score = (len(matched) / max(len(jd_keywords), 1)) * 100
    else:
        # Use common tech keywords
        matched = [kw for kw in COMMON_TECH_KEYWORDS if kw in text_lower]
        missing = [kw for kw in COMMON_TECH_KEYWORDS if kw not in text_lower][:15]
        score = min((len(matched) / 15) * 100, 100)

    return {
        "score": round(score, 1),
        "matched": matched[:30],
        "missing": missing[:20],
    }


def analyze_formatting(text: str) -> Dict[str, Any]:
    """Analyze resume formatting quality."""
    issues = []
    score = 100.0

    # Check length
    word_count = len(text.split())
    if word_count < 200:
        issues.append("Resume appears too short. Aim for 400-800 words.")
        score -= 20
    elif word_count > 1200:
        issues.append("Resume may be too long. Keep it concise (1-2 pages).")
        score -= 10

    # Check for contact information
    if not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):
        issues.append("No email address detected.")
        score -= 15

    if not re.search(r'\+?[\d\s\-\(\)]{7,}', text):
        issues.append("No phone number detected.")
        score -= 10

    # Check for dates
    if not re.search(r'\b(19|20)\d{2}\b', text):
        issues.append("No dates found. Add dates to experience and education sections.")
        score -= 10

    # Check for action verbs
    action_verbs = ["developed", "managed", "led", "created", "implemented", "designed",
                    "built", "achieved", "improved", "reduced", "increased", "launched"]
    verbs_found = sum(1 for verb in action_verbs if verb in text.lower())
    if verbs_found < 3:
        issues.append("Use more action verbs to describe your achievements (e.g., 'Developed', 'Led', 'Implemented').")
        score -= 10

    # Check for quantified achievements
    if not re.search(r'\d+%|\d+ percent|\$\d+', text):
        issues.append("Add quantified achievements (e.g., 'Increased efficiency by 30%', 'Managed $500K budget').")
        score -= 10

    return {
        "score": max(round(score, 1), 0),
        "issues": issues,
        "word_count": word_count,
    }


def analyze_sections(text: str) -> Dict[str, Any]:
    """Detect presence of key resume sections."""
    text_lower = text.lower()
    section_keywords = {
        "has_contact": ["email", "@", "phone", "linkedin", "github"],
        "has_summary": ["summary", "objective", "profile", "about me", "professional summary"],
        "has_experience": ["experience", "employment", "work history", "career"],
        "has_education": ["education", "university", "college", "bachelor", "master", "degree"],
        "has_skills": ["skills", "technologies", "competencies", "technical skills"],
        "has_certifications": ["certification", "certificate", "certified", "license"],
    }
    analysis = {}
    present_count = 0

    for key, keywords in section_keywords.items():
        found = any(kw in text_lower for kw in keywords)
        analysis[key] = found
        if found:
            present_count += 1

    analysis["completeness_percentage"] = round((present_count / len(section_keywords)) * 100, 1)
    return analysis


def extract_skills(text: str) -> List[str]:
    """Extract technical skills from resume text."""
    text_lower = text.lower()
    all_skills = [
        "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "swift",
        "kotlin", "php", "scala", "r", "matlab", "react", "vue.js", "angular", "next.js", "nuxt",
        "node.js", "express", "django", "flask", "fastapi", "spring", "laravel", "rails",
        "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite", "oracle",
        "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible", "jenkins",
        "git", "github", "gitlab", "bitbucket", "jira", "confluence", "linux", "bash",
        "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
        "pandas", "numpy", "tableau", "power bi", "excel", "sql", "rest api", "graphql",
        "microservices", "ci/cd", "devops", "agile", "scrum", "html", "css", "sass",
        "tailwind css", "bootstrap", "figma", "adobe xd", "photoshop"
    ]
    return [skill for skill in all_skills if skill in text_lower]


async def analyze_cv_with_ai(text: str, job_description: str = "") -> Dict[str, Any]:
    """Use AI to perform deep CV analysis."""
    jd_part = f"\n\nJob Description:\n{job_description[:1500]}" if job_description else ""

    prompt = f"""Analyze this resume and provide detailed feedback as JSON:

Resume:
{text[:3000]}
{jd_part}

Return ONLY valid JSON with this exact structure:
{{
  "improvement_suggestions": ["suggestion1", "suggestion2", ...],
  "skill_gaps": ["gap1", "gap2", ...],
  "strengths": ["strength1", "strength2", ...],
  "readability_score": 85,
  "readability_feedback": "The resume is..."
}}"""

    try:
        response = await call_openai(
            system_prompt=SYSTEM_PROMPTS["cv_analyzer"],
            user_message=prompt,
            temperature=0.3,
            max_tokens=1500,
        )
        cleaned = response.strip()
        if "```json" in cleaned:
            cleaned = cleaned.split("```json")[1].split("```")[0]
        elif "```" in cleaned:
            cleaned = cleaned.split("```")[1].split("```")[0]
        return json.loads(cleaned)
    except Exception as e:
        app_logger.error(f"AI CV analysis failed: {e}")
        return {
            "improvement_suggestions": [
                "Quantify your achievements with specific metrics",
                "Add a professional summary section",
                "Include relevant keywords from the job description",
                "Use consistent formatting throughout",
            ],
            "skill_gaps": [],
            "strengths": [],
            "readability_score": 70,
            "readability_feedback": "Resume structure is adequate but could be improved.",
        }


def is_cv_document(text: str) -> bool:
    """Return False if the text does not look like a CV/resume."""
    text_lower = text.lower()
    cv_signals = [
        any(kw in text_lower for kw in ["experience", "work history", "employment"]),
        any(kw in text_lower for kw in ["education", "university", "college", "bachelor", "master", "degree"]),
        any(kw in text_lower for kw in ["skills", "competencies", "technologies"]),
        bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)),
    ]
    return sum(cv_signals) >= 2


async def perform_full_ats_analysis(text: str, job_description: str = "") -> Dict[str, Any]:
    """Run the complete ATS analysis pipeline."""
    if not is_cv_document(text):
        return {
            "overall_score": 0.0,
            "keyword_score": 0.0,
            "format_score": 0.0,
            "readability_score": 0.0,
            "completeness_score": 0.0,
            "matched_keywords": [],
            "missing_keywords": [],
            "skill_gaps": [],
            "formatting_issues": ["This document does not appear to be a CV or resume. Please upload a valid resume."],
            "improvement_suggestions": ["Upload a proper CV/resume containing sections like Experience, Education, Skills, and contact information."],
            "extracted_skills": [],
            "section_analysis": {
                "has_contact": False, "has_summary": False, "has_experience": False,
                "has_education": False, "has_skills": False, "has_certifications": False,
                "completeness_percentage": 0.0,
            },
        }

    keyword_result = calculate_keyword_score(text, job_description)
    format_result = analyze_formatting(text)
    section_result = analyze_sections(text)
    extracted_skills = extract_skills(text)
    ai_result = await analyze_cv_with_ai(text, job_description)

    # Weighted overall score
    overall_score = (
        keyword_result["score"] * 0.35 +
        format_result["score"] * 0.25 +
        ai_result.get("readability_score", 70) * 0.20 +
        section_result["completeness_percentage"] * 0.20
    )

    return {
        "overall_score": round(overall_score, 1),
        "keyword_score": keyword_result["score"],
        "format_score": format_result["score"],
        "readability_score": ai_result.get("readability_score", 70),
        "completeness_score": section_result["completeness_percentage"],
        "matched_keywords": keyword_result["matched"],
        "missing_keywords": keyword_result["missing"],
        "skill_gaps": ai_result.get("skill_gaps", []),
        "formatting_issues": format_result["issues"],
        "improvement_suggestions": ai_result.get("improvement_suggestions", []),
        "extracted_skills": extracted_skills,
        "section_analysis": section_result,
    }


async def suggest_cv_changes(extracted_text: str, analysis: dict) -> List[str]:
    """Ask AI to produce specific, actionable CV change suggestions."""
    missing = ", ".join(analysis.get("missing_keywords", [])[:10]) or "none"
    skills = ", ".join(analysis.get("extracted_skills", [])[:10]) or "none"
    suggestions = "; ".join(analysis.get("improvement_suggestions", [])[:5]) or "none"

    prompt = f"""You are a professional CV editor. Below is a candidate's CV text and analysis results.
Produce exactly 6-8 specific, actionable suggestions to improve this CV.

CV Text:
{extracted_text[:3000]}

Analysis:
- Missing keywords: {missing}
- Current skills detected: {skills}
- General suggestions: {suggestions}

Return ONLY a JSON array of strings. Each string is one specific change instruction, e.g.:
- "Add 'Docker' and 'Kubernetes' to your Skills section under DevOps tools."
- "Rewrite your first work experience bullet to quantify impact (e.g. 'Reduced load time by 40%')."
- "Add a 2-3 sentence Professional Summary at the top highlighting your key strengths."

Return ONLY valid JSON array, no markdown:
["change1", "change2", ...]"""

    try:
        response = await call_openai(
            system_prompt=SYSTEM_PROMPTS["cv_analyzer"],
            user_message=prompt,
            temperature=0.4,
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
        app_logger.error(f"CV suggestions failed: {e}")
        return [
            "Add a Professional Summary section at the top of your CV.",
            "Quantify achievements in your work experience (e.g. 'increased sales by 30%').",
            "Add missing technical keywords relevant to your target role.",
            "Use consistent bullet point formatting throughout.",
            "Include a dedicated Skills section with categorized technologies.",
            "Add certifications or courses if applicable.",
        ]


async def generate_improved_cv(extracted_text: str, suggestions: List[str]) -> str:
    """Rewrite the CV text in ATS-standard format applying all suggested changes."""
    suggestions_text = "\n".join(f"- {s}" for s in suggestions)

    prompt = f"""You are a professional ATS-optimized CV writer. Rewrite the following CV applying ALL improvements listed.

Original CV:
{extracted_text[:4000]}

Changes to apply:
{suggestions_text}

OUTPUT FORMAT — follow this EXACT structure (use these section names verbatim):

FULL NAME
Professional Title | City, Country | email@example.com | phone | LinkedIn (if available)

PROFESSIONAL SUMMARY
2–3 sentences: years of experience, key skills, and value proposition.

WORK EXPERIENCE

Job Title — Company Name                          Month Year – Month Year
• Quantified achievement using action verb (e.g. "Reduced load time by 40%")
• Second achievement with impact
• Third achievement

EDUCATION

Degree — University Name                          Year – Year
Field of Study

SKILLS

Technical: skill1, skill2, skill3, skill4
Tools: tool1, tool2, tool3
Soft Skills: skill1, skill2

CERTIFICATIONS

• Certification Name — Issuing Body (Year)

Rules:
1. Keep ALL original factual information — do not invent anything.
2. Use exactly these section headers: PROFESSIONAL SUMMARY, WORK EXPERIENCE, EDUCATION, SKILLS, CERTIFICATIONS (omit sections with no data).
3. Every experience bullet must start with a strong action verb and be specific.
4. Quantify achievements wherever the original gives enough information.
5. Output ONLY the CV text — no explanations, no markdown, no commentary.

Write the improved CV now:"""

    try:
        return await call_openai(
            system_prompt=SYSTEM_PROMPTS["cv_analyzer"],
            user_message=prompt,
            temperature=0.4,
            max_tokens=2000,
        )
    except Exception as e:
        app_logger.error(f"CV rewrite failed, using structured fallback: {e}")
        return _apply_basic_improvements(extracted_text, suggestions)


def _apply_basic_improvements(cv_text: str, suggestions: List[str]) -> str:
    """Fallback: restructure original CV text into ATS-standard format."""
    lines = [l.rstrip() for l in cv_text.strip().splitlines()]

    KNOWN_HEADERS = {
        "experience", "work experience", "employment history", "career history",
        "education", "academic background",
        "skills", "technical skills", "key skills", "core competencies",
        "certifications", "certificates",
        "projects", "key projects",
        "summary", "professional summary", "objective", "profile",
        "achievements", "accomplishments", "awards",
        "languages", "references", "contact", "contact information",
        "personal information", "volunteer", "publications", "interests",
    }

    def _is_known_header(s: str) -> bool:
        return s.lower().rstrip(":").strip() in KNOWN_HEADERS

    # ── Separate header block (name + contact) from body sections ────────────
    header_lines: List[str] = []
    body_lines:   List[str] = []
    in_header = True

    for line in lines:
        stripped = line.strip()
        if in_header:
            # First blank line after content, or a recognised section header,
            # marks the end of the header block
            if _is_known_header(stripped) or (not stripped and header_lines):
                in_header = False
                if stripped:
                    body_lines.append(line)
            else:
                if stripped:
                    header_lines.append(stripped)
        else:
            body_lines.append(line)

    body_text  = "\n".join(body_lines).lower()
    has_summary = any(kw in body_text for kw in ("summary", "objective", "profile"))
    has_skills  = "skills" in body_text

    # ── Build output ──────────────────────────────────────────────────────────
    out: List[str] = list(header_lines)   # name + contact/tagline lines

    # Inject Professional Summary if missing
    if not has_summary:
        out += [
            "",
            "PROFESSIONAL SUMMARY",
            "Experienced professional with a proven track record of delivering results. "
            "Skilled in problem-solving, collaboration, and continuous improvement. "
            "Seeking opportunities to leverage expertise and drive meaningful impact.",
        ]

    # Process body lines
    out.append("")
    for line in body_lines:
        stripped = line.strip()
        if not stripped:
            out.append("")
            continue
        if _is_known_header(stripped):
            out.append("")
            out.append(stripped.upper().rstrip(":"))
        elif re.match(r'^[-\*]\s+', stripped):
            out.append("• " + re.sub(r'^[-\*]\s+', '', stripped))
        elif stripped.startswith("•"):
            out.append(stripped)
        else:
            out.append(stripped)

    # Append Skills section if completely missing
    if not has_skills:
        out += [
            "",
            "SKILLS",
            "Technical: Add your key technical skills here.",
        ]

    # De-duplicate consecutive blank lines
    result: List[str] = []
    for line in out:
        if line == "" and result and result[-1] == "":
            continue
        result.append(line)

    return "\n".join(result)
