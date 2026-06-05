import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, CheckCircle, XCircle, Lightbulb, Target,
  Mail, ArrowRight, FileText, Send, Bot, User, Sparkles, Plus,
  TrendingUp, Zap, X, Brain, BarChart3, Clock,
  UserCheck, Briefcase, Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import CVGeneratorPage from '@/pages/CVGeneratorPage';
import { cvService } from '@/services/cvService';
import { interviewService } from '@/services/interviewService';
import { salaryService } from '@/services/salaryService';
import { ATSReport, ChatSession, ChatMessage, SalaryPrediction } from '@/types';
import ScoreGauge from '@/components/common/ScoreGauge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts';

type Tab = 'CV Analysis' | 'Mock Interview' | 'Salary Prediction';
const TABS: Tab[] = ['CV Analysis', 'Mock Interview', 'Salary Prediction'];

function fmtAmt(val: number) {
  return val >= 100_000 ? `PKR ${(val / 100_000).toFixed(1)}L` : `PKR ${val.toLocaleString()}`;
}
function shortLbl(val: number) {
  return val >= 100_000 ? `${(val / 100_000).toFixed(0)}L` : `${(val / 1000).toFixed(0)}K`;
}

const ttStyle = {
  contentStyle: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.08)' },
  itemStyle: { color: '#374151' },
};

