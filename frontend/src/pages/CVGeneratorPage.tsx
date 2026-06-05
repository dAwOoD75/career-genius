import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, User, Briefcase, GraduationCap, Wrench,
  Plus, Trash2, Download, ChevronRight, ChevronLeft,
  Zap, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

// ── Types ────────────────────────────────────────────────────────────────────
interface ExperienceItem { company: string; role: string; duration: string; description: string; }
interface EducationItem  { institution: string; degree: string; year: string; }

interface CVForm {
  full_name: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
}

interface ATSResult {
  ats_score: number;
  skills_detected: number;
  verbs_detected: number;
  pdf_base64: string;
  filename: string;
}

const EMPTY_EXP: ExperienceItem = { company: '', role: '', duration: '', description: '' };
const EMPTY_EDU: EducationItem  = { institution: '', degree: '', year: '' };

const STEPS = [
  { id: 0, label: 'Personal Info', icon: User },
  { id: 1, label: 'Summary',       icon: FileText },
  { id: 2, label: 'Skills',        icon: Wrench },
  { id: 3, label: 'Experience',    icon: Briefcase },
  { id: 4, label: 'Education',     icon: GraduationCap },
];

// ── Score colour ─────────────────────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 85) return '#10b981';
  if (score >= 65) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Excellent';
  if (score >= 65) return 'Good';
  return 'Needs Work';
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function CVGeneratorPage({ embedded = false }: { embedded?: boolean }) {
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ATSResult | null>(null);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState<CVForm>({
    full_name: '', email: '', phone: '', linkedin: '',
    summary: '',
    skills: [],
    experience: [{ ...EMPTY_EXP }],
    education:  [{ ...EMPTY_EDU }],
  });

  // ── field helpers ─────────────────────────────────────────────────────────
  const setField = (key: keyof CVForm, value: unknown) =>
    setForm(f => ({ ...f, [key]: value }));

  const setExp = (i: number, key: keyof ExperienceItem, val: string) =>
    setForm(f => { const e = [...f.experience]; e[i] = { ...e[i], [key]: val }; return { ...f, experience: e }; });

  const setEdu = (i: number, key: keyof EducationItem, val: string) =>
    setForm(f => { const e = [...f.education]; e[i] = { ...e[i], [key]: val }; return { ...f, education: e }; });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) { setField('skills', [...form.skills, s]); }
    setSkillInput('');
  };

  const removeSkill = (i: number) =>
    setField('skills', form.skills.filter((_, idx) => idx !== i));

  // ── generate ─────────────────────────────────────────────────────────────
  const generate = async () => {
    if (!form.full_name.trim()) { toast.error('Full name is required'); setStep(0); return; }
    setLoading(true);
    try {
      const { data } = await api.post<ATSResult>('/cv-generator/generate', form);
      setResult(data);
      toast.success('CV generated successfully!');
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  // ── download ──────────────────────────────────────────────────────────────
  const downloadPDF = () => {
    if (!result) return;
    const bytes = atob(result.pdf_base64);
    const arr   = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: 'application/pdf' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── step panels ───────────────────────────────────────────────────────────
  const panels: Record<number, JSX.Element> = {
    0: (
      <div className="space-y-4">
        <h2 className="font-bold text-gray-900 text-lg">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input className="input" placeholder="e.g. Muhammad Dawood" value={form.full_name}
              onChange={e => setField('full_name', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="dawood@example.com" value={form.email}
              onChange={e => setField('email', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="input" placeholder="+92 300 0000000" value={form.phone}
              onChange={e => setField('phone', e.target.value)} />
          </div>
          <div>
            <label className="form-label">LinkedIn (optional)</label>
            <input className="input" placeholder="linkedin.com/in/username" value={form.linkedin}
              onChange={e => setField('linkedin', e.target.value)} />
          </div>
        </div>
      </div>
    ),

    1: (
      <div className="space-y-4">
        <h2 className="font-bold text-gray-900 text-lg">Professional Summary</h2>
        <p className="text-sm text-gray-500">Write 2–4 sentences about your background and goals. Use action verbs and skills for a higher ATS score.</p>
        <textarea
          className="input resize-none"
          rows={6}
          placeholder="e.g. Results-driven software engineer with 3 years of experience in Python and React. Proficient in building scalable web applications and RESTful APIs..."
          value={form.summary}
          onChange={e => setField('summary', e.target.value)}
        />
      </div>
    ),

    2: (
      <div className="space-y-4">
        <h2 className="font-bold text-gray-900 text-lg">Skills</h2>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Type a skill and press Add (e.g. Python)"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <button onClick={addSkill} className="btn-primary px-4 py-2 flex items-center gap-1.5 text-sm">
            <Plus size={15} /> Add
          </button>
        </div>
        {form.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.skills.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-3 py-1 text-sm font-medium">
                {s}
                <button onClick={() => removeSkill(i)} className="text-indigo-400 hover:text-red-500">
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        {form.skills.length === 0 && (
          <p className="text-gray-400 text-sm">No skills added yet.</p>
        )}
      </div>
    ),

    3: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Work Experience</h2>
          <button onClick={() => setField('experience', [...form.experience, { ...EMPTY_EXP }])}
            className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2">
            <Plus size={15} /> Add Entry
          </button>
        </div>
        <div className="space-y-4">
          {form.experience.map((exp, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Entry {i + 1}</span>
                {form.experience.length > 1 && (
                  <button onClick={() => setField('experience', form.experience.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Job Title *</label>
                  <input className="input" placeholder="e.g. Software Engineer" value={exp.role}
                    onChange={e => setExp(i, 'role', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Company</label>
                  <input className="input" placeholder="e.g. Google" value={exp.company}
                    onChange={e => setExp(i, 'company', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Duration</label>
                  <input className="input" placeholder="e.g. Jan 2022 – Present" value={exp.duration}
                    onChange={e => setExp(i, 'duration', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Description</label>
                  <textarea className="input resize-none" rows={3}
                    placeholder="Describe responsibilities and achievements. Each line becomes a bullet point."
                    value={exp.description}
                    onChange={e => setExp(i, 'description', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),

    4: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-lg">Education</h2>
          <button onClick={() => setField('education', [...form.education, { ...EMPTY_EDU }])}
            className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2">
            <Plus size={15} /> Add Entry
          </button>
        </div>
        <div className="space-y-4">
          {form.education.map((edu, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Entry {i + 1}</span>
                {form.education.length > 1 && (
                  <button onClick={() => setField('education', form.education.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="form-label">Degree *</label>
                  <input className="input" placeholder="e.g. BS Computer Science" value={edu.degree}
                    onChange={e => setEdu(i, 'degree', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Institution</label>
                  <input className="input" placeholder="e.g. FAST NUCES" value={edu.institution}
                    onChange={e => setEdu(i, 'institution', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Year</label>
                  <input className="input" placeholder="e.g. 2020 – 2024" value={edu.year}
                    onChange={e => setEdu(i, 'year', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className={embedded ? 'space-y-6' : 'p-6 max-w-5xl mx-auto space-y-6'}>
      {/* Header — hidden when embedded inside another page */}
      {!embedded && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title">ATS CV Generator</h1>
          <p className="section-subtitle">Fill in your details and get an ATS-optimized CV with an AI score.</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left: form + stepper */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="xl:col-span-2 space-y-5">

          {/* Step tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {STEPS.map(s => {
              const Icon = s.icon;
              const active = s.id === step;
              const done   = s.id < step;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : done
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {done ? <CheckCircle size={13} /> : <Icon size={13} />}
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Step content */}
          <div className="card min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.18 }}
              >
                {panels[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Previous
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={generate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                  : <><Zap size={16} /> Generate CV</>}
              </button>
            )}
          </div>
        </motion.div>

        {/* Right: ATS result panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">

          {result ? (
            <>
              {/* Score card */}
              <div className="card text-center space-y-3">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">ATS Score</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke={scoreColor(result.ats_score)}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - result.ats_score / 100)}`}
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold" style={{ color: scoreColor(result.ats_score) }}>
                      {result.ats_score}
                    </span>
                    <span className="text-xs text-gray-400">/100</span>
                  </div>
                </div>
                <p className="font-semibold text-sm" style={{ color: scoreColor(result.ats_score) }}>
                  {scoreLabel(result.ats_score)}
                </p>
              </div>

              {/* Stats */}
              <div className="card space-y-3">
                <p className="text-sm font-bold text-gray-700">Detection Results</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Skills Detected</span>
                  <span className="font-bold text-indigo-600">{result.skills_detected}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Action Verbs</span>
                  <span className="font-bold text-purple-600">{result.verbs_detected}</span>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    {result.ats_score < 65
                      ? 'Add more skills and action verbs to your summary and experience to improve your ATS score.'
                      : result.ats_score < 85
                      ? 'Good start! Add more specific technical skills and strong action verbs for a higher score.'
                      : 'Excellent! Your CV is well-optimized for ATS systems.'}
                  </p>
                </div>
              </div>

              {/* Download */}
              <button
                onClick={downloadPDF}
                className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
              >
                <Download size={18} /> Download PDF
              </button>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)' }}>
                <FileText size={28} style={{ color: '#4F46E5' }} />
              </div>
              <p className="font-semibold text-gray-700">ATS Score will appear here</p>
              <p className="text-gray-400 text-sm max-w-[200px]">
                Fill in the form and click <strong>Generate CV</strong> on the last step.
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="card space-y-2">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">ATS Tips</p>
            {[
              'Use strong action verbs (Developed, Managed, Built)',
              'Include relevant technical skills',
              'Keep descriptions concise and specific',
              'Quantify achievements where possible',
            ].map((tip, i) => (
              <div key={i} className="flex gap-2 text-xs text-gray-500">
                <span className="text-indigo-400 font-bold flex-shrink-0">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
