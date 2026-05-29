import { useState } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import { downloadBuiltCVPDF, CVBuilderData } from '@/utils/pdfUtils';
import toast from 'react-hot-toast';

type ExpEntry      = CVBuilderData['experience'][0];
type EduEntry      = CVBuilderData['education'][0];
type ActivityEntry = CVBuilderData['activities'][0];
type ProjectEntry  = CVBuilderData['projects'][0];

const emptyExp      = (): ExpEntry      => ({ date_range: '', location: '', position: '', subtitle: '', bullets: [''] });
const emptyEdu      = (): EduEntry      => ({ location: '', degree: '', institution: '', cgpa: '' });
const emptyActivity = (): ActivityEntry => ({ title: '', subtitle: '', description: '' });
const emptyProject  = (): ProjectEntry  => ({ name: '', tech_stack: '', description: '' });

const INIT: CVBuilderData = {
  full_name: '', title: '', email: '', phone: '', linkedin: '', github: '',
  profile: '',
  experience: [emptyExp()],
  education:  [emptyEdu()],
  certificates: [''],
  activities: [emptyActivity()],
  projects:   [emptyProject()],
};

export default function CVBuilderForm() {
  const [data, setData] = useState<CVBuilderData>(INIT);

  const upd = <K extends keyof CVBuilderData>(key: K, val: CVBuilderData[K]) =>
    setData(d => ({ ...d, [key]: val }));

  // ── Experience helpers ──────────────────────────────────────────────────────
  const updExp = (i: number, field: keyof ExpEntry, val: string) =>
    setData(d => {
      const exp = d.experience.map((e, j) => j === i ? { ...e, [field]: val } : e);
      return { ...d, experience: exp };
    });

  const updBullet = (ei: number, bi: number, val: string) =>
    setData(d => {
      const exp = d.experience.map((e, j) => {
        if (j !== ei) return e;
        const bullets = e.bullets.map((b, k) => k === bi ? val : b);
        return { ...e, bullets };
      });
      return { ...d, experience: exp };
    });

  const addBullet    = (i: number) => setData(d => ({ ...d, experience: d.experience.map((e, j) => j === i ? { ...e, bullets: [...e.bullets, ''] } : e) }));
  const removeBullet = (ei: number, bi: number) => setData(d => ({ ...d, experience: d.experience.map((e, j) => j === ei ? { ...e, bullets: e.bullets.filter((_, k) => k !== bi) } : e) }));

  // ── Education helpers ───────────────────────────────────────────────────────
  const updEdu = (i: number, field: keyof EduEntry, val: string) =>
    setData(d => ({ ...d, education: d.education.map((e, j) => j === i ? { ...e, [field]: val } : e) }));

  // ── Activities helpers ──────────────────────────────────────────────────────
  const updAct = (i: number, field: keyof ActivityEntry, val: string) =>
    setData(d => ({ ...d, activities: d.activities.map((a, j) => j === i ? { ...a, [field]: val } : a) }));

  // ── Projects helpers ────────────────────────────────────────────────────────
  const updProj = (i: number, field: keyof ProjectEntry, val: string) =>
    setData(d => ({ ...d, projects: d.projects.map((p, j) => j === i ? { ...p, [field]: val } : p) }));

  // ── Generate ────────────────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!data.full_name.trim()) { toast.error('Please enter your full name'); return; }
    try {
      downloadBuiltCVPDF(data);
      toast.success('CV downloaded!');
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  const inp  = 'input-field text-sm py-2.5';
  const ta   = 'input-field text-sm py-2.5 resize-none';
  const lbl  = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5';
  const addBtn = 'flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg px-2.5 py-1.5 hover:bg-indigo-50 transition-colors';
  const secNum = (n: number) => (
    <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">{n}</span>
  );

  return (
    <div className="space-y-5">

      {/* 1 — Personal Information */}
      <div className="card">
        <h3 className="text-gray-900 font-bold mb-4 text-sm flex items-center gap-2">
          {secNum(1)} Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Full Name *</label>
            <input className={inp} placeholder="Muhammad Dawood" value={data.full_name} onChange={e => upd('full_name', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Professional Title</label>
            <input className={inp} placeholder="Associate Software Engineer" value={data.title} onChange={e => upd('title', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input className={inp} placeholder="you@example.com" value={data.email} onChange={e => upd('email', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Phone</label>
            <input className={inp} placeholder="+92 300 1234567" value={data.phone} onChange={e => upd('phone', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>LinkedIn URL</label>
            <input className={inp} placeholder="linkedin.com/in/username" value={data.linkedin} onChange={e => upd('linkedin', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>GitHub URL</label>
            <input className={inp} placeholder="github.com/username" value={data.github} onChange={e => upd('github', e.target.value)} />
          </div>
        </div>
      </div>

      {/* 2 — Profile */}
      <div className="card">
        <h3 className="text-gray-900 font-bold mb-4 text-sm flex items-center gap-2">
          {secNum(2)} Profile / Summary
        </h3>
        <textarea
          className={`${ta} w-full`}
          rows={4}
          placeholder="Motivated final-year BSCS student (CGPA: 3.45) with hands-on experience in software development..."
          value={data.profile}
          onChange={e => upd('profile', e.target.value)}
        />
      </div>

      {/* 3 — Professional Experience */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">{secNum(3)} Professional Experience</h3>
          <button className={addBtn} onClick={() => upd('experience', [...data.experience, emptyExp()])}>
            <Plus size={13} /> Add Entry
          </button>
        </div>
        <div className="space-y-5">
          {data.experience.map((exp, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
              {data.experience.length > 1 && (
                <button className="absolute top-3 right-3 text-red-400 hover:text-red-600" onClick={() => upd('experience', data.experience.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Date Range</label>
                  <input className={inp} placeholder="06/2025 – 08/2025" value={exp.date_range} onChange={e => updExp(i, 'date_range', e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Location</label>
                  <input className={inp} placeholder="Lahore, Pakistan" value={exp.location} onChange={e => updExp(i, 'location', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lbl}>Position & Company</label>
                <input className={inp} placeholder="Python/Django Intern – Webbuggs" value={exp.position} onChange={e => updExp(i, 'position', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Subtitle (optional)</label>
                <input className={inp} placeholder="e.g. 2 Semesters (OOP & PF Labs)" value={exp.subtitle} onChange={e => updExp(i, 'subtitle', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Bullet Points</label>
                <div className="space-y-2">
                  {exp.bullets.map((b, bi) => (
                    <div key={bi} className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm flex-shrink-0">•</span>
                      <input
                        className={`${inp} flex-1`}
                        placeholder="Developed a POS system using Django REST Framework..."
                        value={b}
                        onChange={e => updBullet(i, bi, e.target.value)}
                      />
                      {exp.bullets.length > 1 && (
                        <button className="text-red-400 hover:text-red-600 flex-shrink-0" onClick={() => removeBullet(i, bi)}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1" onClick={() => addBullet(i)}>
                    <Plus size={12} /> Add bullet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 — Education */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">{secNum(4)} Education</h3>
          <button className={addBtn} onClick={() => upd('education', [...data.education, emptyEdu()])}>
            <Plus size={13} /> Add Entry
          </button>
        </div>
        <div className="space-y-4">
          {data.education.map((edu, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
              {data.education.length > 1 && (
                <button className="absolute top-3 right-3 text-red-400 hover:text-red-600" onClick={() => upd('education', data.education.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Location</label>
                  <input className={inp} placeholder="Lahore, Pakistan" value={edu.location} onChange={e => updEdu(i, 'location', e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Degree</label>
                  <input className={inp} placeholder="BSCS" value={edu.degree} onChange={e => updEdu(i, 'degree', e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Institution</label>
                  <input className={inp} placeholder="UCP (University Of Central Punjab)" value={edu.institution} onChange={e => updEdu(i, 'institution', e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>CGPA (optional)</label>
                  <input className={inp} placeholder="3.45" value={edu.cgpa} onChange={e => updEdu(i, 'cgpa', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 — Certificates */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">{secNum(5)} Certificates</h3>
          <button className={addBtn} onClick={() => upd('certificates', [...data.certificates, ''])}>
            <Plus size={13} /> Add
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.certificates.map((cert, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gray-400 text-sm flex-shrink-0">•</span>
              <input
                className={`${inp} flex-1`}
                placeholder="MERN Stack"
                value={cert}
                onChange={e => {
                  const certs = data.certificates.map((c, j) => j === i ? e.target.value : c);
                  upd('certificates', certs);
                }}
              />
              {data.certificates.length > 1 && (
                <button className="text-red-400 hover:text-red-600 flex-shrink-0" onClick={() => upd('certificates', data.certificates.filter((_, j) => j !== i))}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6 — Academic & Campus Activities */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">{secNum(6)} Academic &amp; Campus Activities</h3>
          <button className={addBtn} onClick={() => upd('activities', [...data.activities, emptyActivity()])}>
            <Plus size={13} /> Add Entry
          </button>
        </div>
        <div className="space-y-4">
          {data.activities.map((act, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
              {data.activities.length > 1 && (
                <button className="absolute top-3 right-3 text-red-400 hover:text-red-600" onClick={() => upd('activities', data.activities.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </button>
              )}
              <div>
                <label className={lbl}>Title</label>
                <input className={inp} placeholder="Robotics Society" value={act.title} onChange={e => updAct(i, 'title', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Subtitle / Role (optional)</label>
                <input className={inp} placeholder="Core Member · IEEE Sub-society" value={act.subtitle} onChange={e => updAct(i, 'subtitle', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Description</label>
                <textarea className={`${ta} w-full`} rows={2} placeholder="Active member contributing to robotics projects and events..." value={act.description} onChange={e => updAct(i, 'description', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7 — Projects */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-bold text-sm flex items-center gap-2">{secNum(7)} Projects</h3>
          <button className={addBtn} onClick={() => upd('projects', [...data.projects, emptyProject()])}>
            <Plus size={13} /> Add Project
          </button>
        </div>
        <div className="space-y-4">
          {data.projects.map((proj, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
              {data.projects.length > 1 && (
                <button className="absolute top-3 right-3 text-red-400 hover:text-red-600" onClick={() => upd('projects', data.projects.filter((_, j) => j !== i))}>
                  <Trash2 size={14} />
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Project Name</label>
                  <input className={inp} placeholder="Restaurant Ordering System" value={proj.name} onChange={e => updProj(i, 'name', e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Tech Stack</label>
                  <input className={inp} placeholder="Django, Python, PostgreSQL" value={proj.tech_stack} onChange={e => updProj(i, 'tech_stack', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={lbl}>Description</label>
                <textarea className={`${ta} w-full`} rows={2} placeholder="Built a web app where users can order and rate food..." value={proj.description} onChange={e => updProj(i, 'description', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        className="w-full py-4 rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}
      >
        <Download size={18} /> Generate &amp; Download CV PDF
      </button>
    </div>
  );
}