// ─── CV Analysis ─────────────────────────────────────────────────────────────
function CVAnalysisTab() {
  const [cvSubTab, setCvSubTab] = useState<'analyze' | 'generate'>('analyze');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<ATSReport | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [applyingChanges, setApplyingChanges] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setFile(accepted[0]); setReport(null); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024, multiple: false,
    onDropRejected: () => toast.error('Only PDF files are accepted.'),
  });

  const analyze = async () => {
    if (!file) return toast.error('Please upload a PDF first');
    setIsAnalyzing(true); setSuggestions([]);
    try {
      const r = await cvService.analyzeCV(file);
      setReport(r); toast.success('Analysis complete!');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Analysis failed');
    } finally { setIsAnalyzing(false); }
  };

  const loadSuggestions = async () => {
    if (!report) return;
    setLoadingSuggestions(true);
    try {
      const s = await cvService.getSuggestions(report.id);
      setSuggestions(s);
    } catch { toast.error('Failed to load suggestions'); }
    finally { setLoadingSuggestions(false); }
  };

  const applyChanges = async () => {
    if (!report) return;
    setApplyingChanges(true);
    try {
      await cvService.downloadImprovedCV(report.id);
      toast.success('Improved CV downloaded!');
    } catch { toast.error('Failed to generate improved CV'); }
    finally { setApplyingChanges(false); }
  };

  const radarData = report ? [
    { subject: 'Keywords',     score: report.keyword_score },
    { subject: 'Format',       score: report.format_score },
    { subject: 'Readability',  score: report.readability_score },
    { subject: 'Completeness', score: report.completeness_score },
  ] : [];

  return (
    <div>
      {/* ── Sub-tab selector ── */}
      <div className="flex gap-2 mb-6 bg-gray-50 rounded-xl p-1">
        <button
          onClick={() => setCvSubTab('analyze')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[14px] font-semibold transition-all"
          style={cvSubTab === 'analyze'
            ? { background: '#fff', color: '#4F46E5', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
            : { color: '#6B7280', background: 'transparent' }}
        >
          <Upload size={15} /> Analyze CV
        </button>
        <button
          onClick={() => setCvSubTab('generate')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[14px] font-semibold transition-all"
          style={cvSubTab === 'generate'
            ? { background: '#fff', color: '#7C3AED', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
            : { color: '#6B7280', background: 'transparent' }}
        >
          <Sparkles size={15} /> ATS Generator
        </button>
      </div>

      {/* ── ATS Generator tab ── */}
      {cvSubTab === 'generate' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-violet-700 text-sm">
            Fill in your details step-by-step and get an AI-optimized CV PDF with an ATS score.
          </div>
          <CVGeneratorPage embedded />
        </motion.div>
      )}

      {/* ── Analyze tab: upload form ── */}
      {cvSubTab === 'analyze' && !report && (
        <div>
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-2xl py-16 text-center cursor-pointer transition-all mb-6"
            style={{ borderColor: isDragActive ? '#4F46E5' : file ? '#10B981' : '#D1D5DB', background: isDragActive ? '#EEF2FF' : file ? '#F0FDF4' : '#fff' }}
          >
            <input {...getInputProps()} />
            {file ? (
              <>
                <CheckCircle size={44} className="mx-auto mb-4" style={{ color: '#10B981' }} />
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-gray-400 text-sm mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </>
            ) : (
              <>
                <Upload size={44} className="mx-auto mb-4" style={{ color: '#9CA3AF' }} />
                <p className="text-gray-600 font-medium text-[15px]">Click to upload or drag and drop</p>
                <p className="text-gray-400 text-[13px] mt-1.5">PDF only · Max 10MB</p>
              </>
            )}
          </div>
          <button
            onClick={analyze}
            disabled={!file || isAnalyzing}
            className="w-full text-white font-semibold py-4 rounded-xl text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: '#2563EB' }}
          >
            {isAnalyzing
              ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
              : <><Zap size={18} /> Analyze CV</>}
          </button>
        </div>
      )}

      {/* ── Analyze tab: results ── */}
      {cvSubTab === 'analyze' && report && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-5 text-lg">ATS Analysis Results</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center">
                <ScoreGauge score={report.overall_score} size={160} label="Overall ATS Score" />
                <div className="grid grid-cols-2 gap-3 mt-5 w-full">
                  {[['Keywords', report.keyword_score], ['Format', report.format_score], ['Readability', report.readability_score], ['Completeness', report.completeness_score]].map(([l, s]) => (
                    <div key={l as string} className="bg-white rounded-xl p-3 text-center border border-gray-100">
                      <p className={`text-lg font-bold ${(s as number) >= 70 ? 'text-emerald-600' : (s as number) >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{Math.round(s as number)}%</p>
                      <p className="text-gray-400 text-xs mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Radar dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.12} />
                    <Tooltip {...ttStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-3"><CheckCircle size={16} className="text-emerald-500" /><p className="font-bold text-gray-900 text-sm">Matched Keywords ({report.matched_keywords.length})</p></div>
              <div className="flex flex-wrap gap-2">{report.matched_keywords.length ? report.matched_keywords.map(k => <span key={k} className="badge-green">{k}</span>) : <p className="text-gray-400 text-sm">None matched</p>}</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-3"><XCircle size={16} className="text-red-500" /><p className="font-bold text-gray-900 text-sm">Missing Keywords ({report.missing_keywords.length})</p></div>
              <div className="flex flex-wrap gap-2">{report.missing_keywords.length ? report.missing_keywords.map(k => <span key={k} className="badge-red">{k}</span>) : <p className="text-gray-400 text-sm">None missing</p>}</div>
            </div>
            {report.improvement_suggestions.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3"><Lightbulb size={16} className="text-blue-500" /><p className="font-bold text-gray-900 text-sm">Suggestions</p></div>
                <ul className="space-y-1.5">{report.improvement_suggestions.map((s, i) => <li key={i} className="text-gray-600 text-sm flex gap-2"><span className="text-blue-500 flex-shrink-0">{i + 1}.</span>{s}</li>)}</ul>
              </div>
            )}
            {report.extracted_skills.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3"><Target size={16} className="text-violet-500" /><p className="font-bold text-gray-900 text-sm">Skills ({report.extracted_skills.length})</p></div>
                <div className="flex flex-wrap gap-2">{report.extracted_skills.map(s => <span key={s} className="badge-purple">{s}</span>)}</div>
              </div>
            )}
          </div>
          <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><Mail size={22} style={{ color: '#4F46E5' }} /></div>
              <div>
                <p className="font-bold text-gray-900">Generate a Cover Letter</p>
                <p className="text-gray-500 text-sm">CV scored <span className={`font-semibold ${report.overall_score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{report.overall_score}%</span> — create a matching cover letter now</p>
              </div>
            </div>
            <Link to="/cover-letter" className="flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl whitespace-nowrap text-sm" style={{ background: '#4F46E5' }}>
              <FileText size={15} /> Generate <ArrowRight size={15} />
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
                  <Lightbulb size={18} style={{ color: '#4F46E5' }} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">AI CV Improvements</p>
                  <p className="text-gray-400 text-xs mt-0.5">Get specific suggestions and apply them automatically</p>
                </div>
              </div>
              {suggestions.length === 0 && (
                <button onClick={loadSuggestions} disabled={loadingSuggestions}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: '#4F46E5' }}>
                  {loadingSuggestions ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading...</> : <><Sparkles size={14} /> Suggest Changes</>}
                </button>
              )}
            </div>
            {suggestions.length > 0 && (
              <div className="px-5 pb-5 space-y-4">
                <ul className="space-y-2.5">
                  {suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-gray-700 text-sm leading-relaxed">{s}</p>
                    </li>
                  ))}
                </ul>
                <button onClick={applyChanges} disabled={applyingChanges}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                  {applyingChanges
                    ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating improved CV...</>
                    : <><ArrowRight size={18} /> Apply Changes &amp; Download New CV</>}
                </button>
              </div>
            )}
          </div>
          <button onClick={() => { setFile(null); setReport(null); setSuggestions([]); }} className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
            Analyze Another CV
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Mock Interview ───────────────────────────────────────────────────────────
const TOTAL_Q = 10;

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score}/10</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className="h-2.5 rounded-full transition-all" style={{ width: `${score * 10}%`, background: color }} />
      </div>
    </div>
  );
}

function MockInterviewTab() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [role, setRole] = useState('');

  const answeredCount = messages.filter(m => m.role === 'user').length;
  const isComplete = answeredCount >= TOTAL_Q;

  const start = async () => {
    if (!role.trim()) return toast.error('Please enter your job position');
    setStarting(true);
    try {
      const s = await interviewService.createSession({ interview_type: 'technical', difficulty: 'intermediate', job_role: role.trim() });
      setSession(s); setMessages(s.messages || []);
    } catch { toast.error('Failed to start'); } finally { setStarting(false); }
  };

  const send = async () => {
    if (!input.trim() || !session || sending || isComplete) return;
    const txt = input.trim(); setInput('');
    const optimistic: ChatMessage = { id: Date.now(), session_id: session.id, role: 'user', content: txt, created_at: new Date().toISOString() };
    setMessages(p => [...p, optimistic]);
    setSending(true);
    try {
      const r = await interviewService.sendMessage(session.id, txt);
      setMessages(p => [...p, r]);
      // Auto-end after 10th answer
      if (answeredCount + 1 >= TOTAL_Q) {
        const res = await interviewService.endSession(session.id);
        setFeedback(res.feedback); setEnded(true);
      }
    } catch { toast.error('Failed to send'); } finally { setSending(false); }
  };

  if (ended && feedback) return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}><Sparkles size={28} className="text-white" /></div>
        <h3 className="text-xl font-bold text-gray-900">Interview Report</h3>
        <p className="text-gray-400 text-sm mt-1">{session?.job_role} · 10 Questions</p>
      </div>

      {/* 3 scores */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
        <ScoreBar label="Technical Knowledge" score={feedback.knowledge_score ?? 6} color="#4F46E5" />
        <ScoreBar label="Grammar & Communication" score={feedback.grammar_score ?? 7} color="#0EA5E9" />
        <ScoreBar label="Attempt Style" score={feedback.attempt_style_score ?? 6} color="#7C3AED" />
      </div>

      {/* feedback lines */}
      <div className="space-y-3">
        {feedback.knowledge_feedback && <div className="flex gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3"><Brain size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" /><p className="text-gray-700 text-sm">{feedback.knowledge_feedback}</p></div>}
        {feedback.grammar_feedback && <div className="flex gap-3 bg-sky-50 border border-sky-100 rounded-xl p-3"><Sparkles size={16} className="text-sky-500 flex-shrink-0 mt-0.5" /><p className="text-gray-700 text-sm">{feedback.grammar_feedback}</p></div>}
        {feedback.attempt_style_feedback && <div className="flex gap-3 bg-violet-50 border border-violet-100 rounded-xl p-3"><Target size={16} className="text-violet-500 flex-shrink-0 mt-0.5" /><p className="text-gray-700 text-sm">{feedback.attempt_style_feedback}</p></div>}
      </div>

      {feedback.summary && <div className="bg-white rounded-xl p-4 border border-gray-100"><p className="font-bold text-gray-900 mb-1 text-sm">Overall Summary</p><p className="text-gray-600 text-sm leading-relaxed">{feedback.summary}</p></div>}

      <button onClick={() => { setSession(null); setMessages([]); setEnded(false); setFeedback(null); setRole(''); }}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2" style={{ background: '#2563EB' }}>
        <Plus size={16} /> Try Another Interview
      </button>
    </div>
  );

  if (!session) return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}><Bot size={24} style={{ color: '#4F46E5' }} /></div>
        <div><h3 className="text-xl font-bold text-gray-900">Technical Interview</h3><p className="text-gray-400 text-sm mt-0.5">10 questions · AI-powered · Instant report</p></div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Position</label>
          <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" placeholder="e.g. Software Engineer, Data Scientist, DevOps Engineer" value={role} onChange={e => setRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && start()} />
        </div>
        <button onClick={start} disabled={starting || !role.trim()} className="w-full text-white font-semibold py-4 rounded-xl text-[15px] flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: '#2563EB' }}>
          {starting ? <LoadingSpinner size="sm" /> : <><Sparkles size={18} /> Start Interview</>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col" style={{ height: '540px' }}>
      {/* Header with progress */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <p className="font-bold text-gray-900">{session.job_role}</p>
          <p className="text-gray-400 text-xs mt-0.5">Technical Interview · Question {Math.min(answeredCount + 1, TOTAL_Q)} of {TOTAL_Q}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_Q }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all" style={{ background: i < answeredCount ? '#4F46E5' : '#E5E7EB' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1 mb-4 flex-shrink-0">
        <div className="h-1 rounded-full transition-all" style={{ width: `${(answeredCount / TOTAL_Q) * 100}%`, background: 'linear-gradient(to right,#4F46E5,#7C3AED)' }} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={clsx('w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center', msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-100')}>
              {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} style={{ color: '#4F46E5' }} />}
            </div>
            <div className={clsx('max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed', msg.role === 'user' ? 'text-white rounded-tr-sm' : 'bg-white text-gray-700 rounded-tl-sm border border-gray-200')} style={msg.role === 'user' ? { background: '#2563EB' } : {}}>
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"><Bot size={14} style={{ color: '#4F46E5' }} /></div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
              {[0,1,2].map(i => <motion.div key={i} animate={{ y:[0,-5,0] }} transition={{ repeat:Infinity, duration:0.8, delay:i*0.15 }} className="w-2 h-2 bg-blue-400 rounded-full" />)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="flex gap-3 pt-4 border-t border-gray-200 mt-3 flex-shrink-0">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type your answer and press Enter..." className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" disabled={sending} />
          <button onClick={send} disabled={!input.trim() || sending} className="p-3 rounded-xl text-white flex-shrink-0 disabled:opacity-50" style={{ background: '#2563EB' }}><Send size={18} /></button>
        </div>
      )}
    </div>
  );
}

// ─── Salary Prediction ────────────────────────────────────────────────────────
const PK_CITIES = ['Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Remote'];
const INDUSTRIES = ['Technology','Finance','Healthcare','Education','Manufacturing','Consulting','E-commerce','Telecom'];

function SalaryPredictionTab() {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<SalaryPrediction | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<any>({ defaultValues: { city: 'Lahore' } });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const r = await salaryService.predict({ ...data, skills, experience_years: Number(data.experience_years), country: 'Pakistan' });
      setPrediction(r); toast.success('Prediction ready!');
    } catch { toast.error('Prediction failed'); } finally { setLoading(false); }
  };

  if (prediction) {
    const growthData = prediction.growth_projection ? [
      { year: 'Now',    salary: prediction.predicted_median },
      { year: '+1 Yr',  salary: prediction.growth_projection.year_1 },
      { year: '+3 Yrs', salary: prediction.growth_projection.year_3 },
      { year: '+5 Yrs', salary: prediction.growth_projection.year_5 },
    ] : [];
    const skillData = prediction.skill_impact
      ? Object.entries(prediction.skill_impact).sort((a,b)=>(b[1] as number)-(a[1] as number)).slice(0,5).map(([s,v])=>({skill:s,impact:v}))
      : [];
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}><TrendingUp size={24} style={{ color: '#16A34A' }} /></div>
          <div><h3 className="text-xl font-bold text-gray-900">Salary Results</h3><p className="text-gray-400 text-sm">Based on your profile</p></div>
        </div>
        <div className="text-center bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-5">
          <p className="text-gray-400 text-sm mb-3">Estimated Salary Range <span className="text-emerald-600 font-medium">(PKR / month)</span></p>
          <div className="flex items-center justify-center gap-6">
            <div><p className="text-gray-400 text-xs">Min</p><p className="text-lg font-bold text-gray-600">{fmtAmt(prediction.predicted_min!)}</p></div>
            <div className="px-6 border-x border-gray-200">
              <p className="text-4xl font-black" style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{fmtAmt(prediction.predicted_median!)}</p>
              <span className="badge-blue text-xs mt-1 inline-block">per month</span>
            </div>
            <div><p className="text-gray-400 text-xs">Max</p><p className="text-lg font-bold text-gray-600">{fmtAmt(prediction.predicted_max!)}</p></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4"><div className="h-1.5 rounded-full" style={{ background: 'linear-gradient(to right,#10B981,#2563EB,#7C3AED)', width: '100%' }} /></div>
          {prediction.market_insights && <p className="text-gray-500 text-sm mt-4 text-left">{prediction.market_insights}</p>}
        </div>
        {growthData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
            <p className="font-bold text-gray-900 mb-3">Growth Projection</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={growthData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="year" tick={{ fill:'#94a3b8', fontSize:12 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill:'#94a3b8', fontSize:11 }} tickFormatter={v=>shortLbl(v)} axisLine={false} tickLine={false} width={55} /><Tooltip {...ttStyle} formatter={(v:number)=>[fmtAmt(v),'Salary']} /><Line type="monotone" dataKey="salary" stroke="#2563EB" strokeWidth={2.5} dot={{ fill:'#2563EB', r:4 }} /></LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {skillData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
            <p className="font-bold text-gray-900 mb-3">Skill Premium</p>
            <ResponsiveContainer width="100%" height={Math.max(120, skillData.length * 34)}>
              <BarChart data={skillData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis type="number" tick={{ fill:'#94a3b8', fontSize:11 }} tickFormatter={v=>`+${shortLbl(v)}`} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="skill" tick={{ fill:'#94a3b8', fontSize:11 }} width={80} axisLine={false} tickLine={false} /><Tooltip {...ttStyle} formatter={(v:number)=>[`+${fmtAmt(v)}`,'Boost']} /><Bar dataKey="impact" fill="#7C3AED" radius={[0,6,6,0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <button onClick={() => setPrediction(null)} className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">New Prediction</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}><TrendingUp size={24} style={{ color: '#16A34A' }} /></div>
        <div><h3 className="text-xl font-bold text-gray-900">Salary Prediction</h3><p className="text-gray-400 text-sm mt-0.5">Get market salary estimates for your role</p></div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title</label>
          <input className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${errors.job_title ? 'border-red-400' : 'border-gray-200'}`} placeholder="e.g., Software Engineer" {...register('job_title', { required: true })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience (Years)</label>
            <input type="number" min="0" max="50" step="0.5" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" placeholder="3" {...register('experience_years', { required: true })} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white" {...register('city')}>
              {PK_CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industry</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white" {...register('industry')}>
              <option value="">Select...</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Skills</label>
          <div className="flex gap-2">
            <input className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" placeholder="Add skill (Enter)" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (skillInput.trim() && !skills.includes(skillInput.trim())) { setSkills(p => [...p, skillInput.trim()]); setSkillInput(''); } } }} />
            <button type="button" onClick={() => { if (skillInput.trim() && !skills.includes(skillInput.trim())) { setSkills(p => [...p, skillInput.trim()]); setSkillInput(''); } }} className="px-4 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium">Add</button>
          </div>
          {skills.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{skills.map(s => <span key={s} className="badge-blue flex items-center gap-1">{s}<button type="button" onClick={() => setSkills(p => p.filter(x => x !== s))}><X size={11} /></button></span>)}</div>}
        </div>
        <button type="submit" disabled={loading} className="w-full text-white font-semibold py-4 rounded-xl text-[15px] flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: '#2563EB' }}>
          {loading ? <LoadingSpinner size="sm" /> : <><Zap size={18} /> Predict Salary</>}
        </button>
      </form>
    </div>
  );
}

// ─── Page data ────────────────────────────────────────────────────────────────
const CORE_FEATURES = [
  { icon: FileText,     title: 'CV Analysis',      desc: 'AI-powered analysis of your resume to ensure ATS compatibility, keyword optimization, and professional formatting. Get instant feedback on how to improve your CV for maximum impact.',      iconBg: '#EEF2FF', iconColor: '#4F46E5' },
  { icon: Bot,          title: 'Mock Interview',    desc: 'Practice with AI-generated interview questions tailored to your industry and experience level. Receive constructive feedback on your responses to boost confidence and performance.',  iconBg: '#EEF2FF', iconColor: '#4F46E5' },
  { icon: TrendingUp,   title: 'Salary Prediction', desc: 'Get accurate salary estimates based on your experience, skills, location, and industry. Make informed decisions about job offers and salary negotiations with data-driven insights.', iconBg: '#EEF2FF', iconColor: '#4F46E5' },
];

const AI_ITEMS = [
  { icon: Brain,    title: 'Applicant Tracking Systems (ATS)',   desc: "Over 98% of Fortune 500 companies use Applicant Tracking Systems to filter candidates. These AI-powered systems automatically scan resumes for keywords, qualifications, and formatting. Career Genius helps job seekers optimize their CVs to pass through ATS filters, ensuring their applications reach human recruiters.",               iconBg: '#EEF2FF', iconColor: '#4F46E5' },
  { icon: BarChart3, title: 'Automated Hiring & Efficiency',      desc: 'AI automation reduces hiring time by up to 75% while improving candidate quality. Machine learning algorithms can process thousands of applications in seconds, identifying top candidates based on complex pattern recognition. This allows recruiters to focus on human aspects like cultural fit and soft skills assessment.',          iconBg: '#EEF2FF', iconColor: '#4F46E5' },
  { icon: Target,   title: 'Data-Driven Decision Making',        desc: 'Modern recruitment relies on data analytics to eliminate bias and improve hiring outcomes. AI systems analyze millions of data points to provide objective insights. Career Genius harnesses this power to give users accurate salary predictions, interview preparation, and CV optimization grounded in empirical success data.', iconBg: '#DCFCE7', iconColor: '#16A34A' },
];

const EMPLOYER_BENEFITS = [
  { icon: Clock,     title: 'Efficiency & Time Savings',  desc: 'Reduce screening time by 70% with AI-powered candidate filtering and matching',                                  iconBg: '#EEF2FF', iconColor: '#4F46E5' },
  { icon: BarChart3, title: 'Scalability',                desc: 'Process thousands of applications simultaneously without compromising quality',                                    iconBg: '#EEF2FF', iconColor: '#4F46E5' },
  { icon: UserCheck, title: 'Better Candidate Matching',  desc: 'AI algorithms identify candidates whose skills and experience align with job requirements',                         iconBg: '#EEF2FF', iconColor: '#4F46E5' },
];

const SEEKER_BENEFITS = [
  { icon: Briefcase, title: 'Employability Enhancement', desc: 'Improve CV quality and interview skills to significantly increase job offer rates',                                  iconBg: '#DCFCE7', iconColor: '#16A34A' },
  { icon: BarChart3, title: 'Market Insights',           desc: 'Access real-time salary data and industry trends to make informed career decisions',                                  iconBg: '#DCFCE7', iconColor: '#16A34A' },
  { icon: Users,     title: 'Confidence Building',       desc: 'Practice interviews with AI feedback to reduce anxiety and improve performance',                                       iconBg: '#DCFCE7', iconColor: '#16A34A' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('CV Analysis');
  const location = useLocation();

  useEffect(() => {
    const id = (location.state as any)?.scrollTo;
    if (id) {
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [location.state]);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Core Features ───────────────────────────────────────────── */}
      <section id="features" className="py-24 px-8" style={{ backgroundColor: '#F3F4F8' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Core Features</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive AI-powered tools designed to elevate your career and streamline the recruitment process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CORE_FEATURES.map(({ icon: Icon, title, desc, iconBg, iconColor }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-7" style={{ backgroundColor: iconBg }}>
                  <Icon size={30} style={{ color: iconColor }} />
                </div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Importance ───────────────────────────────────────────── */}
      <section id="ai-importance" className="py-24 px-8" style={{ backgroundColor: '#F3F4F8' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">The Importance of Artificial Intelligence</h2>
            <p className="text-gray-500 text-lg">Why AI is revolutionizing modern recruitment systems</p>
          </div>
          <div className="space-y-5">
            {AI_ITEMS.map(({ icon: Icon, title, desc, iconBg, iconColor }, i) => (
              <motion.div key={title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-8 flex gap-7 items-start border border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="w-[64px] h-[64px] rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}>
                  <Icon size={26} style={{ color: iconColor }} />
                </div>
                <div>
                  <h3 className="text-[20px] font-bold text-gray-900 mb-3">{title}</h3>
                  <p className="text-gray-500 leading-relaxed text-[15px]">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industry Value ──────────────────────────────────────────── */}
      <section id="industry-value" className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Industry Relevance &amp; Project Value</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              How Career Genius aligns with real-world hiring practices and delivers measurable value
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-14">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Benefits for Employers</h3>
              <div className="space-y-8">
                {EMPLOYER_BENEFITS.map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
                  <div key={title} className="flex gap-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}><Icon size={20} style={{ color: iconColor }} /></div>
                    <div><p className="font-bold text-gray-900 text-[16px] mb-1">{title}</p><p className="text-gray-500 text-[14px] leading-relaxed">{desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Benefits for Job Seekers</h3>
              <div className="space-y-8">
                {SEEKER_BENEFITS.map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
                  <div key={title} className="flex gap-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconBg }}><Icon size={20} style={{ color: iconColor }} /></div>
                    <div><p className="font-bold text-gray-900 text-[16px] mb-1">{title}</p><p className="text-gray-500 text-[14px] leading-relaxed">{desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl p-10 text-white" style={{ background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 60%,#A855F7 100%)' }}>
            <h3 className="text-2xl font-bold mb-4">Real-World Alignment</h3>
            <p className="text-white/85 leading-relaxed mb-6 text-[15px]">
              Career Genius directly addresses the gap between traditional job search methods and modern AI-driven hiring. Our platform bridges this gap by demystifying the AI recruitment process and providing actionable insights.
            </p>
            <ul className="space-y-2.5">
              {['Aligns with industry standard ATS systems used by 98% of large companies','Incorporates real market data for accurate salary predictions','Reduces bias through objective, data-driven evaluation','Promotes equal access to career advancement resources'].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-white/85 text-[15px]"><span className="mt-1 flex-shrink-0">•</span>{item}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── Functional Modules ──────────────────────────────────────── */}
      <section id="modules" className="py-24 px-8" style={{ backgroundColor: '#F3F4F8' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Functional Modules</h2>
            <p className="text-gray-500 text-lg">Interactive tools to enhance your career prospects</p>
          </div>
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-xl p-1.5 gap-1" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-7 py-2.5 rounded-xl text-[15px] font-semibold transition-all"
                  style={activeTab === tab ? { background: '#2563EB', color: '#fff' } : { color: '#374151', background: 'transparent' }}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl p-10" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
            {activeTab === 'CV Analysis'       && <CVAnalysisTab />}
            {activeTab === 'Mock Interview'    && <MockInterviewTab />}
            {activeTab === 'Salary Prediction' && <SalaryPredictionTab />}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
