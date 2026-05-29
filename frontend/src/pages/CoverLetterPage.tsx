import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Zap, Download, Copy, Trash2, Check, FileText } from 'lucide-react';
import { coverLetterService } from '@/services/coverLetterService';
import { CoverLetter } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { downloadCoverLetterPDF } from '@/utils/pdfUtils';

export default function CoverLetterPage() {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [selected, setSelected] = useState<CoverLetter | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    coverLetterService.getAll().then(setLetters).catch(console.error);
  }, []);

  const generate = async () => {
    setIsGenerating(true);
    try {
      const letter = await coverLetterService.generate({
        applicant_name: user?.full_name || user?.username || '',
        tone: 'professional',
      });
      setLetters(prev => [letter, ...prev]);
      setSelected(letter);
      setEditedContent(letter.content);
      toast.success('Cover letter generated!');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Generation failed. Please analyze your CV first.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedContent || selected?.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied!');
  };

  const downloadPDF = () => {
    if (!selected) return;
    downloadCoverLetterPDF({ ...selected, content: editedContent || selected.content });
    toast.success('Downloading...');
  };

  const deleteLetter = async (id: number) => {
    try {
      await coverLetterService.delete(id);
      setLetters(prev => prev.filter(l => l.id !== id));
      if (selected?.id === id) { setSelected(null); setEditedContent(''); }
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Cover Letter Generator</h1>
        <p className="section-subtitle">AI generates your cover letter directly from your CV.</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Left panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="xl:col-span-2 space-y-4">

          {/* Generate card */}
          <div className="card space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                <FileText size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Auto Generate</p>
                <p className="text-gray-400 text-sm">Based entirely on your uploaded CV</p>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex gap-2">
              <Mail size={15} className="text-indigo-500 flex-shrink-0 mt-0.5" />
              <p className="text-indigo-700 text-xs leading-relaxed">
                No input needed — Career Genius reads your CV and writes a professional cover letter for you automatically.
              </p>
            </div>

            <button
              onClick={generate}
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}
            >
              {isGenerating
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                : <><Zap size={18} /> Generate Cover Letter</>}
            </button>
          </div>

          {/* Saved letters */}
          {letters.length > 0 && (
            <div className="card">
              <h3 className="text-gray-900 font-bold mb-3 text-sm">Saved Letters ({letters.length})</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {letters.map(letter => (
                  <div
                    key={letter.id}
                    onClick={() => { setSelected(letter); setEditedContent(letter.content); }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      selected?.id === letter.id
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-gray-200 bg-gray-50 hover:border-indigo-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 text-sm font-medium truncate flex-1">{letter.title}</p>
                      <button onClick={e => { e.stopPropagation(); deleteLetter(letter.id); }} className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(letter.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Preview panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="xl:col-span-3">
          {selected ? (
            <div className="card flex flex-col" style={{ minHeight: '600px' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-gray-900 font-bold">Preview &amp; Edit</h2>
                <div className="flex gap-2">
                  <button onClick={copyToClipboard} className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2">
                    {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={downloadPDF} className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2">
                    <Download size={15} /> Download PDF
                  </button>
                </div>
              </div>
              <textarea
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-5 resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm leading-relaxed font-mono"
                style={{ minHeight: '520px' }}
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
              />
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)' }}>
                <Mail size={30} style={{ color: '#4F46E5' }} />
              </div>
              <p className="text-gray-700 font-semibold text-lg">Ready to generate</p>
              <p className="text-gray-400 text-sm mt-1 text-center max-w-xs">
                Click "Generate Cover Letter" and your CV will be used automatically
              </p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
