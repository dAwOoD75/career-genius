from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
import spacy
from fpdf import FPDF
import os

app = FastAPI(title="ATS CV Generator Module")

# 1. Trained ML Model ko Load karna
try:
    nlp = spacy.load(".")
except Exception as e:
    print("Error loading model. Make sure you are inside the model folder.")
    raise e

# 2. Input Data Structures
class ExperienceItem(BaseModel):
    company: str
    role: str
    duration: str
    description: str

class AcademicItem(BaseModel):
    institution: str
    degree: str
    year: str

class CVInputData(BaseModel):
    full_name: str
    email: str
    phone: str
    summary: str
    skills: List[str]
    experience: List[ExperienceItem]
    education: List[AcademicItem]

# 3. Helper Function: ML Processing & ATS Scoring
def analyze_ats_score(data: CVInputData):
    detected_skills = 0
    detected_verbs = 0
    
    texts_to_analyze = [data.summary] + [exp.description for exp in data.experience]
    
    for text in texts_to_analyze:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ == "SKILL":
                detected_skills += 1
            elif ent.label_ == "ACTION_VERB":
                detected_verbs += 1
                
    total_found = detected_skills + detected_verbs
    if total_found == 0:
        score = 40
    elif total_found < 5:
        score = 65
    elif total_found < 12:
        score = 85
    else:
        score = 95
        
    return score, detected_skills, detected_verbs

# 4. API Endpoint: Generate ATS CV
@app.post("/api/generate-cv/")
async def generate_cv_endpoint(data: CVInputData):
    try:
        ats_score, skills_count, verbs_count = analyze_ats_score(data)
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Font Settings - Standard Arial (ln=1 means next line, ln=0 means same line)
        pdf.set_font("Arial", style="B", size=18)
        pdf.cell(0, 10, data.full_name, ln=1, align="C")
        
        pdf.set_font("Arial", size=10)
        contact_info = f"{data.email}  |  {data.phone}"
        pdf.cell(0, 5, contact_info, ln=1, align="C")
        pdf.ln(5)
        
        # ---- SECTION: PROFESSIONAL SUMMARY ----
        pdf.set_font("Arial", style="B", size=12)
        pdf.cell(0, 6, "PROFESSIONAL SUMMARY", ln=1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y()) 
        pdf.ln(2)
        pdf.set_font("Arial", size=10)
        pdf.multi_cell(0, 5, data.summary)
        pdf.ln(4)
        
        # ---- SECTION: SKILLS ----
        pdf.set_font("Arial", style="B", size=12)
        pdf.cell(0, 6, "CORE COMPETENCIES / SKILLS", ln=1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        pdf.set_font("Arial", size=10)
        skills_text = ", ".join(data.skills)
        pdf.multi_cell(0, 5, skills_text)
        pdf.ln(4)
        
        # ---- SECTION: WORK EXPERIENCE ----
        pdf.set_font("Arial", style="B", size=12)
        pdf.cell(0, 6, "PROFESSIONAL EXPERIENCE", ln=1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        
        for exp in data.experience:
            pdf.set_font("Arial", style="B", size=10)
            pdf.cell(130, 5, f"{exp.role} - {exp.company}", ln=0)
            pdf.set_font("Arial", style="I", size=10)
            pdf.cell(0, 5, exp.duration, ln=1, align="R")
            
            pdf.set_font("Arial", size=10)
            # CRITICAL FIX: Standard dash (-) used instead of Unicode bullet (•) to prevent crash
            pdf.multi_cell(0, 5, f"- {exp.description}")
            pdf.ln(2)
            
        # ---- SECTION: EDUCATION ----
        pdf.set_font("Arial", style="B", size=12)
        pdf.cell(0, 6, "EDUCATION", ln=1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        
        for edu in data.education:
            pdf.set_font("Arial", style="B", size=10)
            pdf.cell(130, 5, f"{edu.degree}", ln=0)
            pdf.set_font("Arial", style="I", size=10)
            pdf.cell(0, 5, edu.year, ln=1, align="R")
            pdf.set_font("Arial", size=10)
            pdf.cell(0, 5, edu.institution, ln=1)
            pdf.ln(2)

        # ---- ATS METRICS ----
        pdf.ln(5)
        pdf.set_font("Arial", style="B", size=11)
        pdf.cell(0, 6, f"AI System Optimization Score: {ats_score}/100", ln=1)
        pdf.set_font("Arial", style="I", size=9)
        pdf.cell(0, 5, f"(Detected Optimized Keywords: {skills_count} Skills, {verbs_count} Action Verbs)", ln=1)

        os.makedirs("generated_cvs", exist_ok=True)
        file_name = f"generated_cvs/{data.full_name.replace(' ', '_')}_ATS_CV.pdf"
        pdf.output(file_name)
        
        return FileResponse(file_name, media_type="application/pdf", filename=os.path.basename(file_name))
    
    except Exception as error:
        # Agar koi bhi crash ho toh exact detail return karega status 500 ke sath
        raise HTTPException(status_code=500, detail=str(error))