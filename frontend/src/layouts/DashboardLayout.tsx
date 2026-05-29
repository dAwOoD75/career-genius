import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Zap, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Features',       id: 'features' },
  { label: 'AI Importance',  id: 'ai-importance' },
  { label: 'Industry Value', id: 'industry-value' },
  { label: 'Modules',        id: 'modules' },
];

const TEAM = [
  { name: 'Muhammad Dawood', role: 'Full Stack AI Developer', initials: 'MD' },
  { name: 'Taha Saeed',      role: 'AI/ML Engineer',          initials: 'TS' },
  { name: 'Faisal Chohan',   role: 'Backend Engineer',        initials: 'FC' },
];

function SiteFooter() {
  return (
    <footer>
      {/* ── Team + About ── */}
      <div className="py-20 px-8" style={{ backgroundColor: '#0F172A' }}>
        <div className="max-w-7xl mx-auto">

          {/* Heading */}
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-3">Our Team</h2>
            <p className="text-gray-400 text-base">Meet the minds behind Career Genius</p>
          </div>

          {/* Team cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {TEAM.map(({ name, role, initials }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-8 text-center border border-gray-700/50"
                style={{ backgroundColor: '#1E293B' }}
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black mx-auto mb-5"
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#3B82F6)' }}
                >
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

          {/* About + Academic Context */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t pt-12"
            style={{ borderColor: '#1E293B' }}
          >
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">About the Project</h3>
              <p className="text-gray-400 leading-relaxed text-[15px]">
                Career Genius is an academic research project developed to explore the intersection
                of modern AI technology and human resources. Our mission is to democratize access
                to career advancement tools and make the job search process more transparent and equitable.
              </p>
            </div>
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Academic Context</h3>
              <div className="space-y-3 text-[15px]">
                <div>
                  <span className="text-white font-semibold">Institution: </span>
                  <span className="text-gray-400">University of Central Punjab</span>
                </div>
                <div>
                  <span className="text-white font-semibold">Department: </span>
                  <span className="text-gray-400">Computer Science &amp; IT</span>
                </div>
                <div>
                  <span className="text-white font-semibold">Year: </span>
                  <span className="text-gray-400">2025–2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div className="py-6 px-8 text-center" style={{ backgroundColor: '#020617' }}>
        <p className="text-gray-500 text-sm">
          © 2025–2026 Career Genius · University of Central Punjab · All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleNavClick = (id: string) => {
    setMenuOpen(false);
    if (location.pathname === '/dashboard') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/dashboard', { state: { scrollTo: id } });
    }
  };

  const handleLogoClick = () => {
    if (location.pathname === '/dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F3F4F8' }}>

      {/* ── Top Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <button onClick={handleLogoClick} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-blue-600 text-[18px] tracking-tight">Career Genius</span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => handleNavClick(l.id)}
                className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
                {l.label}
              </button>
            ))}
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <span className="text-gray-700 text-sm font-medium hidden lg:block">
                {user?.full_name?.split(' ')[0] || user?.username}
              </span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
              <LogOut size={15} /> <span className="hidden sm:block">Sign Out</span>
            </button>
            <button className="md:hidden p-2 rounded-xl hover:bg-gray-100" onClick={() => setMenuOpen(o => !o)}>
              {menuOpen ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-2">
            {NAV_LINKS.map(l => (
              <button key={l.id} onClick={() => handleNavClick(l.id)}
                className="block w-full text-left text-gray-700 py-2.5 text-sm font-medium hover:text-blue-600 transition-colors">
                {l.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── Page Content ── */}
      <div className="pt-16 flex-1">
        <Outlet />
      </div>

      {/* ── Site-wide Footer ── */}
      <SiteFooter />
    </div>
  );
}
