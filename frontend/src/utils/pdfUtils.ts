import { jsPDF } from 'jspdf';
import type { Resume, CoverLetter } from '@/types';

// ─── CV Builder types ────────────────────────────────────────────────────────

export interface CVBuilderData {
  full_name: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  profile: string;
  experience: {
    date_range: string;
    location: string;
    position: string;  // "Lab Instructor – University of Central Punjab"
    subtitle: string;  // "2 Semesters (OOP & PF Labs)"
    bullets: string[];
  }[];
  education: {
    location: string;
    degree: string;
    institution: string;
    cgpa: string;
  }[];
  certificates: string[];
  activities: {
    title: string;
    subtitle: string;
    description: string;
  }[];
  projects: {
    name: string;
    tech_stack: string;
    description: string;
  }[];
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─── colour palette ───────────────────────────────────────────────────────────
const PRIMARY   = [37,  99, 235] as [number, number, number]; // blue-600
const DARK      = [15,  23,  42] as [number, number, number]; // slate-900
const MID       = [71,  85, 105] as [number, number, number]; // slate-600
const LIGHT     = [148, 163, 184] as [number, number, number]; // slate-400
const WHITE     = [255, 255, 255] as [number, number, number];
const RULE      = [226, 232, 240] as [number, number, number]; // slate-200

function rule(doc: jsPDF, y: number) {
  doc.setDrawColor(...RULE);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
}

function sectionHeader(doc: jsPDF, y: number, text: string): number {
  doc.setFillColor(...PRIMARY);
  doc.rect(MARGIN, y, 3, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(text.toUpperCase(), MARGIN + 5, y + 4);
  rule(doc, y + 7);
  return y + 12;
}

function guard(doc: jsPDF, y: number, needed = 10): number {
  if (y + needed > PAGE_H - MARGIN) { doc.addPage(); return MARGIN; }
  return y;
}

// ─── RESUME PDF ──────────────────────────────────────────────────────────────

export function downloadResumePDF(resume: Partial<Resume>) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ── Header band ────────────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PAGE_W, 42, 'F');

  // Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text(resume.full_name || 'Untitled', MARGIN, 18);

  // Title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...LIGHT);
  doc.text(resume.title || 'Resume', MARGIN, 25);

  // Contact row
  const contacts: string[] = [];
  if (resume.email)    contacts.push(resume.email);
  if (resume.phone)    contacts.push(resume.phone);
  if (resume.location) contacts.push(resume.location);
  if (resume.linkedin) contacts.push(resume.linkedin);
  if (resume.github)   contacts.push(resume.github);

  doc.setFontSize(8);
  doc.setTextColor(...LIGHT);
  doc.text(contacts.join('  |  '), MARGIN, 32);

  let y = 52;

