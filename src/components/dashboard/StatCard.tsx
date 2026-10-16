import React from 'react'

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  subtitle,
  badge,
  onClick,
}) => {
  const badgeClasses = {
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    info: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    neutral: 'bg-slate-700 text-slate-300 border-slate-600',
  }[badge?.variant || 'neutral'];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg transition-all ${
        onClick
          ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-900/90 hover:scale-[1.01]'
          : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
          {label}
        </span>
        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold font-mono tracking-tight text-white">
          {value}
        </div>
        {badge && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeClasses}`}
          >
            {badge.text}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
    </div>
  );
};
