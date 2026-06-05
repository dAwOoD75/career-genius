import base64
import re
from io import BytesIO
from pathlib import Path

from fpdf import FPDF

_MODEL_PATH = Path(__file__).parent.parent.parent.parent / "FYP_ATS_CV" / "FYP_ATS_CV"

_nlp = None
_spacy_available = None


def _get_model():
    global _nlp, _spacy_available
    if _spacy_available is None:
        try:
            import spacy
            _nlp = spacy.load(str(_MODEL_PATH))
            _spacy_available = True
        except Exception:
            _spacy_available = False
    return _nlp if _spacy_available else None


# ── Fallback keyword scorer (no spacy needed) ─────────────────────────────────
_SKILL_KEYWORDS = {
    "python", "java", "javascript", "typescript", "react", "node", "django", "fastapi",
    "flask", "sql", "mysql", "postgresql", "mongodb", "git", "docker", "aws", "azure",
    "html", "css", "linux", "rest", "api", "machine learning", "deep learning",
    "tensorflow", "pytorch", "pandas", "numpy", "c++", "c#", "kotlin", "swift",
    "flutter", "android", "ios", "agile", "scrum", "figma",
}

_ACTION_VERBS = {
    "developed", "designed", "built", "created", "managed", "led", "implemented",
    "deployed", "optimized", "improved", "analyzed", "collaborated", "delivered",
    "maintained", "tested", "automated", "integrated", "researched", "mentored",
    "coordinated", "launched", "increased", "reduced", "achieved", "established",
    "engineered", "streamlined", "spearheaded", "oversaw", "solved", "secured",
}


def _analyze_ats_fallback(summary: str, exp_descriptions: list) -> tuple:
    text = " ".join([summary] + exp_descriptions).lower()
    words = set(re.findall(r'\b\w+\b', text))
    word_list = re.findall(r'\b\w+\b', text)
    bigrams = {f"{word_list[i]} {word_list[i+1]}" for i in range(len(word_list) - 1)}

    skills = len((words | bigrams) & _SKILL_KEYWORDS)
    verbs  = len(words & _ACTION_VERBS)
    total  = skills + verbs

    if total == 0:   score = 40
    elif total < 3:  score = 55
    elif total < 6:  score = 70
    elif total < 10: score = 85
    else:            score = 95

    return score, skills, verbs


def _analyze_ats(summary: str, exp_descriptions: list) -> tuple:
    nlp = _get_model()
    if nlp is None:
        return _analyze_ats_fallback(summary, exp_descriptions)

    detected_skills = 0
    detected_verbs  = 0
    for text in [summary] + exp_descriptions:
        if not text:
            continue
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ == "SKILL":
                detected_skills += 1
            elif ent.label_ == "ACTION_VERB":
                detected_verbs += 1

    total = detected_skills + detected_verbs
    if total == 0:    score = 40
    elif total < 5:   score = 65
    elif total < 12:  score = 85
    else:             score = 95

    return score, detected_skills, detected_verbs


# ── PDF generator — exact same format as original FYP model ──────────────────
def _generate_pdf(data: dict, ats_score: int, skills_count: int, verbs_count: int) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    W = pdf.w - pdf.l_margin - pdf.r_margin

    def ln1(h=5):
        pdf.set_x(pdf.l_margin)
        pdf.set_y(pdf.get_y() + h)

    def cell_ln(w, h, txt, **kwargs):
        pdf.cell(w, h, txt, **kwargs)
        ln1(h)

    def section_header(title: str):
        pdf.set_font("Arial", style="B", size=12)
        cell_ln(W, 6, title)
        pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
        ln1(2)

    # ── Name ──────────────────────────────────────────────────────────────────
    pdf.set_font("Arial", style="B", size=18)
    cell_ln(W, 10, data["full_name"], align="C")

    # ── Contact info ──────────────────────────────────────────────────────────
    contact_parts = [p for p in [data.get("email"), data.get("phone"), data.get("linkedin")] if p]
    if contact_parts:
        pdf.set_font("Arial", size=10)
        cell_ln(W, 5, "  |  ".join(contact_parts), align="C")
    ln1(5)

    # ── Professional Summary ──────────────────────────────────────────────────
    if data.get("summary"):
        section_header("PROFESSIONAL SUMMARY")
        pdf.set_font("Arial", size=10)
        pdf.multi_cell(W, 5, data["summary"])
        ln1(4)

    # ── Skills ────────────────────────────────────────────────────────────────
    if data.get("skills"):
        section_header("CORE COMPETENCIES / SKILLS")
        pdf.set_font("Arial", size=10)
        pdf.multi_cell(W, 5, ", ".join(data["skills"]))
        ln1(4)

    # ── Work Experience ───────────────────────────────────────────────────────
    if data.get("experience"):
        section_header("PROFESSIONAL EXPERIENCE")
        for exp in data["experience"]:
            role_company = f"{exp['role']} - {exp.get('company', '')}".strip(" -")
            duration     = exp.get("duration", "")
            y_before     = pdf.get_y()

            pdf.set_font("Arial", style="B", size=10)
            pdf.cell(W - 50, 5, role_company)
            pdf.set_font("Arial", style="I", size=10)
            pdf.cell(50, 5, duration, align="R")
            ln1(5)

            if exp.get("description"):
                pdf.set_font("Arial", size=10)
                for line in exp["description"].split("\n"):
                    line = line.strip()
                    if line:
                        pdf.multi_cell(W, 5, f"- {line}")
            ln1(2)

    # ── Education ─────────────────────────────────────────────────────────────
    if data.get("education"):
        section_header("EDUCATION")
        for edu in data["education"]:
            pdf.set_font("Arial", style="B", size=10)
            pdf.cell(W - 50, 5, edu.get("degree", ""))
            pdf.set_font("Arial", style="I", size=10)
            pdf.cell(50, 5, edu.get("year", ""), align="R")
            ln1(5)
            pdf.set_font("Arial", size=10)
            cell_ln(W, 5, edu.get("institution", ""))
            ln1(2)

    # ── ATS Score (inside PDF — same as original model) ───────────────────────
    ln1(5)
    pdf.set_font("Arial", style="B", size=11)
    cell_ln(W, 6, f"AI System Optimization Score: {ats_score}/100")
    pdf.set_font("Arial", style="I", size=9)
    cell_ln(W, 5, f"(Detected Optimized Keywords: {skills_count} Skills, {verbs_count} Action Verbs)")

    buffer = BytesIO()
    pdf.output(buffer)
    return buffer.getvalue()


# ── Main entry point ──────────────────────────────────────────────────────────
def generate_ats_cv(data: dict) -> dict:
    exp_descriptions = [e.get("description", "") for e in data.get("experience", [])]
    score, skills_count, verbs_count = _analyze_ats(data.get("summary", ""), exp_descriptions)

    pdf_bytes = _generate_pdf(data, score, skills_count, verbs_count)
    pdf_b64   = base64.b64encode(pdf_bytes).decode("utf-8")

    return {
        "ats_score":       score,
        "skills_detected": skills_count,
        "verbs_detected":  verbs_count,
        "pdf_base64":      pdf_b64,
        "filename":        f"{data['full_name'].replace(' ', '_')}_ATS_CV.pdf",
    }
