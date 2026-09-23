import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'slate' | 'amber' | 'blue' | 'emerald' | 'rose' | 'purple';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'slate',
  dot = true,
  className = '',
}) => {
  const styles = {
    slate: {
      wrap: 'text-slate-300 bg-slate-800/80 border-slate-700/60',
      dot: 'bg-slate-400',
    },
    amber: {
      wrap: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      dot: 'bg-amber-400',
    },
    blue: {
      wrap: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      dot: 'bg-sky-400',
    },
    emerald: {
      wrap: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      dot: 'bg-emerald-400',
    },
    rose: {
      wrap: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      dot: 'bg-rose-400',
    },
    purple: {
      wrap: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      dot: 'bg-purple-400',
    },
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${styles.wrap} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />}
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
};
