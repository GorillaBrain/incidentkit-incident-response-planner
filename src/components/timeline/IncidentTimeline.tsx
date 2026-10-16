import React, { useState, useMemo } from 'react'
import type { TimelineEvent, TimelineEventCategory, EvidenceRecord } from '../../types/incident'
import { TimelineEventModal } from './TimelineEventModal'
import {
  Clock,
  Plus,
  ArrowUpDown,
  Filter,
  Search,
  ShieldCheck,
  ShieldAlert,
  Radio,
  FileCheck,
  CheckCircle2,
  Trash2,
  Paperclip,
  Info,
} from 'lucide-react'

export interface IncidentTimelineProps {
  incidentId: string;
  timeline: TimelineEvent[];
  evidenceList: EvidenceRecord[];
  onAddEvent: (
    incidentId: string,
    data: Omit<TimelineEvent, 'id' | 'incidentId' | 'enteredAt'>
  ) => Promise<void>;
  onDeleteEvent: (incidentId: string, eventId: string) => Promise<void>;
  onSelectEvidence?: (evidenceId: string) => void;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  incidentId,
  timeline,
  evidenceList,
  onAddEvent,
  onDeleteEvent,
  onSelectEvidence,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return timeline
      .filter((ev) => {
        if (selectedCategory !== 'all' && ev.category !== selectedCategory) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [timeline, sortOrder, selectedCategory]);

  const getCategoryIcon = (category: TimelineEventCategory) => {
    switch (category) {
      case 'Detection':
        return <Search className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Triage':
        return <Radio className="w-3.5 h-3.5 text-sky-400" />;
      case 'Notification':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
      case 'Containment':
        return <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />;
      case 'Eradication':
        return <FileCheck className="w-3.5 h-3.5 text-purple-400" />;
      case 'Recovery':
        return <Clock className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Resolution':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Other':
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getCategoryBadgeClass = (category: TimelineEventCategory) => {
    switch (category) {
      case 'Detection':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'Triage':
        return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
      case 'Notification':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Containment':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'Eradication':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'Recovery':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'Resolution':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'Other':
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Incident Chronology & Timeline</h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {timeline.length} Milestones
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chronological audit log tracking detection, containment, eradication, and communications
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-950/50 transition-all shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Timeline Event</span>
        </button>
      </div>

      {/* Filter and Order Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Filter Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            <option value="Detection">Detection</option>
            <option value="Triage">Triage</option>
            <option value="Notification">Notification</option>
            <option value="Containment">Containment</option>
            <option value="Eradication">Eradication</option>
            <option value="Recovery">Recovery</option>
            <option value="Resolution">Resolution</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {sortOrder === 'asc' ? 'Order: Oldest First (Chronological)' : 'Order: Newest First (Recent)'}
          </button>
        </div>
      </div>

      {/* Chronological Flow */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-6">
        {filteredEvents.length > 0 ? (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-8">
            {filteredEvents.map((ev) => {
              const matchedEvidence = ev.associatedEvidenceId
                ? evidenceList.find((e) => e.id === ev.associatedEvidenceId)
                : null;

              return (
                <div key={ev.id} className="relative group">
                  {/* Timeline Dot Marker */}
                  <div className="absolute -left-[33px] sm:-left-[41px] top-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:border-cyan-400 group-hover:scale-110 transition-all">
                    {getCategoryIcon(ev.category)}
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700 transition-all space-y-2">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-cyan-400">
                          {ev.id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                            ev.category
                          )}`}
                        >
                          {ev.category}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100">
                          {ev.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          onClick={() => onDeleteEvent(incidentId, ev.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ev.description}
                    </p>

                    {/* Linked Evidence */}
                    {matchedEvidence && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => onSelectEvidence?.(matchedEvidence.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-300 hover:text-cyan-200 transition-colors"
                        >
                          <Paperclip className="w-3 h-3 text-cyan-400" />
                          <span>
                            Linked Evidence: <strong>{matchedEvidence.fileOrRefName}</strong> ({matchedEvidence.id})
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Dual Timestamps: Event Occurrence vs System Logged */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium text-slate-300">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>Event Time: {new Date(ev.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Logged in IncidentKit: {new Date(ev.enteredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No events match the selected category filter.
          </div>
        )}
      </div>

      {/* Dual Timestamping Disclaimer */}
      <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Chronology Verification Notice:</strong> IncidentKit captures two timestamps for each milestone: the manually recorded <em>Event Occurrence Time</em> (when the activity happened on systems) and the system <em>Entry Time</em> (when logged into this tool). User-entered timestamps are decision-support documentation and must not be presented as independently verified NTP server proofs.
        </p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TimelineEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          evidenceList={evidenceList}
          onSubmit={async (data) => {
            await onAddEvent(incidentId, data);
          }}
        />
      )}
    </div>
  );
};