  // ── Professional Summary ───────────────────────────────────────────────────
  const summaryText = resume.summary || resume.ai_summary || '';
  if (summaryText) {
    y = sectionHeader(doc, y, 'Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...MID);
    const lines = doc.splitTextToSize(summaryText, CONTENT_W);
    y = guard(doc, y, lines.length * 5 + 4);
    doc.text(lines, MARGIN, y);
    y += lines.length * 5 + 6;
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  if (resume.skills?.length) {
    y = guard(doc, y, 20);
    y = sectionHeader(doc, y, 'Skills');

    const cols = 3;
    const colW = CONTENT_W / cols;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);

    resume.skills.forEach((skill, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = MARGIN + col * colW;
      const sy = y + row * 6;
      y = guard(doc, sy + 2, 6);
      doc.setFillColor(...PRIMARY);
      doc.circle(sx + 1.5, sy - 0.5, 1, 'F');
      doc.text(skill, sx + 4, sy);
    });
    y += Math.ceil(resume.skills.length / cols) * 6 + 4;
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (resume.experience?.length) {
    y = guard(doc, y, 20);
    y = sectionHeader(doc, y, 'Work Experience');

    for (const exp of resume.experience) {
      y = guard(doc, y, 16);
      // Position
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(exp.position || '', MARGIN, y);

      // Dates right-aligned
      const dateStr = `${exp.start_date || ''} – ${exp.end_date || 'Present'}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...LIGHT);
      doc.text(dateStr, PAGE_W - MARGIN, y, { align: 'right' });

      y += 5;

      // Company + location
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...MID);
      const compLine = [exp.company, exp.location].filter(Boolean).join(' · ');
      doc.text(compLine, MARGIN, y);
      y += 5;

      // Description
      if (exp.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...MID);
        const descLines = doc.splitTextToSize(exp.description, CONTENT_W);
        y = guard(doc, y, descLines.length * 4.5 + 2);
        doc.text(descLines, MARGIN, y);
        y += descLines.length * 4.5 + 2;
      }

      // Achievements
      for (const ach of exp.achievements || []) {
        y = guard(doc, y, 6);
        doc.setFillColor(...PRIMARY);
        doc.circle(MARGIN + 1.5, y - 1, 1, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...MID);
        const achLines = doc.splitTextToSize(ach, CONTENT_W - 5);
        doc.text(achLines, MARGIN + 4, y);
        y += achLines.length * 4.5 + 1;
      }

      y += 4;
    }
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (resume.education?.length) {
    y = guard(doc, y, 20);
    y = sectionHeader(doc, y, 'Education');

    for (const edu of resume.education) {
      y = guard(doc, y, 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(`${edu.degree}${edu.field_of_study ? ' in ' + edu.field_of_study : ''}`, MARGIN, y);

      const dateStr = `${edu.start_date || ''} – ${edu.end_date || 'Present'}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...LIGHT);
      doc.text(dateStr, PAGE_W - MARGIN, y, { align: 'right' });
      y += 5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...MID);
      const eduLine = [edu.institution, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join('  ·  ');
      doc.text(eduLine, MARGIN, y);
      y += 8;
    }
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  if (resume.projects?.length) {
    y = guard(doc, y, 20);
    y = sectionHeader(doc, y, 'Projects');

    for (const proj of resume.projects) {
      y = guard(doc, y, 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(proj.name, MARGIN, y);
      y += 5;

      if (proj.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...MID);
        const lines = doc.splitTextToSize(proj.description, CONTENT_W);
        y = guard(doc, y, lines.length * 4.5 + 2);
        doc.text(lines, MARGIN, y);
        y += lines.length * 4.5 + 2;
      }

      if (proj.technologies?.length) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(...PRIMARY);
        doc.text('Stack: ' + proj.technologies.join(', '), MARGIN, y);
        y += 5;
      }

      y += 3;
    }
  }

  // ── Certifications ────────────────────────────────────────────────────────
  if (resume.certifications?.length) {
    y = guard(doc, y, 20);
    y = sectionHeader(doc, y, 'Certifications');

    for (const cert of resume.certifications) {
      y = guard(doc, y, 10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      doc.text(cert.name, MARGIN, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...LIGHT);
      const certMeta = [cert.issuer, cert.date].filter(Boolean).join(' · ');
      doc.text(certMeta, PAGE_W - MARGIN, y, { align: 'right' });
      y += 7;
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...LIGHT);
    doc.text(`Generated by Career Genius  •  Page ${i} of ${totalPages}`, PAGE_W / 2, PAGE_H - 6, { align: 'center' });
  }

  const filename = (resume.full_name || resume.title || 'resume').replace(/\s+/g, '_') + '_resume.pdf';
  doc.save(filename);
}

// ─── COVER LETTER PDF ────────────────────────────────────────────────────────

export function downloadCoverLetterPDF(letter: CoverLetter) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Header band
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PAGE_W, 36, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  doc.text('Cover Letter', MARGIN, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...LIGHT);

  const subLine = [
    letter.applicant_name,
    letter.job_title ? `• ${letter.job_title}` : '',
    letter.company_name ? `@ ${letter.company_name}` : '',
  ].filter(Boolean).join('  ');
  doc.text(subLine, MARGIN, 24);

  // Tone badge
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT);
  const toneLabel = `Tone: ${letter.tone}`;
  doc.text(toneLabel, PAGE_W - MARGIN, 24, { align: 'right' });

  let y = 48;

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...LIGHT);
  doc.text(new Date(letter.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), MARGIN, y);
  y += 10;

  // Body text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);

  const paragraphs = (letter.content || '').split('\n').filter(l => l.trim() !== '');

  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, CONTENT_W);
    y = guard(doc, y, lines.length * 5.5 + 4);
    doc.text(lines, MARGIN, y);
    y += lines.length * 5.5 + 4;
  }

  // Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...LIGHT);
    doc.text(`Generated by Career Genius  •  Page ${i} of ${totalPages}`, PAGE_W / 2, PAGE_H - 6, { align: 'center' });
  }

  const filename = `${letter.applicant_name || 'cover'}_${letter.company_name || 'letter'}`.replace(/\s+/g, '_') + '.pdf';
  doc.save(filename);
}

// ─── BUILT CV PDF (ASE format) ───────────────────────────────────────────────

