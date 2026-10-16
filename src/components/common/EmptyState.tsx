import React from 'react'
import { Shield, Plus, Database, Sparkles } from 'lucide-react'

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
      <div className="p-4 bg-slate-800/80 text-cyan-400 rounded-2xl mb-4 ring-8 ring-slate-800/20">
        {icon || <Shield className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{actionText}</span>
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{secondaryActionText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const FirstTimeWelcomeCard: React.FC<{
  onLoadDemo: () => void;
  onCreateIncident: () => void;
}> = ({ onLoadDemo, onCreateIncident }) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to IncidentKit</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Security Incident Response Planner & Operations Hub
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Designed for cybersecurity analysts and computer system security students. Plan, triage, contain, document evidence, track timelines, and conduct post-incident reviews following NIST & SANS frameworks.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              100% Offline-First / Browser IndexedDB
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Zero Third-Party Telemetry
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <button
            onClick={onLoadDemo}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-lg shadow-cyan-950/50 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Demo Scenarios</span>
          </button>
          <button
            onClick={onCreateIncident}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Create New Incident</span>
          </button>
        </div>
      </div>
    </div>
  );
};
