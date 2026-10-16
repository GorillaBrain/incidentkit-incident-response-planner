import React, { useState } from 'react'
import type { EvidenceRecord, EvidenceType } from '../../types/incident'
import { Modal } from '../common/Modal'
import { Plus, Save, Hash } from 'lucide-react'
import { isValidSha256 } from '../../services/crypto'

export interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<EvidenceRecord, 'id' | 'incidentId' | 'recordedAt'>) => Promise<void>;
  initialData?: EvidenceRecord | null;
}

const EVIDENCE_TYPES: EvidenceType[] = [
  'System logs',
  'Network logs',
  'Screenshots',
  'Email headers',
  'File hashes',
  'Endpoint alerts',
  'User reports',
  'Other',
];

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
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

  const [evidenceType, setEvidenceType] = useState<EvidenceType>(
    initialData?.evidenceType || 'System logs'
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [sourceSystem, setSourceSystem] = useState(initialData?.sourceSystem || '');
  const [collectedAt, setCollectedAt] = useState(formatForInput(initialData?.collectedAt));
  const [collectorName, setCollectorName] = useState(initialData?.collectorName || '');
  const [fileOrRefName, setFileOrRefName] = useState(initialData?.fileOrRefName || '');
  const [sha256Hash, setSha256Hash] = useState(initialData?.sha256Hash || '');
  const [storageLocation, setStorageLocation] = useState(initialData?.storageLocation || '');
  const [chainOfCustodyNotes, setChainOfCustodyNotes] = useState(
    initialData?.chainOfCustodyNotes || ''
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Evidence description is required.');
      return;
    }
    if (!sourceSystem.trim()) {
      setError('Source system or host is required.');
      return;
    }
    if (!collectorName.trim()) {
      setError('Collector name is required.');
      return;
    }
    if (sha256Hash.trim() && !isValidSha256(sha256Hash.trim())) {
      setError('SHA-256 hash must be a 64-character hexadecimal string.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        evidenceType,
        description: description.trim(),
        sourceSystem: sourceSystem.trim(),
        collectedAt: collectedAt ? new Date(collectedAt).toISOString() : new Date().toISOString(),
        collectorName: collectorName.trim(),
        fileOrRefName: fileOrRefName.trim() || 'N/A',
        sha256Hash: sha256Hash.trim() || undefined,
        storageLocation: storageLocation.trim() || 'Local Evidence Store',
        chainOfCustodyNotes: chainOfCustodyNotes.trim(),
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
      title={isEditing ? `Edit Evidence: ${initialData?.id}` : 'Record New Incident Evidence'}
      subtitle="Document forensic artifact provenance, cryptographic integrity hash, and chain-of-custody"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Evidence Type <span className="text-rose-400">*</span>
            </label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {EVIDENCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              File Name or Evidence Reference <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={fileOrRefName}
              onChange={(e) => setFileOrRefName(e.target.value)}
              placeholder="e.g. auth_audit_20261015.log or ticket #SEC-409"
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Description of Evidence <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what this evidence shows (e.g. Inbound brute force attempts from anomalous ASN)..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Source System / Host <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={sourceSystem}
              onChange={(e) => setSourceSystem(e.target.value)}
              placeholder="e.g. srv-dc01.corp or 10.0.1.5"
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Collector Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
              placeholder="e.g. Sarah Chen"
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Collection Date/Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={collectedAt}
              onChange={(e) => setCollectedAt(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              SHA-256 Hash (Optional, 64 Hex Chars)
            </label>
            <div className="relative">
              <input
                type="text"
                value={sha256Hash}
                onChange={(e) => setSha256Hash(e.target.value)}
                placeholder="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                className="w-full text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-2 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Hash className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Storage Location or Reference
            </label>
            <input
              type="text"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              placeholder="e.g. Secure NAS /cases/2026/INC-001/evidence/"
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Chain-of-Custody & Handling Notes
          </label>
          <textarea
            rows={2}
            value={chainOfCustodyNotes}
            onChange={(e) => setChainOfCustodyNotes(e.target.value)}
            placeholder="Document transfer details, write-blocker usage, storage safe combinations, or custody transfers..."
            className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

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
            <span>{isEditing ? 'Save Evidence' : 'Record Evidence'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
