import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Edit3, Mail, MessageSquare,
  TrendingUp, Settings, LogOut, X, ChevronRight, Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
  { path: '/cv-analyzer',     label: 'CV Analyzer',     icon: FileText },
  { path: '/resume-builder',  label: 'Resume Builder',  icon: Edit3 },
  { path: '/cover-letter',    label: 'Cover Letter',    icon: Mail },
  { path: '/interview',       label: 'Interview Prep',  icon: MessageSquare },
  { path: '/salary-predictor',label: 'Salary Predictor',icon: TrendingUp },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-500 rounded-xl flex items-center justify-center shadow-sm">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-gray-900 text-base">Career Genius</span>
          <p className="text-xs text-gray-400">Career Platform</p>
        </div>
        <button onClick={onClose} className="ml-auto lg:hidden p-1 rounded-lg hover:bg-gray-100">
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 font-medium text-sm truncate">{user?.full_name || user?.username}</p>
            <p className="text-gray-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} onClick={onClose}
            className={({ isActive }) => clsx(isActive ? 'sidebar-link-active' : 'sidebar-link')}>
            <Icon size={18} />
            <span>{label}</span>
            <ChevronRight size={14} className="ml-auto opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        <NavLink to="/settings" onClick={onClose}
          className={({ isActive }) => clsx(isActive ? 'sidebar-link-active' : 'sidebar-link')}>
          <Settings size={18} /><span>Settings</span>
        </NavLink>
        <button onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut size={18} /><span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-60 flex-shrink-0 h-screen sticky top-0">{content}</aside>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-full w-60 z-50">
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
