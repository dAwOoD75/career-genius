import re
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

# ── Colours ─────────────────────────────────────────────────────────────────
_PRIMARY  = colors.HexColor("#1E3A8A")   # dark blue  (name, section headers)
_DARK     = colors.HexColor("#111827")   # near-black (bold role/company)
_BODY     = colors.HexColor("#374151")   # body text
_GRAY     = colors.HexColor("#6B7280")   # contact / tagline
_RULE     = colors.HexColor("#BFDBFE")   # light blue rule under section headers

# ── Known ATS section headers ────────────────────────────────────────────────
_HEADERS = {
    "PROFESSIONAL SUMMARY", "SUMMARY", "OBJECTIVE", "PROFILE",
    "WORK EXPERIENCE", "EXPERIENCE", "EMPLOYMENT HISTORY", "CAREER HISTORY",
    "EDUCATION", "ACADEMIC BACKGROUND",
    "SKILLS", "TECHNICAL SKILLS", "KEY SKILLS", "CORE COMPETENCIES",
    "CERTIFICATIONS", "CERTIFICATES", "LICENSES",
    "PROJECTS", "KEY PROJECTS",
    "ACHIEVEMENTS", "ACCOMPLISHMENTS", "AWARDS",
    "LANGUAGES", "REFERENCES", "VOLUNTEER",
    "PUBLICATIONS", "INTERESTS", "CONTACT", "CONTACT INFORMATION",
    "PERSONAL INFORMATION",
}


def _is_header(line: str) -> bool:
    return line.strip().upper().rstrip(":").strip() in _HEADERS


def _is_contact(line: str) -> bool:
    low = line.lower()
    return bool(re.search(r'@|linkedin|github|portfolio|\+\d|\d{7,}', low))


def _is_role_line(line: str) -> bool:
    """Short bold line — job title, company, degree, university."""
    s = line.strip()
    if not s or s.startswith("•") or _is_header(s):
        return False
    # Contains an em-dash, pipe, or looks like "Title — Company" or just a short title
    return (
        len(s) < 90
        and not s[0].isdigit()
        and re.search(r'[A-Z]', s)            # has at least one capital
        and not re.search(r'^\d{4}', s)       # doesn't start with a year
    )


def generate_cv_pdf(cv_text: str) -> bytes:
    """Convert ATS-structured CV text into a professional PDF."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=1.9 * cm,
        rightMargin=1.9 * cm,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm,
    )

    # ── Styles ────────────────────────────────────────────────────────────────
    name_s = ParagraphStyle(
        "Name", fontName="Helvetica-Bold", fontSize=22,
        textColor=_PRIMARY, spaceAfter=3, leading=26,
    )
    tagline_s = ParagraphStyle(
        "Tagline", fontName="Helvetica", fontSize=10,
        textColor=_GRAY, spaceAfter=2, leading=14,
    )
    contact_s = ParagraphStyle(
        "Contact", fontName="Helvetica", fontSize=9,
        textColor=_GRAY, spaceAfter=8, leading=13,
    )
    section_s = ParagraphStyle(
        "Section", fontName="Helvetica-Bold", fontSize=11,
        textColor=_PRIMARY, spaceBefore=12, spaceAfter=2, leading=14,
    )
    role_s = ParagraphStyle(
        "Role", fontName="Helvetica-Bold", fontSize=10,
        textColor=_DARK, spaceBefore=5, spaceAfter=1, leading=14,
    )
    body_s = ParagraphStyle(
        "Body", fontName="Helvetica", fontSize=10,
        textColor=_BODY, spaceAfter=2, leading=14,
    )
    bullet_s = ParagraphStyle(
        "Bullet", fontName="Helvetica", fontSize=10,
        textColor=_BODY, spaceAfter=2, leftIndent=14, leading=14,
    )
    date_s = ParagraphStyle(
        "Date", fontName="Helvetica", fontSize=9,
        textColor=_GRAY, spaceAfter=1, leading=13,
    )

    def section_rule():
        return HRFlowable(
            width="100%", thickness=1.0,
            color=_RULE, spaceAfter=5, spaceBefore=0,
        )

    def divider():
        return HRFlowable(
            width="100%", thickness=0.5,
            color=colors.HexColor("#E5E7EB"),
            spaceAfter=6, spaceBefore=2,
        )

    # ── Parse lines ────────────────────────────────────────────────────────────
    lines = [l.rstrip() for l in cv_text.strip().splitlines()]
    story = []

    found_name   = False
    header_block = True   # still in name/contact header block at top

    for line in lines:
        s = line.strip()

        # ── blank line ─────────────────────────────────────────────────────
        if not s:
            if not header_block:
                story.append(Spacer(1, 3))
            continue

        # ── skip meta note left by fallback generator ─────────────────────
        if s.startswith("[") and s.endswith("]"):
            continue

        # ── Name (very first real line) ───────────────────────────────────
        if not found_name:
            story.append(Paragraph(s, name_s))
            found_name = True
            continue

        # ── Section header ────────────────────────────────────────────────
        if _is_header(s):
            if header_block:
                # Close the name/contact block with a soft divider
                story.append(divider())
                header_block = False
            story.append(Paragraph(s.upper().rstrip(":"), section_s))
            story.append(section_rule())
            continue

        # ── Still in header block (tagline / contact) ─────────────────────
        if header_block:
            if _is_contact(s):
                story.append(Paragraph(s, contact_s))
            else:
                story.append(Paragraph(s, tagline_s))
            continue

        # ── Bullet point ──────────────────────────────────────────────────
        if re.match(r'^[•\-\*]\s*', s):
            text = re.sub(r'^[•\-\*]\s*', '', s)
            story.append(Paragraph(f"• {text}", bullet_s))
            continue

        # ── Date-only line (e.g. "2021 – 2024", "Jan 2020 – Present") ─────
        if re.match(r'^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})', s, re.I) and len(s) < 30:
            story.append(Paragraph(s, date_s))
            continue

        # ── Role / company / degree line ─────────────────────────────────
        if _is_role_line(s):
            story.append(Paragraph(s, role_s))
            continue

        # ── Regular body text ─────────────────────────────────────────────
        story.append(Paragraph(s, body_s))

    doc.build(story)
    return buffer.getvalue()
