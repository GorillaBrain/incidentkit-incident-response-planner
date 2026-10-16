import React, { useState } from 'react'
import type { Incident, IncidentStatus } from '../../types/incident'
import { STATUS_DEFINITIONS, STATUS_ORDER } from '../../constants/statuses'
import { Modal } from '../common/Modal'
import { StatusBadge } from '../common/Badge'
import { Check, ArrowRight } from 'lucide-react'

export interface StatusTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident;
  onUpdateStatus: (newStatus: IncidentStatus, transitionNote: string) => Promise<void>;
}

export const StatusTransitionModal: React.FC<StatusTransitionModalProps> = ({
  isOpen,
  onClose,
  incident,
  onUpdateStatus,
}) => {
  const currentDef = STATUS_DEFINITIONS[incident.status] || STATUS_DEFINITIONS.New;
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(incident.status);
  const [transitionNote, setTransitionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === incident.status) {
      onClose();
      return;
    }
    setIsSubmitting(true);
    try {
      await onUpdateStatus(selectedStatus, transitionNote);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Status: ${incident.id}`}
      subtitle="Transition incident lifecycle state and record audit log"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current State vs Target */}
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-800 bg-slate-950">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Current Status</span>
            <div>
              <StatusBadge status={incident.status} />
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-600" />
          <div className="space-y-1 text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">Target Status</span>
            <div>
              <StatusBadge status={selectedStatus} />
            </div>
          </div>
        </div>

        {/* Transition Options */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Select New Incident Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STATUS_ORDER.map((st) => {
              const def = STATUS_DEFINITIONS[st];
              const isSelected = selectedStatus === st;
              const isAllowed =
                currentDef.allowedTransitions.includes(st) || st === incident.status;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm'
                      : isAllowed
                      ? 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                      : 'border-slate-800/50 bg-slate-950/40 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>{def.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {def.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reason / Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Transition Justification & Actions Completed
          </label>
          <textarea
            rows={3}
            value={transitionNote}
            onChange={(e) => setTransitionNote(e.target.value)}
            placeholder="Explain why this transition occurred (e.g. Host quarantined via EDR, lateral movement halted)..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
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
            <Check className="w-4 h-4" />
            <span>Apply Status Change</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
