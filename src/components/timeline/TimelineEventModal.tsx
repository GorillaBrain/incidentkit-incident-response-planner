import React, { useState } from 'react'
import type { TimelineEvent, TimelineEventCategory, EvidenceRecord } from '../../types/incident'
import { Modal } from '../common/Modal'
import { Plus, Save } from 'lucide-react'

export interface TimelineEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceList: EvidenceRecord[];
  onSubmit: (data: Omit<TimelineEvent, 'id' | 'incidentId' | 'enteredAt'>) => Promise<void>;
  initialData?: TimelineEvent | null;
}

const CATEGORIES: TimelineEventCategory[] = [
  'Detection',
  'Triage',
  'Notification',
  'Containment',
  'Eradication',
  'Recovery',
  'Resolution',
  'Other',
];

export const TimelineEventModal: React.FC<TimelineEventModalProps> = ({
  isOpen,
  onClose,
  evidenceList,
  onSubmit,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const formatForInput = (iso?: string) => {
    if (!iso) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 16);
    }
    try {
      const d = new Date(iso);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<TimelineEventCategory>(
    initialData?.category || 'Detection'
  );
  const [timestamp, setTimestamp] = useState(formatForInput(initialData?.timestamp));
  const [description, setDescription] = useState(initialData?.description || '');
  const [associatedEvidenceId, setAssociatedEvidenceId] = useState(
    initialData?.associatedEvidenceId || ''
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Event title is required.');
      return;
    }
    if (!timestamp) {
      setError('Event occurrence timestamp is required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        category,
        timestamp: new Date(timestamp).toISOString(),
        description: description.trim(),
        associatedEvidenceId: associatedEvidenceId || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Event: ${initialData?.id}` : 'Record Incident Timeline Event'}
      subtitle="Log chronological operational milestones, detection alerts, containment steps, or communications"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Event Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Inbound Spearphishing Message Flagged by Mail Filter"
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Event Category <span className="text-rose-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TimelineEventCategory)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Event Occurrence Date/Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Event Description & Technical Details
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Document systems involved, commands run, decisions made, or external notifications dispatched..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {evidenceList.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Link Associated Evidence Artifact (Optional)
            </label>
            <select
              value={associatedEvidenceId}
              onChange={(e) => setAssociatedEvidenceId(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- None --</option>
              {evidenceList.map((evd) => (
                <option key={evd.id} value={evd.id}>
                  {evd.id} - {evd.fileOrRefName} ({evd.evidenceType})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md transition-colors disabled:opacity-50"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isEditing ? 'Save Event' : 'Add Event to Timeline'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
