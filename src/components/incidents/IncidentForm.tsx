import React, { useState } from 'react'
import type { Incident, SeverityLevel, IncidentStatus, IncidentCategory, SeverityFactors } from '../../types/incident'
import { INCIDENT_CATEGORIES } from '../../constants/categories'
import { PLAYBOOK_TEMPLATES } from '../../constants/playbooks'
import { validateIncidentInput } from '../../services/validation'
import { Modal } from '../common/Modal'
import { SeverityCalculatorModal } from './SeverityCalculatorModal'
import { Calculator, Plus, Save, Tag } from 'lucide-react'

export interface IncidentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Incident>) => Promise<void>;
  initialData?: Incident | null;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({
  isOpen,
  onClose,
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
  const [type, setType] = useState<IncidentCategory>(initialData?.type || 'Phishing');
  const [description, setDescription] = useState(initialData?.description || '');
  const [severity, setSeverity] = useState<SeverityLevel>(initialData?.severity || 'Medium');
  const [status, setStatus] = useState<IncidentStatus>(initialData?.status || 'New');
  const [detectedAt, setDetectedAt] = useState(formatForInput(initialData?.detectedAt));
  const [reportedAt, setReportedAt] = useState(formatForInput(initialData?.reportedAt));
  const [affectedSystemsInput, setAffectedSystemsInput] = useState(
    initialData?.affectedSystems?.join(', ') || ''
  );
  const [suspectedAttackVector, setSuspectedAttackVector] = useState(
    initialData?.suspectedAttackVector || ''
  );
  const [impactAssessment, setImpactAssessment] = useState(
    initialData?.impactAssessment || ''
  );
  const [assignedResponder, setAssignedResponder] = useState(
    initialData?.assignedResponder || ''
  );
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  const [responseNotes, setResponseNotes] = useState(initialData?.responseNotes || '');
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>(
    initialData?.playbook?.templateId || ''
  );

  const [severityFactors, setSeverityFactors] = useState<SeverityFactors | undefined>(
    initialData?.severityAssessment?.factors
  );
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSeverityApplied = (
    factors: SeverityFactors,
    newSeverity: SeverityLevel,
    rationale: string[]
  ) => {
    setSeverity(newSeverity);
    setSeverityFactors(factors);
    if (!responseNotes.includes('Severity Assessment:')) {
      const rationaleText = `[Severity Assessment: ${newSeverity}] ${rationale.join(' ')}`;
      setResponseNotes((prev) => (prev ? `${prev}\n\n${rationaleText}` : rationaleText));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const affectedSystems = affectedSystemsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Partial<Incident> = {
      title,
      type,
      description,
      severity,
      status,
      detectedAt: detectedAt ? new Date(detectedAt).toISOString() : new Date().toISOString(),
      reportedAt: reportedAt ? new Date(reportedAt).toISOString() : new Date().toISOString(),
      affectedSystems,
      suspectedAttackVector,
      impactAssessment,
      assignedResponder: assignedResponder || 'Unassigned',
      tags,
      responseNotes,
    };

    if (severityFactors) {
      payload.severityAssessment = {
        factors: severityFactors,
        result: {
          score: 50,
          suggestedSeverity: severity,
          breakdown: {
            businessImpactPoints: 0,
            affectedScopePoints: 0,
            dataSensitivityPoints: 0,
            serviceAvailabilityPoints: 0,
            activeMaliciousActivityPoints: 0,
            spreadPotentialPoints: 0,
          },
          rationale: [],
        },
        manuallyOverridden: false,
      };
    }

    if (!isEditing && selectedPlaybookId) {
      payload.playbook = {
        id: '',
        templateId: selectedPlaybookId,
        title: '',
        description: '',
        category: type,
        stages: [],
      };
    }

    const validation = validateIncidentInput(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      if (isEditing && initialData) {
        await onSubmit({
          ...initialData,
          ...payload,
        });
      } else {
        await onSubmit(payload);
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? `Edit Incident: ${initialData?.id}` : 'Create New Security Incident'}
        subtitle="Log security events, triage initial scope, and initiate incident response workflows"
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Basic Identification */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              1. Incident Details & Classification
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Incident Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. LockBit Ransomware Outbreak on Finance NAS"
                className={`w-full text-sm bg-slate-950 border rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${
                  errors.title ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-500'
                }`}
              />
              {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Incident Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as IncidentCategory)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {INCIDENT_CATEGORIES.map((cat) => (
                    <option key={cat.category} value={cat.category}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Severity <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCalculatorOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Calculate</span>
                  </button>
                </div>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Status <span className="text-rose-400">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="New">New</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Contained">Contained</option>
                  <option value="Recovering">Recovering</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Incident Description & Context
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe observed symptoms, initial alerts, affected business units, and circumstances..."
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Section: Timestamps & Assignment */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              2. Timeline Dates & Scope
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Detected Date/Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={detectedAt}
                  onChange={(e) => setDetectedAt(e.target.value)}
                  className={`w-full text-xs bg-slate-950 border rounded-lg p-2 text-slate-200 focus:outline-none ${
                    errors.detectedAt ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-500'
                  }`}
                />
                {errors.detectedAt && <p className="text-xs text-rose-400 mt-1">{errors.detectedAt}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reported Date/Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={reportedAt}
                  onChange={(e) => setReportedAt(e.target.value)}
                  className={`w-full text-xs bg-slate-950 border rounded-lg p-2 text-slate-200 focus:outline-none ${
                    errors.reportedAt ? 'border-rose-500' : 'border-slate-700 focus:border-cyan-500'
                  }`}
                />
                {errors.reportedAt && <p className="text-xs text-rose-400 mt-1">{errors.reportedAt}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assigned Responder / Team
                </label>
                <input
                  type="text"
                  value={assignedResponder}
                  onChange={(e) => setAssignedResponder(e.target.value)}
                  placeholder="e.g. Sarah Chen (Lead CSIRT)"
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Affected Systems or Assets (Comma-separated)
                </label>
                <input
                  type="text"
                  value={affectedSystemsInput}
                  onChange={(e) => setAffectedSystemsInput(e.target.value)}
                  placeholder="srv-ad01.corp, 10.10.4.15, cfo-mailbox@corp.com"
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Suspected Attack Vector
                </label>
                <input
                  type="text"
                  value={suspectedAttackVector}
                  onChange={(e) => setSuspectedAttackVector(e.target.value)}
                  placeholder="Spearphishing macro attachment, RDP brute-force..."
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Impact Assessment
              </label>
              <textarea
                rows={2}
                value={impactAssessment}
                onChange={(e) => setImpactAssessment(e.target.value)}
                placeholder="Quantify data loss, business downtime, affected users or regulatory notification risks..."
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Section: Response Notes & Playbook */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              3. Response Playbook & Response Notes
            </h3>

            {!isEditing && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Attach Initial Response Playbook (Optional)
                </label>
                <select
                  value={selectedPlaybookId}
                  onChange={(e) => setSelectedPlaybookId(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- No Playbook (Can attach later) --</option>
                  {PLAYBOOK_TEMPLATES.map((pb) => (
                    <option key={pb.id} value={pb.id}>
                      {pb.title} ({pb.category})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Loads NIST/SANS 6-stage response checklist with recommended defensive tasks.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Incident Tags (Comma-separated)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ransomware, Finance, EntraID, Containment"
                  className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Response Notes & Analyst Observations
              </label>
              <textarea
                rows={3}
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                placeholder="Log internal containment actions, firewall changes, ticket numbers, communications..."
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isEditing ? 'Save Changes' : 'Create Incident'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Embedded Severity Assessment Tool Modal */}
      {isCalculatorOpen && (
        <SeverityCalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
          initialFactors={severityFactors}
          onApply={handleSeverityApplied}
        />
      )}
    </>
  );
};
