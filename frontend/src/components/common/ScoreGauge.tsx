import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  showLabel?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 80) return { text: 'text-emerald-600', stroke: '#10b981', badge: 'badge-green' };
  if (score >= 60) return { text: 'text-amber-500', stroke: '#f59e0b', badge: 'badge-yellow' };
  return { text: 'text-red-500', stroke: '#ef4444', badge: 'badge-red' };
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Average';
  if (score >= 40) return 'Below Average';
  return 'Poor';
}

export default function ScoreGauge({ score, size = 120, label, showLabel = true }: ScoreGaugeProps) {
  const colors = getScoreColor(score);
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#E5E7EB" strokeWidth="10"
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={colors.stroke} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={clsx('font-bold', colors.text, size >= 120 ? 'text-3xl' : 'text-xl')}
          >
            {Math.round(score)}
          </motion.span>
          <span className="text-gray-400 text-xs">/ 100</span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          {label && <p className="text-gray-400 text-sm">{label}</p>}
          <span className={clsx('badge mt-1', colors.badge)}>{getScoreLabel(score)}</span>
        </div>
      )}
    </div>
  );
}

export { getScoreColor, getScoreLabel };
