import json
from typing import List, Optional, Dict, Any
from app.services.ai_service import call_openai, SYSTEM_PROMPTS
from app.utils.logger import app_logger

# -----------------------------------------------------------------------
# PKR values are MONTHLY (Pakistani market quotes monthly).
# All other currencies are ANNUAL.
# -----------------------------------------------------------------------

# Base data: (min, max, median) — Pakistan 2025 realistic monthly PKR
# Source: rozee.pk, linkedin salary, local IT company benchmarks
# Base is for 3-5 years experience (mid-level)
PKR_MONTHLY_DATA = {
    # Software / Engineering
    "software engineer":            ( 80_000,  220_000,  130_000),
    "senior software engineer":     (180_000,  400_000,  260_000),
    "junior software engineer":     ( 40_000,   90_000,   60_000),
    "associate software engineer":  ( 40_000,   85_000,   58_000),
    "principal engineer":           (300_000,  600_000,  420_000),
    "software architect":           (350_000,  700_000,  480_000),

    # Frontend / Backend / Full Stack
    "frontend developer":           ( 60_000,  180_000,  110_000),
    "backend developer":            ( 70_000,  200_000,  125_000),
    "full stack developer":         ( 75_000,  220_000,  135_000),
    "full stack engineer":          ( 75_000,  220_000,  135_000),
    "web developer":                ( 50_000,  150_000,   90_000),

    # Mobile
    "mobile developer":             ( 70_000,  200_000,  125_000),
    "android developer":            ( 65_000,  180_000,  115_000),
    "ios developer":                ( 70_000,  190_000,  120_000),
    "flutter developer":            ( 65_000,  185_000,  118_000),
    "react native developer":       ( 65_000,  185_000,  118_000),

    # AI / ML / Data
    "data scientist":               (120_000,  320_000,  200_000),
    "data engineer":                (110_000,  290_000,  185_000),
    "machine learning engineer":    (150_000,  400_000,  250_000),
    "ai engineer":                  (150_000,  420_000,  260_000),
    "nlp engineer":                 (140_000,  380_000,  240_000),
    "data analyst":                 ( 60_000,  160_000,  100_000),
    "business intelligence analyst":( 65_000,  170_000,  105_000),

    # DevOps / Cloud / Infrastructure
    "devops engineer":              (110_000,  300_000,  190_000),
    "cloud engineer":               (110_000,  300_000,  190_000),
    "site reliability engineer":    (130_000,  330_000,  210_000),
    "infrastructure engineer":      ( 90_000,  240_000,  155_000),
    "network engineer":             ( 60_000,  160_000,  100_000),

    # Security
    "cybersecurity analyst":        ( 90_000,  250_000,  155_000),
    "security engineer":            (100_000,  280_000,  170_000),
    "penetration tester":           ( 90_000,  260_000,  160_000),

    # QA / Testing
    "qa engineer":                  ( 50_000,  140_000,   85_000),
    "qa automation engineer":       ( 60_000,  170_000,  105_000),
    "software tester":              ( 45_000,  120_000,   75_000),

    # Management / Product
    "product manager":              (120_000,  350_000,  210_000),
    "project manager":              ( 90_000,  280_000,  165_000),
    "scrum master":                 ( 80_000,  220_000,  140_000),
    "business analyst":             ( 70_000,  190_000,  120_000),
    "technical lead":               (180_000,  420_000,  280_000),
    "team lead":                    (150_000,  370_000,  240_000),

    # Database
    "database administrator":       ( 65_000,  180_000,  110_000),
    "database engineer":            ( 65_000,  180_000,  110_000),

    # Design
    "ui ux designer":               ( 55_000,  160_000,  100_000),
    "ux designer":                  ( 55_000,  155_000,   98_000),
    "ui designer":                  ( 45_000,  130_000,   80_000),
    "graphic designer":             ( 35_000,  100_000,   60_000),
    "product designer":             ( 60_000,  175_000,  108_000),

    # Marketing / Content
    "digital marketer":             ( 45_000,  130_000,   78_000),
    "seo specialist":               ( 40_000,  110_000,   68_000),
    "content writer":               ( 30_000,   90_000,   55_000),
    "social media manager":         ( 40_000,  110_000,   68_000),

    # Support / Other
    "technical support engineer":   ( 40_000,  100_000,   65_000),
    "it support":                   ( 35_000,   90_000,   58_000),
}

