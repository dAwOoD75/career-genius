import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'purple' | 'green' | 'amber' | 'red';
  delay?: number;
}

const colorMap = {
  blue:   { bg: 'bg-primary-900/40', icon: 'text-primary-400', border: 'border-primary-700/30', glow: 'shadow-primary-900/20' },
  purple: { bg: 'bg-purple-900/40',  icon: 'text-purple-400',  border: 'border-purple-700/30',  glow: 'shadow-purple-900/20' },
  green:  { bg: 'bg-emerald-900/40', icon: 'text-emerald-400', border: 'border-emerald-700/30', glow: 'shadow-emerald-900/20' },
  amber:  { bg: 'bg-amber-900/40',   icon: 'text-amber-400',   border: 'border-amber-700/30',   glow: 'shadow-amber-900/20' },
  red:    { bg: 'bg-red-900/40',     icon: 'text-red-400',     border: 'border-red-700/30',     glow: 'shadow-red-900/20' },
};

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'blue', delay = 0 }: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={clsx('card border shadow-xl', colors.border, colors.glow)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center', colors.bg)}>
          <Icon size={22} className={colors.icon} />
        </div>
      </div>
    </motion.div>
  );
}
