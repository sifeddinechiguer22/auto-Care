import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  variant?: 'default' | 'amber' | 'blue' | 'emerald' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  onClick,
}) => {
  const iconColors = {
    default: 'text-slate-400 bg-slate-800/80 border-slate-700/60',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    blue: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-850' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg border ${iconColors}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
          {value}
        </span>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          {trend && (
            <span
              className={`font-medium ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
          {trend && trend.label && <span>·</span>}
          {trend && trend.label && <span>{trend.label}</span>}
          {!trend && subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
