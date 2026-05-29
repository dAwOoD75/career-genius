import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', className, text, fullScreen }: LoadingSpinnerProps) {
  const sizeMap = { sm: 16, md: 32, lg: 48 };
  const px = sizeMap[size];

  const spinner = (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        style={{ width: px, height: px }}
        className="rounded-full border-[3px] border-dark-600 border-t-primary-500"
      />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
