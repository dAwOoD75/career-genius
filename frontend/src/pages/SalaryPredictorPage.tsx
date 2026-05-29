import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { TrendingUp, Zap, Plus, X, Info } from 'lucide-react';
import { salaryService } from '@/services/salaryService';
import { SalaryPrediction } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

const PAKISTAN_CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Faisalabad', 'Multan', 'Sialkot', 'Remote'];

const EDUCATION_LEVELS = ["High School", "Associate", "Bachelor's", "Master's", "PhD"];
const COMPANY_SIZES    = ['Startup', 'Small (10-50)', 'Medium (50-500)', 'Large (500+)', 'Enterprise (10k+)'];
const INDUSTRIES       = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Consulting', 'E-commerce', 'Media', 'Telecom'];

interface FormData {
  job_title: string;
  experience_years: number;
  city: string;
  education_level: string;
  industry: string;
  company_size: string;
}

const isPKR = (currency: string) => currency === 'PKR';

function formatAmount(val: number, currency: string): string {
  if (currency === 'PKR') {
    if (val >= 100_000) return `PKR ${(val / 100_000).toFixed(1)} Lakh`;
    return `PKR ${val.toLocaleString('en-PK')}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(val);
}

function shortLabel(val: number, currency: string): string {
  if (currency === 'PKR') {
    if (val >= 100_000) return `${(val / 100_000).toFixed(0)}L`;
    return `${(val / 1000).toFixed(0)}K`;
  }
  return val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`;
}

const periodLabel = (currency: string) => isPKR(currency) ? 'per month' : 'per year';

export default function SalaryPredictorPage() {
  const [skills, setSkills]         = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [prediction, setPrediction] = useState<SalaryPrediction | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { city: 'Lahore' },
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills(p => [...p, s]); setSkillInput(''); }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const result = await salaryService.predict({
        ...data,
        country: 'Pakistan',
        skills,
        experience_years: Number(data.experience_years),
      });
      setPrediction(result);
      toast.success('Salary prediction ready!');
    } catch {
      toast.error('Prediction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const growthData = prediction?.growth_projection
    ? [
        { year: 'Now',    salary: prediction.predicted_median },
        { year: '+1 Yr',  salary: prediction.growth_projection.year_1 },
        { year: '+3 Yrs', salary: prediction.growth_projection.year_3 },
        { year: '+5 Yrs', salary: prediction.growth_projection.year_5 },
      ]
    : [];

  const skillImpactData = prediction?.skill_impact
    ? Object.entries(prediction.skill_impact)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 6)
        .map(([skill, impact]) => ({ skill, impact }))
    : [];

  const cur = prediction?.currency ?? 'PKR';
  const pkr = isPKR(cur);

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    itemStyle: { color: '#374151' },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Salary Predictor</h1>
        <p className="section-subtitle">
          Get real market salary insights — Pakistan figures shown in <strong className="text-gray-700">PKR per month</strong>.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Form ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">

            <div>
              <label className="label">Job Title</label>
              <input
                className={`input-field ${errors.job_title ? 'border-red-400' : ''}`}
                placeholder="e.g., Software Engineer"
                {...register('job_title', { required: true })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Experience (Years)</label>
                <input
                  type="number" min="0" max="50" step="0.5"
                  className="input-field" placeholder="3"
                  {...register('experience_years', { required: true })}
                />
              </div>
              <div>
                <label className="label">City</label>
                <select className="input-field" {...register('city')}>
                  {PAKISTAN_CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Education</label>
                <select className="input-field" {...register('education_level')}>
                  <option value="">Select...</option>
                  {EDUCATION_LEVELS.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Industry</label>
                <select className="input-field" {...register('industry')}>
                  <option value="">Select...</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Company Size</label>
              <select className="input-field" {...register('company_size')}>
                <option value="">Select...</option>
                {COMPANY_SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Skills */}
            <div>
              <label className="label">Key Skills</label>
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="e.g., React, Python, AWS..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button type="button" onClick={addSkill} className="btn-secondary px-3">
                  <Plus size={16} />
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map(s => (
                    <span key={s} className="badge-blue flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => setSkills(p => p.filter(x => x !== s))}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {isLoading ? <LoadingSpinner size="sm" /> : <><Zap size={18} /> Predict Salary</>}
            </button>
          </form>
        </motion.div>

        {/* ── Results ── */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Main salary card */}
                <div className="card text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <p className="text-gray-400 text-sm font-medium">Estimated Salary Range</p>
                    {pkr && (
                      <span className="badge-green text-xs flex items-center gap-1">
                        <Info size={11} /> PKR / month
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-4 my-5">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">Min</p>
                      <p className="text-xl font-bold text-gray-600">
                        {formatAmount(prediction.predicted_min!, cur)}
                      </p>
                    </div>

                    <div className="text-center px-5 border-x border-gray-200">
                      <p className="text-gray-400 text-xs mb-1">Median</p>
                      <p className="text-4xl font-black gradient-text">
                        {formatAmount(prediction.predicted_median!, cur)}
                      </p>
                      <span className="badge-blue text-xs mt-2 inline-block">{periodLabel(cur)}</span>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">Max</p>
                      <p className="text-xl font-bold text-gray-600">
                        {formatAmount(prediction.predicted_max!, cur)}
                      </p>
                    </div>
                  </div>

                  {/* Range bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 via-primary-500 to-accent-500 h-2 rounded-full" />
                  </div>

                  {pkr && (
                    <p className="text-gray-400 text-xs mt-3">
                      Annual equivalent ≈{' '}
                      <span className="text-gray-600 font-medium">
                        {formatAmount((prediction.predicted_median ?? 0) * 12, cur)}
                      </span>
                    </p>
                  )}

                  {prediction.market_insights && (
                    <p className="text-gray-500 text-sm mt-4 text-left leading-relaxed border-t border-gray-100 pt-4">
                      {prediction.market_insights}
                    </p>
                  )}
                </div>

                {/* Growth projection */}
                {growthData.length > 0 && (
                  <div className="card">
                    <h3 className="text-gray-900 font-bold mb-1">
                      Salary Growth Projection
                      {pkr && <span className="text-gray-400 text-sm font-normal ml-2">(PKR/month)</span>}
                    </h3>
                    <p className="text-gray-400 text-xs mb-4">Based on typical career progression in your field</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          tickFormatter={v => shortLabel(v, cur)}
                          width={55}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip {...tooltipStyle} formatter={(v: number) => [formatAmount(v, cur), periodLabel(cur)]} />
                        <Line
                          type="monotone" dataKey="salary"
                          stroke="#3b82f6" strokeWidth={2.5}
                          dot={{ fill: '#3b82f6', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Skill impact */}
                {skillImpactData.length > 0 && (
                  <div className="card">
                    <h3 className="text-gray-900 font-bold mb-1">Skill Premium</h3>
                    <p className="text-gray-400 text-xs mb-4">
                      Additional {periodLabel(cur)} earned per skill
                    </p>
                    <ResponsiveContainer width="100%" height={Math.max(140, skillImpactData.length * 36)}>
                      <BarChart data={skillImpactData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          type="number"
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          tickFormatter={v => `+${shortLabel(v, cur)}`}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category" dataKey="skill"
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          width={90}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          {...tooltipStyle}
                          formatter={(v: number) => [`+${formatAmount(v, cur)}/${isPKR(cur) ? 'mo' : 'yr'}`, 'Salary Boost']}
                        />
                        <Bar dataKey="impact" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Comparable roles */}
                {prediction.comparable_roles?.length > 0 && (
                  <div className="card">
                    <h3 className="text-gray-900 font-bold mb-4">Comparable Roles</h3>
                    <div className="space-y-3">
                      {prediction.comparable_roles.map((role: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-gray-700 font-medium">{role.title}</span>
                          <span className="text-primary-600 font-bold text-sm">
                            {formatAmount(role.salary_min, cur)}
                            {' – '}
                            {formatAmount(role.salary_max, cur)}
                            <span className="text-gray-400 font-normal text-xs ml-1">/{isPKR(cur) ? 'mo' : 'yr'}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full min-h-[400px]"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp size={36} className="text-emerald-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">Fill out the form to get your salary prediction</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Pakistan salaries shown in <span className="text-emerald-600 font-medium">PKR / month</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
