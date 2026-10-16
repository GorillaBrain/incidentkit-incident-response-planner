import React, { useState } from 'react'
import type { PostIncidentReview, PostIncidentActionItem } from '../../types/incident'
import { generateActionItemId } from '../../services/validation'
import { PriorityBadge } from '../common/Badge'
import {
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Clock,
} from 'lucide-react'

export interface PostIncidentReviewFormProps {
  incidentId: string;
  initialReview?: PostIncidentReview;
  onSaveReview: (incidentId: string, review: PostIncidentReview) => Promise<void>;
}

export const PostIncidentReviewForm: React.FC<PostIncidentReviewFormProps> = ({
  incidentId,
  initialReview,
  onSaveReview,
}) => {
  const [conductedBy, setConductedBy] = useState(initialReview?.conductedBy || '');
  const [whatHappened, setWhatHappened] = useState(initialReview?.whatHappened || '');
  const [howDetected, setHowDetected] = useState(initialReview?.howDetected || '');
  const [rootCause, setRootCause] = useState(initialReview?.rootCause || '');
  const [whatWorkedWell, setWhatWorkedWell] = useState(initialReview?.whatWorkedWell || '');
  const [whatWentWrong, setWhatWentWrong] = useState(initialReview?.whatWentWrong || '');
  const [businessImpactSummary, setBusinessImpactSummary] = useState(
    initialReview?.businessImpactSummary || ''
  );
  const [delayedActions, setDelayedActions] = useState(initialReview?.delayedActions || '');
  const [improvementsNeeded, setImprovementsNeeded] = useState(
    initialReview?.improvementsNeeded || ''
  );
  const [preventiveMeasures, setPreventiveMeasures] = useState(
    initialReview?.preventiveMeasures || ''
  );
  const [keyLessonsLearned, setKeyLessonsLearned] = useState(
    initialReview?.keyLessonsLearned || ''
  );

  const [actionItems, setActionItems] = useState<PostIncidentActionItem[]>(
    initialReview?.actionItems || []
  );

  // New action item state
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionOwner, setNewActionOwner] = useState('');
  const [newActionPriority, setNewActionPriority] = useState<
    'Critical' | 'High' | 'Medium' | 'Low'
  >('High');
  const [newActionDate, setNewActionDate] = useState('');
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddActionItem = () => {
    if (!newActionTitle.trim()) return;
    const item: PostIncidentActionItem = {
      id: generateActionItemId(actionItems.length),
      title: newActionTitle.trim(),
      owner: newActionOwner.trim() || 'Unassigned',
      priority: newActionPriority,
      targetDate: newActionDate || new Date().toISOString().slice(0, 10),
      status: 'Pending',
    };
    setActionItems([...actionItems, item]);
    setNewActionTitle('');
    setNewActionOwner('');
    setNewActionDate('');
    setIsAddingAction(false);
  };

  const handleDeleteActionItem = (id: string) => {
    setActionItems(actionItems.filter((a) => a.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setActionItems(
      actionItems.map((a) => {
        if (a.id !== id) return a;
        const nextStatus =
          a.status === 'Pending'
            ? 'In Progress'
            : a.status === 'In Progress'
            ? 'Completed'
            : 'Pending';
        return { ...a, status: nextStatus };
      })
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const review: PostIncidentReview = {
        completed: true,
        completedAt: new Date().toISOString(),
        conductedBy: conductedBy || 'CSIRT Review Board',
        whatHappened,
        howDetected,
        rootCause,
        whatWorkedWell,
        whatWentWrong,
        businessImpactSummary,
        delayedActions,
        improvementsNeeded,
        preventiveMeasures,
        keyLessonsLearned,
        actionItems,
      };
      await onSaveReview(incidentId, review);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              Post-Incident Review & Lessons Learned
            </h3>
            {initialReview?.completed && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Completed
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Conduct a blameless post-mortem, determine root cause, identify delayed response actions, and assign preventive remediations
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-950/50 transition-all shrink-0 self-start sm:self-center disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Review'}</span>
        </button>
      </div>

      {/* Reviewer metadata */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
        <label className="block text-xs font-medium text-slate-300">
          Review Facilitators / Participants
        </label>
        <input
          type="text"
          value={conductedBy}
          onChange={(e) => setConductedBy(e.target.value)}
          placeholder="e.g. Lead Analyst Sarah Chen, Infrastructure Manager David, DevSecOps Kevin"
          className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* 10 Core Questions */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
          Structured 10-Point Incident Debrief
        </h4>

        {/* 1. What Happened */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            1. What happened? (Chronological Summary)
          </label>
          <textarea
            rows={3}
            value={whatHappened}
            onChange={(e) => setWhatHappened(e.target.value)}
            placeholder="Summarize the chronological chain of events from adversary entry to containment..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 2. How Detected */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            2. How was the incident detected?
          </label>
          <textarea
            rows={2}
            value={howDetected}
            onChange={(e) => setHowDetected(e.target.value)}
            placeholder="EDR alert, SIEM correlation rule, external user report, cloud audit scanner..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 3. Root Cause */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            3. What was the confirmed root cause?
          </label>
          <textarea
            rows={2}
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            placeholder="Unpatched CVE, credential stuffing, lack of MFA on legacy protocol, misconfigured cloud ACL..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 4 & 5. What worked well vs What went wrong */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-400">
              4. What worked well? (Successes)
            </label>
            <textarea
              rows={3}
              value={whatWorkedWell}
              onChange={(e) => setWhatWorkedWell(e.target.value)}
              placeholder="Fast host isolation, automated alerts, clear communication between teams..."
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-rose-400">
              5. What went wrong? (Failures & Gaps)
            </label>
            <textarea
              rows={3}
              value={whatWentWrong}
              onChange={(e) => setWhatWentWrong(e.target.value)}
              placeholder="Delayed notification, missing logs on perimeter device, lack of out-of-band contacts..."
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* 6. True Business Impact */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            6. What was the true business impact?
          </label>
          <textarea
            rows={2}
            value={businessImpactSummary}
            onChange={(e) => setBusinessImpactSummary(e.target.value)}
            placeholder="Downtime duration, financial cost estimate, customer records compromised, SLA penalties..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 7. Delayed Actions */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            7. Which response actions were delayed and why?
          </label>
          <textarea
            rows={2}
            value={delayedActions}
            onChange={(e) => setDelayedActions(e.target.value)}
            placeholder="Password reset delayed due to missing directory permissions, firewall change waited for change approval..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 8. Process Improvements */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            8. What should be improved in the response process?
          </label>
          <textarea
            rows={2}
            value={improvementsNeeded}
            onChange={(e) => setImprovementsNeeded(e.target.value)}
            placeholder="Update playbook with explicit escalation contacts, automate token revocation..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 9. Preventive Measures */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            9. What technical preventive measures must be implemented?
          </label>
          <textarea
            rows={2}
            value={preventiveMeasures}
            onChange={(e) => setPreventiveMeasures(e.target.value)}
            placeholder="Enforce FIDO2 phishing-resistant keys, isolate backup subnets, enable continuous IaC scanning..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 10. Key Lessons Retained */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            10. What core lessons should the team retain?
          </label>
          <textarea
            rows={2}
            value={keyLessonsLearned}
            onChange={(e) => setKeyLessonsLearned(e.target.value)}
            placeholder="Key operational insights for future incident responders..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Follow-up Action Items Manager */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Corrective Action Items ({actionItems.length})
            </h4>
            <p className="text-xs text-slate-400">
              Assign owners, deadlines, and priorities for remediation tasks. Unresolved items display on the dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingAction(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Action</span>
          </button>
        </div>

        {/* New Action Inline Form */}
        {isAddingAction && (
          <div className="p-4 rounded-lg bg-slate-950 border border-cyan-500/30 space-y-3 animate-in fade-in duration-150">
            <h5 className="text-xs font-semibold text-slate-200">
              New Corrective Action Item
            </h5>
            <input
              type="text"
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              placeholder="Task Title (e.g. Implement AWS Organization SCP for S3 Block Public Access)"
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newActionOwner}
                onChange={(e) => setNewActionOwner(e.target.value)}
                placeholder="Assignee (e.g. Maya Patel)"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={newActionPriority}
                onChange={(e) =>
                  setNewActionPriority(e.target.value as 'Critical' | 'High' | 'Medium' | 'Low')
                }
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="Critical">Critical Priority</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <input
                type="date"
                value={newActionDate}
                onChange={(e) => setNewActionDate(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingAction(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddActionItem}
                className="px-3 py-1 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded"
              >
                Add Item
              </button>
            </div>
          </div>
        )}

        {/* Existing Actions List */}
        <div className="divide-y divide-slate-800/80">
          {actionItems.map((act) => (
            <div
              key={act.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(act.id)}
                  title={`Status: ${act.status} (Click to toggle)`}
                  className="mt-0.5 text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  {act.status === 'Completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : act.status === 'In Progress' ? (
                    <Clock className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-400" />
                  )}
                </button>
                <div>
                  <p
                    className={`text-xs font-medium ${
                      act.status === 'Completed'
                        ? 'text-slate-500 line-through'
                        : 'text-slate-200'
                    }`}
                  >
                    {act.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-cyan-400">
                      {act.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {act.owner}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      Target: {act.targetDate}
                    </span>
                    <PriorityBadge priority={act.priority} />
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        act.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : act.status === 'In Progress'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteActionItem(act.id)}
                className="p-1.5 rounded text-slate-500 hover:text-rose-400 transition-colors self-start sm:self-center"
                title="Remove action item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {actionItems.length === 0 && (
            <p className="text-xs text-slate-500 py-4 text-center">
              No follow-up action items created yet. Add preventive engineering tasks above.
            </p>
          )}
        </div>
      </div>
    </form>
  );
};
