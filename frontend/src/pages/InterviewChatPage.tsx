import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Plus, Bot, User, Sparkles, Brain, Target } from 'lucide-react';
import { interviewService } from '@/services/interviewService';
import { ChatSession, ChatMessage } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

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

export default function InterviewChatPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [role, setRole] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const answeredCount = messages.filter(m => m.role === 'user').length;
  const isComplete = answeredCount >= TOTAL_Q;

  const start = async () => {
    if (!role.trim()) return toast.error('Please enter your job position');
    setIsStarting(true);
    try {
      const s = await interviewService.createSession({
        interview_type: 'technical',
        difficulty: 'intermediate',
        job_role: role.trim(),
      });
      setSession(s);
      setMessages(s.messages || []);
    } catch {
      toast.error('Failed to start interview');
    } finally {
      setIsStarting(false);
    }
  };

  const send = async () => {
    if (!input.trim() || !session || isSending || isComplete) return;
    const txt = input.trim();
    setInput('');
    const optimistic: ChatMessage = {
      id: Date.now(),
      session_id: session.id,
      role: 'user',
      content: txt,
      created_at: new Date().toISOString(),
    };
    setMessages(p => [...p, optimistic]);
    setIsSending(true);
    try {
      const aiMsg = await interviewService.sendMessage(session.id, txt);
      setMessages(p => [...p, aiMsg]);
      if (answeredCount + 1 >= TOTAL_Q) {
        const res = await interviewService.endSession(session.id);
        setFeedback(res.feedback);
        setEnded(true);
      }
    } catch {
      toast.error('Failed to send');
    } finally {
      setIsSending(false);
    }
  };

  // Feedback report screen
  if (ended && feedback) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title">Interview Report</h1>
          <p className="section-subtitle">{session?.job_role} · 10 Technical Questions</p>
        </motion.div>

        <div className="card space-y-4">
          <ScoreBar label="Technical Knowledge"   score={feedback.knowledge_score     ?? 6} color="#4F46E5" />
          <ScoreBar label="Grammar & Communication" score={feedback.grammar_score       ?? 7} color="#0EA5E9" />
          <ScoreBar label="Attempt Style"          score={feedback.attempt_style_score ?? 6} color="#7C3AED" />
        </div>

        <div className="space-y-3">
          {feedback.knowledge_feedback && (
            <div className="flex gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <Brain size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">{feedback.knowledge_feedback}</p>
            </div>
          )}
          {feedback.grammar_feedback && (
            <div className="flex gap-3 bg-sky-50 border border-sky-100 rounded-xl p-4">
              <Sparkles size={16} className="text-sky-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">{feedback.grammar_feedback}</p>
            </div>
          )}
          {feedback.attempt_style_feedback && (
            <div className="flex gap-3 bg-violet-50 border border-violet-100 rounded-xl p-4">
              <Target size={16} className="text-violet-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 text-sm">{feedback.attempt_style_feedback}</p>
            </div>
          )}
        </div>

        {feedback.summary && (
          <div className="card">
            <p className="font-bold text-gray-900 mb-1">Overall Summary</p>
            <p className="text-gray-600 text-sm leading-relaxed">{feedback.summary}</p>
          </div>
        )}

        <button
          onClick={() => { setSession(null); setMessages([]); setEnded(false); setFeedback(null); setRole(''); }}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          <Plus size={16} /> Try Another Interview
        </button>
      </div>
    );
  }

  // Setup screen
  if (!session) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title">Technical Interview</h1>
          <p className="section-subtitle">10 AI-generated questions · Scored on knowledge, grammar &amp; style</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card space-y-5">
          <div>
            <label className="label">Job Position</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Software Engineer, Data Scientist, DevOps Engineer"
              value={role}
              onChange={e => setRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && start()}
            />
          </div>
          <button
            onClick={start}
            disabled={isStarting || !role.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60"
          >
            {isStarting ? <LoadingSpinner size="sm" /> : <><Sparkles size={18} /> Start Interview</>}
          </button>
        </motion.div>
      </div>
    );
  }

  // Chat screen
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-gray-900 font-bold text-lg">{session.job_role} · Technical Interview</h1>
          <p className="text-gray-400 text-xs mt-0.5">Question {Math.min(answeredCount + 1, TOTAL_Q)} of {TOTAL_Q}</p>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_Q }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all"
              style={{ background: i < answeredCount ? '#4F46E5' : '#E5E7EB' }} />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1 mb-4">
        <div className="h-1 rounded-full transition-all"
          style={{ width: `${(answeredCount / TOTAL_Q) * 100}%`, background: 'linear-gradient(to right,#4F46E5,#7C3AED)' }} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map(msg => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={clsx('w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center',
              msg.role === 'user' ? 'bg-primary-600' : 'bg-gray-100')}>
              {msg.role === 'user'
                ? <User size={14} className="text-white" />
                : <Bot size={14} className="text-primary-600" />}
            </div>
            <div className={clsx('max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-primary-600 text-white rounded-tr-sm'
                : 'bg-white text-gray-700 rounded-tl-sm border border-gray-200 shadow-sm')}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isSending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
              <Bot size={14} className="text-primary-600" />
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  className="w-2 h-2 bg-primary-400 rounded-full" />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
              rows={2}
              className="input-field flex-1 resize-none"
              disabled={isSending}
            />
            <button onClick={send} disabled={!input.trim() || isSending} className="btn-primary p-3 h-fit">
              <Send size={18} />
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-1.5">Press Enter to send · Shift+Enter for new line</p>
        </div>
      )}
    </div>
  );
}
