import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, XCircle, AlertCircle, Lightbulb, Target, Zap, Mail, ArrowRight, FileText, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cvService } from '@/services/cvService';
import { ATSReport } from '@/types';
import ScoreGauge from '@/components/common/ScoreGauge';
import toast from 'react-hot-toast';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import CVBuilderForm from '@/components/CVBuilderForm';

type PageTab = 'analyze' | 'build';

export default function CVAnalyzerPage() {
  const [pageTab, setPageTab] = useState<PageTab>('analyze');
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<ATSReport | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setReport(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDropRejected: () => toast.error('Only PDF files are accepted.'),
  });

  const handleAnalyze = async () => {
    if (!file) return toast.error('Please upload a file first');
    setIsAnalyzing(true);
    try {
      const result = await cvService.analyzeCV(file, jobDescription || undefined);
      setReport(result);
      toast.success('Analysis complete!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const radarData = report ? [
    { subject: 'Keywords', score: report.keyword_score },
    { subject: 'Format', score: report.format_score },
    { subject: 'Readability', score: report.readability_score },
    { subject: 'Completeness', score: report.completeness_score },
  ] : [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">CV Analyzer</h1>
        <p className="section-subtitle">Analyze your existing CV or build a new one from scratch.</p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-2 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit shadow-sm">
        <button
          onClick={() => setPageTab('analyze')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            pageTab === 'analyze'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Zap size={15} /> Analyze CV
        </button>
        <button
          onClick={() => setPageTab('build')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            pageTab === 'build'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <PenLine size={15} /> Build CV
        </button>
      </div>

      {/* Build CV tab */}
      {pageTab === 'build' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-indigo-700 text-sm">
            Fill in your information below and download a professional CV PDF in the standard format.
          </div>
          <CVBuilderForm />
        </motion.div>
      )}

      {/* Analyze CV tab */}
      {pageTab === 'analyze' && <>

      {/* Upload Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dropzone */}
          <div>
            <label className="label">Upload Resume</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-primary-400 bg-primary-50'
                  : file
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                  <p className="text-emerald-700 font-semibold">{file.name}</p>
                  <p className="text-gray-400 text-sm mt-1">{(file.size / 1024).toFixed(0)} KB • Click to change</p>
                </div>
              ) : (
                <div>
                  <Upload size={40} className={`mx-auto mb-3 ${isDragActive ? 'text-primary-500' : 'text-gray-300'}`} />
                  <p className="text-gray-700 font-medium">Drop your resume here</p>
                  <p className="text-gray-400 text-sm mt-1">PDF only • Max 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div className="flex flex-col">
            <label className="label">Job Description <span className="text-gray-400 font-normal">(optional but recommended)</span></label>
            <textarea
              className="input-field flex-1 min-h-[150px] resize-none"
              placeholder="Paste the job description here for more accurate keyword matching..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!file || isAnalyzing}
          className="btn-primary w-full mt-6 flex items-center justify-center gap-2 py-3"
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <><Zap size={18} /> Analyze CV</>
          )}
        </button>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score Overview */}
            <div className="card">
              <h2 className="text-gray-900 font-bold text-xl mb-6">ATS Analysis Results</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Overall Score */}
                <div className="flex flex-col items-center">
                  <ScoreGauge score={report.overall_score} size={160} label="Overall ATS Score" />
                  <div className="grid grid-cols-2 gap-4 mt-6 w-full">
                    {[
                      { label: 'Keywords', score: report.keyword_score },
                      { label: 'Format', score: report.format_score },
                      { label: 'Readability', score: report.readability_score },
                      { label: 'Completeness', score: report.completeness_score },
                    ].map(({ label, score }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <div className={`text-xl font-bold ${score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                          {Math.round(score)}%
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#374151' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Matched Keywords */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <h3 className="text-gray-900 font-bold">Matched Keywords ({report.matched_keywords.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.matched_keywords.length > 0
                    ? report.matched_keywords.map(kw => <span key={kw} className="badge-green">{kw}</span>)
                    : <p className="text-gray-400 text-sm">No keywords matched</p>
                  }
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle size={18} className="text-red-500" />
                  <h3 className="text-gray-900 font-bold">Missing Keywords ({report.missing_keywords.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.missing_keywords.length > 0
                    ? report.missing_keywords.map(kw => <span key={kw} className="badge-red">{kw}</span>)
                    : <p className="text-gray-400 text-sm">No missing keywords detected</p>
                  }
                </div>
              </div>

              {/* Formatting Issues */}
              {report.formatting_issues.length > 0 && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle size={18} className="text-amber-500" />
                    <h3 className="text-gray-900 font-bold">Formatting Issues</h3>
                  </div>
                  <ul className="space-y-2">
                    {report.formatting_issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvement Suggestions */}
              {report.improvement_suggestions.length > 0 && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={18} className="text-primary-500" />
                    <h3 className="text-gray-900 font-bold">Improvement Suggestions</h3>
                  </div>
                  <ul className="space-y-2">
                    {report.improvement_suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                        <span className="text-primary-500 mt-0.5 flex-shrink-0">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Extracted Skills */}
            {report.extracted_skills.length > 0 && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={18} className="text-violet-500" />
                  <h3 className="text-gray-900 font-bold">Detected Skills ({report.extracted_skills.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.extracted_skills.map(skill => <span key={skill} className="badge-purple">{skill}</span>)}
                </div>
              </div>
            )}

            {/* ── Generate Cover Letter CTA ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-primary-50 to-violet-50 border border-primary-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-primary-100">
                  <Mail size={22} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold">Generate a Cover Letter</h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Your CV scored <span className={`font-semibold ${report.overall_score >= 70 ? 'text-emerald-600' : report.overall_score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{report.overall_score}%</span> — now create a matching cover letter to complete your application.
                  </p>
                </div>
              </div>
              <Link
                to="/cover-letter"
                className="btn-primary flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              >
                <FileText size={16} /> Generate Cover Letter <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </>}
    </div>
  );
}