ANNUAL_DATA = {
    "software engineer":        {"USD": (70_000, 150_000,  95_000), "GBP": (45_000, 90_000, 65_000)},
    "data scientist":           {"USD": (80_000, 160_000, 115_000), "GBP": (50_000, 100_000, 72_000)},
    "product manager":          {"USD": (90_000, 175_000, 130_000), "GBP": (60_000, 115_000, 85_000)},
    "devops engineer":          {"USD": (85_000, 160_000, 118_000), "GBP": (55_000, 105_000, 78_000)},
    "frontend developer":       {"USD": (65_000, 130_000,  90_000), "GBP": (42_000, 85_000, 60_000)},
    "backend developer":        {"USD": (70_000, 140_000,  98_000), "GBP": (45_000, 92_000, 66_000)},
    "full stack developer":     {"USD": (72_000, 145_000, 100_000), "GBP": (48_000, 95_000, 68_000)},
    "machine learning engineer":{"USD": (95_000, 185_000, 135_000), "GBP": (62_000, 120_000, 90_000)},
    "cybersecurity analyst":    {"USD": (75_000, 145_000, 105_000), "GBP": (48_000, 92_000, 68_000)},
}

COUNTRY_CURRENCIES = {
    "Pakistan": "PKR",
    "United States": "USD", "United Kingdom": "GBP",
    "Canada": "CAD", "Australia": "AUD",
    "Germany": "EUR", "UAE": "AED",
    "India": "INR", "Singapore": "SGD",
    "Netherlands": "EUR",
}

EXPERIENCE_MULTIPLIERS = {
    (0, 1):             0.45,  # Fresh / internship level
    (1, 2):             0.65,  # Junior
    (2, 3):             0.82,  # Junior-mid
    (3, 5):             1.00,  # Mid-level (base)
    (5, 7):             1.30,  # Senior
    (7, 10):            1.65,  # Senior+ / Lead
    (10, 15):           2.00,  # Principal / Manager
    (15, float("inf")): 2.40,  # Director / Architect
}

# Monthly PKR skill premium (Pakistan 2025 market)
PKR_SKILL_BONUSES = {
    # AI / ML — highest demand
    "llm":                  35_000,
    "generative ai":        35_000,
    "machine learning":     28_000,
    "deep learning":        28_000,
    "pytorch":              25_000,
    "tensorflow":           20_000,
    "nlp":                  25_000,
    "computer vision":      25_000,
    "langchain":            30_000,
    "openai api":           25_000,
    # Cloud & DevOps
    "kubernetes":           22_000,
    "aws":                  20_000,
    "azure":                18_000,
    "gcp":                  18_000,
    "terraform":            20_000,
    "docker":               12_000,
    "devops":               18_000,
    "ci/cd":                12_000,
    # Mobile
    "flutter":              18_000,
    "react native":         18_000,
    "kotlin":               15_000,
    "swift":                15_000,
    # Frontend / Backend
    "react":                14_000,
    "next.js":              14_000,
    "typescript":           12_000,
    "node.js":              10_000,
    "golang":               22_000,
    "rust":                 25_000,
    "django":                8_000,
    "fastapi":              10_000,
    "graphql":              10_000,
    "microservices":        15_000,
    # Security
    "cybersecurity":        22_000,
    "penetration testing":  28_000,
    "ethical hacking":      28_000,
    # Data
    "data analysis":        10_000,
    "power bi":              9_000,
    "tableau":               9_000,
    "python":                8_000,
    "blockchain":           25_000,
}

# Annual bonus per skill for non-PKR
ANNUAL_SKILL_BONUSES = {
    "machine learning": 15_000, "kubernetes": 12_000,
    "aws": 10_000, "react": 8_000, "typescript": 7_000,
    "go": 10_000, "rust": 12_000, "pytorch": 12_000,
    "terraform": 10_000, "security": 10_000,
}


def _get_experience_multiplier(years: float) -> float:
    for (low, high), mult in EXPERIENCE_MULTIPLIERS.items():
        if low <= years < high:
            return mult
    return 2.10


def _find_pkr_base(job_key: str):
    """Return PKR monthly base tuple for the closest matching role."""
    job_key = job_key.lower().strip()
    # Exact match first
    if job_key in PKR_MONTHLY_DATA:
        return PKR_MONTHLY_DATA[job_key]
    # Partial match
    for role, data in PKR_MONTHLY_DATA.items():
        if role in job_key or all(w in job_key for w in role.split()):
            return data
    # Word overlap
    for role, data in PKR_MONTHLY_DATA.items():
        role_words = set(role.split())
        job_words = set(job_key.split())
        if role_words & job_words:
            return data
    # Generic fallback for Pakistan
    return (80_000, 200_000, 130_000)


