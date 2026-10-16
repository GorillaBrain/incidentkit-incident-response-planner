import React from 'react'
import type { Incident } from '../../types/incident'
import { SeverityBadge, StatusBadge } from '../common/Badge'
import { ArrowRight, Clock, Sparkles } from 'lucide-react'

export interface RecentIncidentsProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onViewAll: () => void;
}

export const RecentIncidents: React.FC<RecentIncidentsProps> = ({
  incidents,
  onSelectIncident,
  onViewAll,
}) => {
  // Sort by updatedAt descending, pick top 5
  const recent = [...incidents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Recently Updated Incidents</span>
          </h3>
          <p className="text-xs text-slate-400">
            Latest operational activity and triage status
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>View All ({incidents.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="divide-y divide-slate-800/80">
        {recent.map((inc) => (
          <div
            key={inc.id}
            onClick={() => onSelectIncident(inc.id)}
            className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 p-2.5 rounded-lg transition-colors cursor-pointer group"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                  {inc.id}
                </span>
                <SeverityBadge severity={inc.severity} size="sm" />
                <StatusBadge status={inc.status} size="sm" />
                {inc.isDemo && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    <Sparkles className="w-2.5 h-2.5" />
                    Demo
                  </span>
                )}
                <span className="text-[11px] text-slate-400 font-medium">
                  {inc.type}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                {inc.title}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Lead: {inc.assignedResponder || 'Unassigned'}</span>
                {inc.affectedSystems && inc.affectedSystems.length > 0 && (
                  <span className="truncate max-w-xs">
                    Scope: {inc.affectedSystems.slice(0, 2).join(', ')}
                    {inc.affectedSystems.length > 2 && ` +${inc.affectedSystems.length - 2} more`}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 self-start sm:self-center">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatRelativeTime(inc.updatedAt)}</span>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all ml-1" />
            </div>
          </div>
        ))}

        {recent.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-xs">
            No incidents recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
