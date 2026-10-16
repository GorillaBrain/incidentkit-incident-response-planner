import React from 'react'
import type { Incident } from '../../types/incident'
import { PriorityBadge } from '../common/Badge'
import { CheckCircle2, Clock, Calendar, User, ArrowRight } from 'lucide-react'

export interface ActionItemsListProps {
  incidents: Incident[];
  onSelectIncident: (id: string, tab: 'review') => void;
  onToggleStatus: (incidentId: string, actionId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
}

export const ActionItemsList: React.FC<ActionItemsListProps> = ({
  incidents,
  onSelectIncident,
  onToggleStatus,
}) => {
  // Extract all unresolved action items across all incidents
  const unresolvedItems: {
    incidentId: string;
    incidentTitle: string;
    action: {
      id: string;
      title: string;
      owner: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      targetDate: string;
      status: 'Pending' | 'In Progress' | 'Completed';
      notes?: string;
    };
  }[] = [];

  incidents.forEach((inc) => {
    if (inc.postIncidentReview && inc.postIncidentReview.actionItems) {
      inc.postIncidentReview.actionItems.forEach((act) => {
        if (act.status !== 'Completed') {
          unresolvedItems.push({
            incidentId: inc.id,
            incidentTitle: inc.title,
            action: act,
          });
        }
      });
    }
  });

  if (unresolvedItems.length === 0) {
    return null;
  }

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Outstanding Post-Incident Actions</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {unresolvedItems.length} Pending
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Remediation tasks and security hardening commitments from Post-Incident Reviews
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto pr-1">
        {unresolvedItems.map(({ incidentId, action }) => (
          <div
            key={`${incidentId}-${action.id}`}
            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() =>
                  onToggleStatus(
                    incidentId,
                    action.id,
                    action.status === 'Pending' ? 'In Progress' : 'Completed'
                  )
                }
                title={action.status === 'Pending' ? 'Mark In Progress' : 'Mark Completed'}
                className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
              >
                {action.status === 'Pending' ? (
                  <Clock className="w-4 h-4 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                )}
              </button>
              <div>
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  {action.title}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-cyan-400">
                    {incidentId}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    {action.owner || 'Unassigned'}
                  </span>
                  {action.targetDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      Due: {action.targetDate}
                    </span>
                  )}
                  <PriorityBadge priority={action.priority} />
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectIncident(incidentId, 'review')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors self-start sm:self-center shrink-0"
            >
              <span>View PIR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
