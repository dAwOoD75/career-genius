import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Target, Users, Award, ArrowRight } from 'lucide-react';

const team = [
  { name: 'Research Team', role: 'Natural Language Processing', avatar: 'RT' },
  { name: 'Career Experts', role: 'HR & Recruitment Specialists', avatar: 'CE' },
  { name: 'Engineering', role: 'Full-Stack Development', avatar: 'EN' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">Career Genius</span>
          </Link>
          <div className="flex gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <span className="badge-blue mb-4 inline-flex">About Career Genius</span>
          <h1 className="text-5xl font-black text-white mb-6">
            Built to Fuel Your <span className="gradient-text">Career Quest</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Career Genius is a career preparation platform built to help students, fresh graduates, and professionals land their dream jobs.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="card mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-900/50 rounded-xl flex items-center justify-center">
              <Target size={20} className="text-primary-400" />
            </div>
            <h2 className="text-white text-2xl font-bold">Our Mission</h2>
          </div>
          <p className="text-slate-300 leading-relaxed text-lg">
            We believe every job seeker deserves access to professional-grade career tools. By combining cutting-edge technology with deep career expertise, we've built a platform that levels the playing field — giving everyone the competitive edge they need.
          </p>
        </motion.div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Zap, title: 'Results-First', desc: 'Every feature is built to give you the most accurate and actionable career insights.', color: 'text-primary-400' },
            { icon: Users, title: 'User-Centric', desc: 'Designed around real user needs. We talk to job seekers constantly to improve our tools.', color: 'text-emerald-400' },
            { icon: Award, title: 'Results-Driven', desc: 'We measure success by your success. Our users consistently land better jobs, faster.', color: 'text-amber-400' },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card text-center"
            >
              <Icon size={32} className={`${color} mx-auto mb-3`} />
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="card mb-12">
          <h2 className="text-white text-2xl font-bold mb-6">Built With Modern Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Frontend', tech: 'React + TypeScript + Tailwind CSS' },
              { label: 'Backend', tech: 'Python + FastAPI + SQLAlchemy' },
              { label: 'Intelligence', tech: 'NLP Pipeline + Language Models' },
              { label: 'Database', tech: 'PostgreSQL + SQLite' },
            ].map(({ label, tech }) => (
              <div key={label} className="bg-dark-700/50 rounded-xl p-4">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">{label}</p>
                <p className="text-white font-medium text-sm mt-1">{tech}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
