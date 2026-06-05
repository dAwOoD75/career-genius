import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, MessageSquare, TrendingUp, Upload, Mail,
  Brain, BarChart3, Target, Clock, UserCheck, ChevronRight,
  Search, Star, Activity, Users, Briefcase, Sparkles, User, Wrench, GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Home',           id: 'home' },
  { label: 'Features',       id: 'features' },
  { label: 'AI Importance',  id: 'ai-importance' },
  { label: 'Industry Value', id: 'industry-value' },
  { label: 'Modules',        id: 'modules' },
  { label: 'Team',           id: 'team' },
];

const CORE_FEATURES = [
  {
    icon: FileText,
    title: 'CV Analysis',
    desc: 'AI-powered analysis of your resume to ensure ATS compatibility, keyword optimization, and professional formatting. Get instant feedback on how to improve your CV for maximum impact.',
    iconBg: '#EEF2FF', iconColor: '#4F46E5',
  },
  {
    icon: MessageSquare,
    title: 'Mock Interview',
    desc: 'Practice with AI-generated interview questions tailored to your industry and experience level. Receive constructive feedback on your responses to boost confidence and performance.',
    iconBg: '#EEF2FF', iconColor: '#4F46E5',
  },
  {
    icon: TrendingUp,
    title: 'Salary Prediction',
    desc: 'Get accurate salary estimates based on your experience, skills, location, and industry. Make informed decisions about job offers and salary negotiations with data-driven insights.',
    iconBg: '#EEF2FF', iconColor: '#4F46E5',
  },
];

const AI_ITEMS = [
  {
    icon: Brain,
    title: 'Applicant Tracking Systems (ATS)',
    desc: "Over 98% of Fortune 500 companies use Applicant Tracking Systems to filter candidates. These AI-powered systems automatically scan resumes for keywords, qualifications, and formatting. Career Genius helps job seekers optimize their CVs to pass through ATS filters, ensuring their applications reach human recruiters. Understanding ATS compatibility is no longer optional—it's essential for anyone serious about landing interviews in today's job market.",
    iconBg: '#EEF2FF', iconColor: '#4F46E5',
  },
  {
    icon: BarChart3,
    title: 'Automated Hiring & Efficiency',
    desc: 'AI automation reduces hiring time by up to 75% while improving candidate quality. Machine learning algorithms can process thousands of applications in seconds, identifying top candidates based on complex pattern recognition. This allows recruiters to focus on human aspects like cultural fit and soft skills assessment. For job seekers, understanding how AI evaluates candidates provides a strategic advantage in presenting qualifications effectively.',
    iconBg: '#EEF2FF', iconColor: '#4F46E5',
  },
  {
    icon: Target,
    title: 'Data-Driven Decision Making',
    desc: 'Modern recruitment relies on data analytics to eliminate bias and improve hiring outcomes. AI systems analyze millions of data points—from successful placements to market salary trends—to provide objective insights. Career Genius harnesses this power to give users accurate salary predictions, interview preparation based on real patterns, and CV optimization grounded in empirical success data. This evidence-based approach transforms career planning from guesswork into strategic decision-making.',
    iconBg: '#DCFCE7', iconColor: '#16A34A',
  },
];

const EMPLOYER_BENEFITS = [
  { icon: Clock,     title: 'Efficiency & Time Savings',  desc: 'Reduce screening time by 70% with AI-powered candidate filtering and matching',     iconBg: '#EEF2FF', iconColor: '#4F46E5' },
  { icon: BarChart3, title: 'Scalability',                desc: 'Process thousands of applications simultaneously without compromising quality',       iconBg: '#EEF2FF', iconColor: '#4F46E5' },
  { icon: UserCheck, title: 'Better Candidate Matching',  desc: 'AI algorithms identify candidates whose skills and experience align with job requirements', iconBg: '#EEF2FF', iconColor: '#4F46E5' },
];

const SEEKER_BENEFITS = [
  { icon: Briefcase, title: 'Employability Enhancement', desc: 'Improve CV quality and interview skills to significantly increase job offer rates',                iconBg: '#DCFCE7', iconColor: '#16A34A' },
  { icon: BarChart3, title: 'Market Insights',           desc: 'Access real-time salary data and industry trends to make informed career decisions',              iconBg: '#DCFCE7', iconColor: '#16A34A' },
  { icon: Users,     title: 'Confidence Building',       desc: 'Practice interviews with AI feedback to reduce anxiety and improve performance',                   iconBg: '#DCFCE7', iconColor: '#16A34A' },
];