export function downloadBuiltCVPDF(data: CVBuilderData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const LM = 20;        // left margin
  const RM = 20;        // right margin
  const PW = 210;
  const PH = 297;
  const CW = PW - LM - RM;  // 170mm content width
  const LC = 45;             // left column width (dates/location)
  const RX = LM + LC + 4;   // right column start x
  const RC = PW - RM - RX;  // right column width

  let y = 20;

  const guardY = (needed: number) => {
    if (y + needed > PH - 20) { doc.addPage(); y = 20; }
  };

  const sectionHdr = (title: string) => {
    guardY(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 0, 0);
    doc.text(title, LM, y);
    y += 2;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(LM, y, PW - RM, y);
    y += 5;
  };

  // ── Name + Title ──────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  const nameText = data.full_name || 'Full Name';
  doc.text(nameText, LM, y);

  if (data.title.trim()) {
    const nameW = doc.getTextWidth(nameText);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    doc.text('  ' + data.title, LM + nameW, y);
  }
  y += 8;

  // ── Contact (2-column grid) ───────────────────────────────────────────────
  const contacts = [data.email, data.phone, data.linkedin, data.github].filter(Boolean);
  if (contacts.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(70, 70, 70);
    const colW = CW / 2;
    // Layout: left col = even-indexed, right col = odd-indexed
    contacts.forEach((c, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      doc.text(c, LM + col * colW, y + row * 5);
    });
    y += Math.ceil(contacts.length / 2) * 5 + 3;
  }

  // Thin divider
  doc.setDrawColor(190, 190, 190);
  doc.setLineWidth(0.3);
  doc.line(LM, y, PW - RM, y);
  y += 6;

  // ── Profile ───────────────────────────────────────────────────────────────
  if (data.profile.trim()) {
    sectionHdr('Profile');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);
    const plines = doc.splitTextToSize(data.profile, CW);
    guardY(plines.length * 5 + 3);
    doc.text(plines, LM, y);
    y += plines.length * 5 + 6;
  }

  // ── Professional Experience ───────────────────────────────────────────────
  const validExp = data.experience.filter(e => e.position.trim());
  if (validExp.length > 0) {
    sectionHdr('Professional Experience');
    for (const exp of validExp) {
      guardY(18);
      const startY = y;

      // Left column
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      if (exp.date_range) doc.text(exp.date_range, LM, startY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 90, 90);
      if (exp.location) doc.text(exp.location, LM, startY + 5);

      // Right column
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(exp.position, RX, y);
      y += 5;

      if (exp.subtitle.trim()) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(exp.subtitle, RX, y);
        y += 5;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      for (const b of exp.bullets.filter(b => b.trim())) {
        const blines = doc.splitTextToSize('• ' + b, RC);
        guardY(blines.length * 4.5 + 1);
        doc.text(blines, RX, y);
        y += blines.length * 4.5 + 1;
      }

      y = Math.max(y, startY + 12) + 5;
    }
  }

  // ── Education ─────────────────────────────────────────────────────────────
  const validEdu = data.education.filter(e => e.degree.trim() || e.institution.trim());
  if (validEdu.length > 0) {
    sectionHdr('Education');
    for (const edu of validEdu) {
      guardY(16);
      const startY = y;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      if (edu.location) doc.text(edu.location, LM, startY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(edu.degree, RX, y);
      y += 5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      if (edu.institution) { doc.text(edu.institution, RX, y); y += 5; }

      if (edu.cgpa.trim()) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text('CGPA: ' + edu.cgpa, RX, y);
        y += 5;
      }

      y = Math.max(y, startY + 10) + 4;
    }
  }

  // ── Certificates ──────────────────────────────────────────────────────────
  const validCerts = data.certificates.filter(c => c.trim());
  if (validCerts.length > 0) {
    sectionHdr('Certificates');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    const half = Math.ceil(validCerts.length / 2);
    const certColW = CW / 2;
    validCerts.forEach((cert, i) => {
      const col = i < half ? 0 : 1;
      const row = i < half ? i : i - half;
      doc.text('• ' + cert, LM + col * certColW, y + row * 5.5);
    });
    y += half * 5.5 + 5;
  }

  // ── Academic & Campus Activities ──────────────────────────────────────────
  const validActs = data.activities.filter(a => a.title.trim());
  if (validActs.length > 0) {
    sectionHdr('Academic and Campus Activities');
    for (const act of validActs) {
      guardY(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(act.title, LM, y);
      y += 5;

      if (act.subtitle.trim()) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(act.subtitle, LM, y);
        y += 4.5;
      }

      if (act.description.trim()) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        const lines = doc.splitTextToSize(act.description, CW);
        doc.text(lines, LM, y);
        y += lines.length * 4.5 + 5;
      }
    }
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  const validProj = data.projects.filter(p => p.name.trim());
  if (validProj.length > 0) {
    sectionHdr('Projects');
    for (const proj of validProj) {
      guardY(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(proj.name, LM, y);
      y += 5;

      if (proj.tech_stack.trim()) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(proj.tech_stack, LM, y);
        y += 4.5;
      }

      if (proj.description.trim()) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(40, 40, 40);
        const lines = doc.splitTextToSize(proj.description, CW);
        doc.text(lines, LM, y);
        y += lines.length * 5 + 5;
      }
    }
  }

  const filename = (data.full_name || 'cv').replace(/\s+/g, '_') + '_CV.pdf';
  doc.save(filename);
}
