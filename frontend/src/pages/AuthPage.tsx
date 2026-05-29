import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Zap, LogIn, UserPlus, FileText, MessageSquare, TrendingUp, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials, RegisterData } from '@/types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

const FEATURES = [
  { icon: FileText,      title: 'CV Analysis & ATS Scoring',  desc: 'Optimize your resume for modern hiring systems' },
  { icon: MessageSquare, title: 'Mock Interview Practice',     desc: 'AI-powered simulation with real-time feedback' },
  { icon: TrendingUp,    title: 'Salary Prediction',          desc: 'Data-driven market value estimation' },
  { icon: Brain,         title: 'Resume Builder',             desc: 'Professional templates with AI assistance' },
];

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const e = err as AxiosError<{ detail: string }>;
      toast.error(e.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
        <input
          type="email"
          className={`input-field ${errors.email ? 'border-red-500' : ''}`}
          placeholder="you@example.com"
          {...register('email', { required: 'Email is required' })}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            className={`input-field pr-11 ${errors.password ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
          />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
        {loading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><LogIn size={18} /> Sign In</>}
      </button>

      <p className="text-center text-slate-400 text-sm">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-primary-400 hover:text-primary-300 font-medium">
          Create one free
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData & { confirm_password: string }>();

  const onSubmit = async (data: RegisterData & { confirm_password: string }) => {
    if (data.password !== data.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await registerUser({ email: data.email, username: data.username, full_name: data.full_name, password: data.password });
      toast.success('Account created! Welcome to Career Genius.');
      navigate('/dashboard');
    } catch (err) {
      const e = err as AxiosError<{ detail: string }>;
      toast.error(e.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
        <input type="text" className="input-field" placeholder="John Doe" {...register('full_name')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
          <input
            type="text"
            className={`input-field ${errors.username ? 'border-red-500' : ''}`}
            placeholder="johndoe"
            {...register('username', {
              required: 'Required',
              minLength: { value: 3, message: 'Min 3 chars' },
              pattern: { value: /^[a-zA-Z0-9_-]+$/, message: 'No spaces' },
            })}
          />
          {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <input
            type="email"
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
            placeholder="you@example.com"
            {...register('email', { required: 'Required' })}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            className={`input-field pr-11 ${errors.password ? 'border-red-500' : ''}`}
            placeholder="Min. 8 characters"
            {...register('password', {
              required: 'Required',
              minLength: { value: 8, message: 'Min 8 characters' },
              pattern: { value: /(?=.*[A-Z])(?=.*[0-9])/, message: 'Must include uppercase & number' },
            })}
          />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
        <input
          type="password"
          className={`input-field ${errors.confirm_password ? 'border-red-500' : ''}`}
          placeholder="Repeat password"
          {...register('confirm_password', { required: 'Required' })}
        />
        {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-1">
        {loading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><UserPlus size={18} /> Create Account</>}
      </button>

      <p className="text-center text-slate-400 text-sm">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-primary-400 hover:text-primary-300 font-medium">
          Sign in
        </button>
      </p>
    </form>
  );
}

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-dark-900 flex">

      {/* ── Left panel: website info ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #312e81 40%, #1e3a8a 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4  w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-blue-500/20   rounded-full blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Career Genius</span>
        </div>

        <div className="relative">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Smart Recruitment<br />Intelligence
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-md">
              Leverage AI to optimize your CV, ace interviews, and know your market value — all in one platform.
            </p>
            <div className="flex gap-8 mb-10">
              {[
                { value: '98%', label: 'Fortune 500 use ATS' },
                { value: '75%', label: 'Faster hiring with AI' },
                { value: '3×',  label: 'More interview calls' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-black text-white">{value}</p>
                  <p className="text-white/55 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={18} className="text-white/80" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{title}</p>
                    <p className="text-white/50 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="relative text-white/25 text-xs">© 2025-2026 Career Genius · University of Central Punjab</p>
      </div>

      {/* ── Right panel: auth form ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2.5 justify-center mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-bold text-white text-xl">Career Genius</span>
          </div>

          <div className="flex bg-dark-800 border border-dark-700 rounded-xl p-1 mb-8">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === t ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">
              {tab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-slate-400 text-sm">
              {tab === 'login' ? 'Sign in to continue your career journey.' : "Start your career journey today — it's free."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'login'
                ? <LoginForm    onSwitch={() => setTab('register')} />
                : <RegisterForm onSwitch={() => setTab('login')} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