def estimate_salary(job_title: str, experience_years: float, country: str, skills: List[str]) -> Dict[str, Any]:
    currency = COUNTRY_CURRENCIES.get(country, "USD")
    mult = _get_experience_multiplier(experience_years)

    if currency == "PKR":
        base = _find_pkr_base(job_title)
        bonuses = PKR_SKILL_BONUSES
    else:
        job_key = job_title.lower().strip()
        base_entry = None
        for role, data in ANNUAL_DATA.items():
            if role in job_key or any(w in job_key for w in role.split()):
                base_entry = data.get(currency) or data.get("USD")
                break
        base = base_entry or (65_000, 130_000, 90_000)
        bonuses = ANNUAL_SKILL_BONUSES

    salary_min    = int(base[0] * mult)
    salary_max    = int(base[1] * mult)
    salary_median = int(base[2] * mult)

    skill_impact: Dict[str, int] = {}
    for skill in (skills or []):
        bonus = bonuses.get(skill.lower(), 0)
        if bonus:
            adjusted = int(bonus * mult)
            salary_min    += int(adjusted * 0.7)
            salary_max    += adjusted
            salary_median += int(adjusted * 0.85)
            skill_impact[skill] = adjusted

    # Growth projections (same unit — monthly PKR or annual other)
    growth_projection = {
        "year_1": int(salary_median * 1.10),
        "year_3": int(salary_median * 1.30),
        "year_5": int(salary_median * 1.55),
    }

    return {
        "predicted_min":    salary_min,
        "predicted_max":    salary_max,
        "predicted_median": salary_median,
        "currency":         currency,
        "skill_impact":     skill_impact,
        "growth_projection": growth_projection,
    }


async def get_ai_salary_insights(
    job_title: str,
    experience_years: float,
    country: str,
    skills: List[str],
    industry: Optional[str] = None,
    estimated: Dict[str, Any] = None,
) -> Dict[str, Any]:
    """Get AI-driven market insights tailored to the country."""
    currency = COUNTRY_CURRENCIES.get(country, "USD")
    is_pkr = currency == "PKR"
    unit_label = "PKR per month" if is_pkr else f"{currency} per year"
    skills_str = ", ".join(skills[:10]) if skills else "Not specified"

    if estimated:
        est_str = (
            f"Estimated range: {estimated['predicted_min']:,} – {estimated['predicted_max']:,} {unit_label}"
        )
    else:
        est_str = ""

    pakistan_note = (
        "Focus specifically on the Pakistani tech job market (cities: Karachi, Lahore, Islamabad, Rawalpindi). "
        "Consider local companies, multinational offices, and remote-for-foreign-client roles. "
        "All salaries MUST be in PKR per month."
        if is_pkr else ""
    )

    prompt = f"""You are a compensation expert for the {country} job market.
Provide realistic salary market insights for:
- Role: {job_title}
- Experience: {experience_years} years
- Country: {country}
- Skills: {skills_str}
- Industry: {industry or 'Technology'}
{est_str}
{pakistan_note}

Return ONLY valid JSON (no markdown) in this exact structure:
{{
  "market_insights": "2-3 sentences about current market demand, hiring trends, and salary drivers for this role in {country}.",
  "comparable_roles": [
    {{"title": "Junior {job_title}", "salary_min": 0, "salary_max": 0}},
    {{"title": "Senior {job_title}", "salary_min": 0, "salary_max": 0}},
    {{"title": "Lead / Principal", "salary_min": 0, "salary_max": 0}}
  ],
  "top_paying_skills": ["skill1", "skill2", "skill3"],
  "negotiation_tips": ["tip1", "tip2", "tip3"],
  "demand_level": "High"
}}

All salary figures must be in {unit_label}. Use realistic {country} market data only."""

    try:
        response = await call_openai(
            system_prompt=SYSTEM_PROMPTS["salary"],
            user_message=prompt,
            temperature=0.3,
            max_tokens=700,
        )
        cleaned = response.strip()
        if "```" in cleaned:
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.split("```")[0]
        return json.loads(cleaned.strip())
    except Exception as e:
        app_logger.error(f"Salary AI insights failed: {e}")
        if is_pkr:
            return {
                "market_insights": (
                    f"The Pakistani market for {job_title} roles is growing rapidly, driven by the thriving IT export sector. "
                    "Lahore, Karachi, and Islamabad are the main tech hubs. Remote work for international clients "
                    "can significantly increase take-home pay beyond local benchmarks."
                ),
                "comparable_roles": [],
                "top_paying_skills": ["Cloud (AWS/Azure)", "Machine Learning", "React / Flutter"],
                "negotiation_tips": [
                    "Highlight any remote/international project experience",
                    "Certifications (AWS, GCP, PMP) can justify a 20-30% bump",
                    "Compare local vs remote-for-client offers before accepting",
                ],
                "demand_level": "High",
            }
        return {
            "market_insights": f"The {country} market for {job_title} roles remains competitive.",
            "comparable_roles": [],
            "top_paying_skills": ["Cloud", "AI/ML", "Leadership"],
            "negotiation_tips": ["Research market rates", "Highlight unique skills", "Consider total compensation"],
            "demand_level": "Moderate",
        }