const MODULES = ['CV Analysis', 'Mock Interview', 'Salary Prediction'] as const;
type Module = typeof MODULES[number];

const TEAM = [
  { name: 'Muhammad Dawood', role: 'Full Stack AI Developer', initials: 'MD' },
  { name: 'Taha Saeed',      role: 'AI/ML Engineer',          initials: 'TS' },
  { name: 'Faisal Chohan',   role: 'Backend Engineer',        initials: 'FC' },
];

// ── Mini Dashboard Mockup ─────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="w-full h-full flex text-xs overflow-hidden select-none" style={{ background: '#F8FAFF' }}>
      {/* Sidebar */}
      <div className="w-44 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-black" style={{ fontSize: '7px' }}>CG</span>
            </div>
            <span className="font-bold text-gray-900" style={{ fontSize: '11px' }}>Career Genius</span>
          </div>
        </div>
        <div className="px-3 py-2 flex-1 overflow-hidden">
          {['Employer Feed', 'Company Profile', 'New Positions', 'Drafts', 'AI Applicants', 'Shortlisted', 'Rejected', 'AI-Recommended', 'AI Tools', 'AI Search', 'AI Screening', 'Interview Generator'].map((item, i) => (
            <div key={item} className={`flex items-center gap-2 px-2 py-1 rounded-lg ${i === 0 ? 'bg-blue-50 text-blue-700' : 'text-gray-400'}`} style={{ fontSize: '9px' }}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              {item}
            </div>
          ))}
        </div>
        <div className="px-3 py-2 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold" style={{ fontSize: '7px' }}>N</span>
            </div>
            <span className="text-gray-500" style={{ fontSize: '9px' }}>Settings</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 w-44">
            <Search size={9} className="text-gray-400" />
            <span className="text-gray-400" style={{ fontSize: '9px' }}>Search candidates, jobs...</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 flex items-center gap-1" style={{ fontSize: '9px' }}><Brain size={9} /> AI Search</span>
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg" style={{ fontSize: '9px' }}>Create Interview</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden p-3 flex gap-3">
          <div className="flex-1 space-y-2.5">
            {/* Welcome */}
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <p className="font-bold text-gray-800" style={{ fontSize: '11px' }}>Welcome, Employer!</p>
              <p className="text-gray-400 mt-0.5" style={{ fontSize: '9px' }}>Here's your real-time hiring control center.</p>
              <div className="mt-2 flex gap-4 items-center">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full" style={{ fontSize: '8px' }}>● Government Verified</span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400" style={{ fontSize: '8px' }}>Profile Strength:</span>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[90%]" />
                  </div>
                  <span className="text-blue-600 font-bold" style={{ fontSize: '8px' }}>90%</span>
                </div>
                <span className="text-gray-500" style={{ fontSize: '8px' }}>Compliance Score: <b>98/100</b></span>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[['New Applicants', '248', '+12%', 'text-blue-600'], ['Avg Time-to-Hire', '12 Days', 'Target: 90%', 'text-violet-600'], ['Positions Open', '34', '+5%', 'text-emerald-600']].map(([l, v, c, col]) => (
                <div key={l} className="bg-white rounded-xl p-2.5 border border-gray-100">
                  <p className="text-gray-400" style={{ fontSize: '8px' }}>{l}</p>
                  <p className={`font-bold ${col}`} style={{ fontSize: '13px' }}>{v}</p>
                  <p className="text-green-500" style={{ fontSize: '8px' }}>{c}</p>
                </div>
              ))}
            </div>
            {/* Chart */}
            <div className="bg-white rounded-xl p-3 border border-gray-100">
              <p className="font-semibold text-gray-700" style={{ fontSize: '10px' }}>Application Trends</p>
              <p className="text-gray-400 mb-2" style={{ fontSize: '8px' }}>Your hiring funnel over the last few months.</p>
              <svg viewBox="0 0 280 56" className="w-full h-14">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points="0,52 40,47 80,42 130,28 180,20 230,12 280,6 280,56 0,56" fill="url(#g1)" />
                <polyline points="0,52 40,47 80,42 130,28 180,20 230,12 280,6" fill="none" stroke="#3b82f6" strokeWidth="2" />
                {[[0,52],[40,47],[80,42],[130,28],[180,20],[230,12],[280,6]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r="2.5" fill="#3b82f6" />
                ))}
              </svg>
            </div>
          </div>
          {/* Right */}
          <div className="w-36 space-y-2">
            <div className="bg-white rounded-xl p-2.5 border border-gray-100">
              <p className="text-gray-400 flex items-center gap-1" style={{ fontSize: '8px' }}><Star size={8} /> AI Match Quality</p>
              <p className="font-black text-gray-900" style={{ fontSize: '20px' }}>92%</p>
              <p className="text-green-600 font-medium" style={{ fontSize: '8px' }}>Excellent</p>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-gray-100">
              <p className="text-gray-400" style={{ fontSize: '8px' }}>Credits</p>
              <p className="font-black text-gray-900" style={{ fontSize: '18px' }}>1,500</p>
              <p className="text-orange-500" style={{ fontSize: '8px' }}>Expires in 12 days</p>
            </div>
            <div className="bg-white rounded-xl p-2.5 border border-gray-100">
              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1" style={{ fontSize: '9px' }}><Activity size={9} /> Activity Feed</p>
              <div className="space-y-1.5">
                {['Ananya Sharma applied for Software Engineer', 'Your company verification has been approved!', 'AI flagged a candidate for "Data Analyst" with a low match score.'].map((item, i) => (
                  <div key={i} className="flex gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                    <p className="text-gray-400" style={{ fontSize: '8px' }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type CVSubTab = 'analyze' | 'generate';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeModule, setActiveModule] = useState<Module>('CV Analysis');
  const [cvSubTab, setCvSubTab] = useState<CVSubTab>('analyze');

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <span className="font-bold text-blue-600 text-xl tracking-tight">Career Genius</span>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.id)}
                className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors">
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 items-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium px-4 py-2 transition-colors">
              Sign In
            </Link>
            <Link to="/login?tab=register"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="home" className="pt-16 min-h-screen flex items-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #5B21B6 0%, #4338CA 40%, #7C3AED 100%)' }}>

        {/* Dashboard mockup background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-16 bottom-0 w-[62%]" style={{ opacity: 0.22 }}>
            <DashboardMockup />
          </div>
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(67,56,202,0.98) 28%, rgba(67,56,202,0.75) 55%, rgba(67,56,202,0.05) 100%)'
          }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-32">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}
            className="max-w-[540px]">
            <h1 className="text-6xl font-black text-white leading-none mb-5 tracking-tight">Career Genius</h1>
            <p className="text-[22px] font-semibold text-white/90 mb-5 leading-snug">AI-Powered Recruitment Intelligence</p>
            <p className="text-white/70 text-base leading-relaxed mb-10">
              Optimize your CV, prepare for interviews, and predict your market value with cutting-edge artificial intelligence. Career Genius leverages advanced AI algorithms to help job seekers stand out in the competitive hiring landscape and enables recruiters to make data-driven decisions.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => scrollTo('features')}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-[15px]">
                Explore Features
              </button>
              <button onClick={() => scrollTo('modules')}
                className="px-8 py-3.5 text-white font-semibold rounded-xl transition-colors text-[15px] border border-white/30"
                style={{ background: 'rgba(255,255,255,0.12)' }}>
                Try Modules
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Core Features ───────────────────────────────────────────────── */}
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
              <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-7"
                  style={{ backgroundColor: iconBg }}>
                  <Icon size={30} style={{ color: iconColor }} />
                </div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Importance ───────────────────────────────────────────────── */}
      <section id="ai-importance" className="py-24 px-8" style={{ backgroundColor: '#F3F4F8' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">The Importance of Artificial Intelligence</h2>
            <p className="text-gray-500 text-lg">Why AI is revolutionizing modern recruitment systems</p>
          </div>
          <div className="space-y-5">
            {AI_ITEMS.map(({ icon: Icon, title, desc, iconBg, iconColor }, i) => (
              <motion.div key={title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-8 flex gap-7 items-start border border-gray-100"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="w-[64px] h-[64px] rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: iconBg }}>
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

      {/* ── Industry Value ──────────────────────────────────────────────── */}
      <section id="industry-value" className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Industry Relevance &amp; Project Value</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              How Career Genius aligns with real-world hiring practices and delivers measurable value
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-14">
            {/* Employers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Benefits for Employers</h3>
              <div className="space-y-8">
                {EMPLOYER_BENEFITS.map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
                  <div key={title} className="flex gap-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconBg }}>
                      <Icon size={20} style={{ color: iconColor }} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-[16px] mb-1">{title}</p>
                      <p className="text-gray-500 text-[14px] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Seekers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Benefits for Job Seekers</h3>
              <div className="space-y-8">
                {SEEKER_BENEFITS.map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
                  <div key={title} className="flex gap-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: iconBg }}>
                      <Icon size={20} style={{ color: iconColor }} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-[16px] mb-1">{title}</p>
                      <p className="text-gray-500 text-[14px] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-World Alignment card */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl p-10 text-white"
            style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #A855F7 100%)' }}>
            <h3 className="text-2xl font-bold mb-4">Real-World Alignment</h3>
            <p className="text-white/85 leading-relaxed mb-6 text-[15px]">
              Career Genius directly addresses the gap between traditional job search methods and modern AI-driven hiring. As recruitment technology evolves, candidates need tools that help them navigate automated systems while showcasing their unique value. Our platform bridges this gap by demystifying the AI recruitment process and providing actionable insights.
            </p>
            <ul className="space-y-2.5">
              {[
                'Aligns with industry standard ATS systems used by 98% of large companies',
                'Incorporates real market data for accurate salary predictions',
                'Reduces bias through objective, data-driven evaluation',
                'Promotes equal access to career advancement resources',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-white/85 text-[15px]">
                  <span className="mt-1 flex-shrink-0">•</span>{item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ── Functional Modules ──────────────────────────────────────────── */}
      <section id="modules" className="py-24 px-8" style={{ backgroundColor: '#F3F4F8' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-5xl font-black text-gray-900 mb-4">Functional Modules</h2>
            <p className="text-gray-500 text-lg">Interactive tools to enhance your career prospects</p>
          </div>

          {/* Tab bar */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-xl p-1.5 gap-1"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
              {MODULES.map(m => (
                <button key={m} onClick={() => setActiveModule(m)}
                  className="px-7 py-2.5 rounded-xl text-[15px] font-semibold transition-all"
                  style={activeModule === m
                    ? { background: '#2563EB', color: '#fff' }
                    : { color: '#374151', background: 'transparent' }
                  }>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Module card */}
          <div className="bg-white rounded-2xl p-10"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

            {activeModule === 'CV Analysis' && (
              <div>
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#EEF2FF' }}>
                    <FileText size={24} style={{ color: '#4F46E5' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">CV Tools</h3>
                    <p className="text-gray-400 text-[14px] mt-0.5">Analyze your CV or generate a new ATS-optimized one</p>
                  </div>
                </div>

                {/* Sub-tabs */}
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
                    <Sparkles size={15} /> Generate CV
                  </button>
                </div>

                {/* Analyze sub-tab */}
                {cvSubTab === 'analyze' && (
                  <div>
                    <div className="border-2 border-dashed rounded-2xl py-14 text-center mb-6"
                      style={{ borderColor: '#D1D5DB' }}>
                      <Upload size={44} className="mx-auto mb-4" style={{ color: '#9CA3AF' }} />
                      <p className="text-gray-600 font-medium text-[15px]">Click to upload or drag and drop</p>
                      <p className="text-gray-400 text-[13px] mt-1.5">PDF, DOC, DOCX (Max 5MB)</p>
                    </div>
                    <Link to="/login?tab=register"
                      className="block w-full text-white text-center font-semibold py-4 rounded-xl text-[15px] transition-colors"
                      style={{ background: '#2563EB' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#1D4ED8')}
                      onMouseOut={e => (e.currentTarget.style.background = '#2563EB')}>
                      Analyze CV
                    </Link>
                  </div>
                )}

                {/* Generate sub-tab */}
                {cvSubTab === 'generate' && (
                  <div>
                    <div className="rounded-2xl border border-gray-100 p-5 mb-6" style={{ background: '#FAFAFF' }}>
                      <p className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Steps to build your ATS CV</p>
                      <div className="space-y-3">
                        {[
                          { icon: User,          label: 'Personal Info',     desc: 'Name, email, phone, LinkedIn' },
                          { icon: FileText,      label: 'Summary',           desc: 'Professional summary with action verbs' },
                          { icon: Wrench,        label: 'Skills',            desc: 'Technical & soft skills' },
                          { icon: Briefcase,     label: 'Work Experience',   desc: 'Roles, companies & achievements' },
                          { icon: GraduationCap, label: 'Education',         desc: 'Degree, institution & year' },
                        ].map(({ icon: Icon, label, desc }, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: '#EEF2FF' }}>
                              <Icon size={14} style={{ color: '#7C3AED' }} />
                            </div>
                            <div className="flex-1">
                              <span className="text-[13px] font-semibold text-gray-800">{label}</span>
                              <span className="text-[12px] text-gray-400 ml-2">{desc}</span>
                            </div>
                            <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                        <Sparkles size={14} style={{ color: '#7C3AED' }} />
                        <p className="text-[12px] text-violet-600 font-medium">AI scores your CV and generates an ATS-optimized PDF</p>
                      </div>
                    </div>
                    <Link to="/login?tab=register"
                      className="block w-full text-white text-center font-semibold py-4 rounded-xl text-[15px] transition-colors"
                      style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}
                      onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#4338CA,#6D28D9)')}
                      onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(135deg,#4F46E5,#7C3AED)')}>
                      Sign Up to Generate CV
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeModule === 'Mock Interview' && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#EEF2FF' }}>
                    <MessageSquare size={24} style={{ color: '#4F46E5' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Mock Interview</h3>
                    <p className="text-gray-400 text-[14px] mt-0.5">Practice with targeted interview questions</p>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {['Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer'].map(role => (
                    <div key={role}
                      className="flex items-center justify-between px-5 py-4 border rounded-xl hover:border-indigo-200 transition-colors cursor-pointer"
                      style={{ borderColor: '#E5E7EB' }}>
                      <span className="text-gray-800 font-medium text-[15px]">{role}</span>
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  ))}
                </div>
                <Link to="/login?tab=register"
                  className="block w-full text-white text-center font-semibold py-4 rounded-xl text-[15px] transition-colors"
                  style={{ background: '#2563EB' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#1D4ED8')}
                  onMouseOut={e => (e.currentTarget.style.background = '#2563EB')}>
                  Start Interview Practice
                </Link>
              </div>
            )}

            {activeModule === 'Salary Prediction' && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#DCFCE7' }}>
                    <TrendingUp size={24} style={{ color: '#16A34A' }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Salary Prediction</h3>
                    <p className="text-gray-400 text-[14px] mt-0.5">Get market salary estimates for your role</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Job Title',   placeholder: 'e.g. Software Engineer' },
                    { label: 'Experience',  placeholder: 'e.g. 3 years' },
                    { label: 'Location',    placeholder: 'e.g. Lahore' },
                    { label: 'Industry',    placeholder: 'e.g. Technology' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{f.label}</label>
                      <input readOnly
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-400 bg-gray-50 focus:outline-none cursor-default"
                        placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>
                <Link to="/login?tab=register"
                  className="block w-full text-white text-center font-semibold py-4 rounded-xl text-[15px] transition-colors"
                  style={{ background: '#2563EB' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#1D4ED8')}
                  onMouseOut={e => (e.currentTarget.style.background = '#2563EB')}>
                  Predict Salary
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Team ────────────────────────────────────────────────────────── */}
      <section id="team" className="py-24 px-8" style={{ backgroundColor: '#0F172A' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">Our Team</h2>
            <p className="text-gray-400 text-lg">Meet the minds behind Career Genius</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {TEAM.map(({ name, role, initials }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-8 text-center border border-gray-700/50"
                style={{ backgroundColor: '#1E293B' }}>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black mx-auto mb-5">
                  {initials}
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{name}</h3>
                <p className="text-blue-400 text-sm font-medium mb-5">{role}</p>
                <button className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                  <Mail size={14} /> Contact
                </button>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t pt-12" style={{ borderColor: '#1E293B' }}>
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">About the Project</h3>
              <p className="text-gray-400 leading-relaxed text-[15px]">
                Career Genius is an academic research project developed to explore the intersection of modern AI technology and human resources. Our mission is to democratize access to career advancement tools and make the job search process more transparent and equitable.
              </p>
            </div>
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Academic Context</h3>
              <div className="space-y-3 text-[15px]">
                <div><span className="text-white font-semibold">Institution: </span><span className="text-gray-400">University of Central Punjab</span></div>
                <div><span className="text-white font-semibold">Department: </span><span className="text-gray-400">Computer Science &amp; IT</span></div>
                <div><span className="text-white font-semibold">Year: </span><span className="text-gray-400">2025–2026</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-8 px-8 text-center" style={{ backgroundColor: '#020617' }}>
        <p className="text-gray-500 text-sm">© 2025–2026 Career Genius · University of Central Punjab · All rights reserved.</p>
      </footer>
    </div>
  );
}
