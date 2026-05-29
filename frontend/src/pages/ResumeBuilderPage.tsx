import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Download, Sparkles, Save } from 'lucide-react';
import { resumeService } from '@/services/resumeService';
import { Resume } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';
import { downloadResumePDF } from '@/utils/pdfUtils';

const TEMPLATES = [
  { id: 'modern', label: 'Modern', color: 'from-blue-500 to-cyan-500' },
  { id: 'minimal', label: 'Minimal', color: 'from-slate-400 to-slate-600' },
  { id: 'creative', label: 'Creative', color: 'from-violet-500 to-pink-500' },
  { id: 'executive', label: 'Executive', color: 'from-amber-500 to-orange-500' },
];

const emptyResume: Partial<Resume> = {
  title: 'My Resume',
  template: 'modern',
  full_name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Resume> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [view, setView] = useState<'list' | 'editor'>('list');

  useEffect(() => {
    resumeService.getResumes()
      .then(setResumes)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const startNew = () => {
    setEditing({ ...emptyResume, full_name: user?.full_name || '', email: user?.email || '' });
    setView('editor');
  };

  const editResume = (resume: Resume) => {
    setEditing({ ...resume });
    setView('editor');
  };

  const saveResume = async () => {
    if (!editing) return;
    setIsSaving(true);
    try {
      if (editing.id) {
        const updated = await resumeService.updateResume(editing.id, editing);
        setResumes(prev => prev.map(r => r.id === updated.id ? updated : r));
        toast.success('Resume updated!');
      } else {
        const created = await resumeService.createResume(editing);
        setResumes(prev => [created, ...prev]);
        setEditing(created);
        toast.success('Resume created!');
      }
    } catch {
      toast.error('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteResume = async (id: number) => {
    try {
      await resumeService.deleteResume(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success('Resume deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const generateSummary = async () => {
    if (!editing?.skills?.length) return toast.error('Add some skills first');
    setIsGeneratingSummary(true);
    try {
      const summary = await resumeService.generateAISummary({
        job_title: editing.title || 'Professional',
        skills: editing.skills || [],
        experience_years: editing.experience?.length || 1,
      });
      setEditing(prev => ({ ...prev, summary }));
      toast.success('Summary generated!');
    } catch {
      toast.error('Summary generation failed');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !editing?.skills?.includes(skillInput.trim())) {
      setEditing(prev => ({ ...prev, skills: [...(prev?.skills || []), skillInput.trim()] }));
      setSkillInput('');
    }
  };

  // Resume List View
  if (view === 'list') {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Resume Builder</h1>
            <p className="section-subtitle">Create professional resumes with ease.</p>
          </div>
          <button onClick={startNew} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Resume
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading resumes..." /></div>
        ) : resumes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-20">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Edit3 size={28} className="text-violet-400" />
            </div>
            <h3 className="text-gray-900 font-bold text-xl mb-2">No Resumes Yet</h3>
            <p className="text-gray-400 mb-6">Create your first professional resume with ease.</p>
            <button onClick={startNew} className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} /> Create Resume
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume, i) => {
              const template = TEMPLATES.find(t => t.id === resume.template) || TEMPLATES[0];
              return (
                <motion.div key={resume.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card-hover">
                  <div className={`h-2 bg-gradient-to-r ${template.color} rounded-full mb-4`} />
                  <h3 className="text-gray-900 font-bold text-lg truncate">{resume.title}</h3>
                  <p className="text-gray-400 text-sm mt-0.5">{resume.full_name || 'No name'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge-blue">{template.label}</span>
                    <span className="text-gray-400 text-xs">{new Date(resume.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => editResume(resume)} className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm py-2">
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => { downloadResumePDF(resume); toast.success('Downloading PDF...'); }}
                      className="p-2 bg-primary-50 border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors"
                      title="Download PDF"
                    >
                      <Download size={15} />
                    </button>
                    <button
                      onClick={() => deleteResume(resume.id)}
                      className="p-2 bg-red-50 border border-red-200 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Resume Editor View
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => setView('list')} className="text-gray-400 text-sm hover:text-gray-700 mb-1">← Back to list</button>
          <h1 className="section-title">{editing?.id ? 'Edit Resume' : 'Create Resume'}</h1>
        </div>
        <div className="flex gap-2">
          {editing?.id && (
            <button
              onClick={() => { downloadResumePDF(editing); toast.success('Downloading PDF...'); }}
              className="btn-secondary flex items-center gap-2"
            >
              <Download size={16} /> Download PDF
            </button>
          )}
          <button onClick={saveResume} disabled={isSaving} className="btn-primary flex items-center gap-2">
            {isSaving ? <LoadingSpinner size="sm" /> : <><Save size={16} /> Save</>}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-gray-900 font-bold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Resume Title</label>
              <input className="input-field" value={editing?.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="My Professional Resume" />
            </div>
            <div>
              <label className="label">Template</label>
              <div className="flex gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setEditing(p => ({ ...p, template: t.id }))}
                    className={clsx(
                      'flex-1 py-2 px-2 rounded-xl text-xs font-medium border transition-all',
                      editing?.template === t.id
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-500 hover:border-primary-300'
                    )}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" value={editing?.full_name || ''} onChange={e => setEditing(p => ({ ...p, full_name: e.target.value }))} placeholder="John Doe" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input-field" value={editing?.email || ''} onChange={e => setEditing(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input-field" value={editing?.phone || ''} onChange={e => setEditing(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input-field" value={editing?.location || ''} onChange={e => setEditing(p => ({ ...p, location: e.target.value }))} placeholder="San Francisco, CA" />
            </div>
            <div>
              <label className="label">LinkedIn</label>
              <input className="input-field" value={editing?.linkedin || ''} onChange={e => setEditing(p => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/johndoe" />
            </div>
            <div>
              <label className="label">GitHub</label>
              <input className="input-field" value={editing?.github || ''} onChange={e => setEditing(p => ({ ...p, github: e.target.value }))} placeholder="github.com/johndoe" />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 font-bold">Professional Summary</h2>
            <button onClick={generateSummary} disabled={isGeneratingSummary} className="btn-secondary text-sm flex items-center gap-1.5 py-2 px-3">
              {isGeneratingSummary ? <LoadingSpinner size="sm" /> : <Sparkles size={14} className="text-primary-500" />}
              Generate with AI
            </button>
          </div>
          <textarea
            className="input-field resize-none"
            rows={4}
            value={editing?.summary || ''}
            onChange={e => setEditing(p => ({ ...p, summary: e.target.value }))}
            placeholder="Write or generate a professional summary..."
          />
        </div>

        {/* Skills */}
        <div className="card">
          <h2 className="text-gray-900 font-bold mb-4">Skills</h2>
          <div className="flex gap-2 mb-3">
            <input
              className="input-field flex-1"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill (press Enter)"
            />
            <button onClick={addSkill} className="btn-primary px-4">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {editing?.skills?.map(skill => (
              <span
                key={skill}
                className="badge-blue flex items-center gap-1.5 cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                onClick={() => setEditing(p => ({ ...p, skills: p?.skills?.filter(s => s !== skill) }))}
              >
                {skill} <span className="opacity-60">×</span>
              </span>
            ))}
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm card py-6 bg-gray-50">
          Experience, Education, Projects, and Certifications sections can be added and will be saved with your resume. Click Save to preserve all changes.
        </div>
      </div>
    </div>
  );
}
