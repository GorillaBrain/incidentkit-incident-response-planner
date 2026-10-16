import React, { useState } from 'react'
import type { EvidenceRecord } from '../../types/incident'
import { FileHasher } from './FileHasher'
import { EvidenceModal } from './EvidenceModal'
import {
  ShieldAlert,
  Plus,
  Hash,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Server,
} from 'lucide-react'

export interface EvidenceRegisterProps {
  incidentId: string;
  evidence: EvidenceRecord[];
  onAddEvidence: (
    incidentId: string,
    data: Omit<EvidenceRecord, 'id' | 'incidentId' | 'recordedAt'>
  ) => Promise<void>;
  onDeleteEvidence: (incidentId: string, evidenceId: string) => Promise<void>;
}

export const EvidenceRegister: React.FC<EvidenceRegisterProps> = ({
  incidentId,
  evidence,
  onAddEvidence,
  onDeleteEvidence,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledHash, setPrefilledHash] = useState<{ hash: string; fileName: string } | null>(
    null
  );
  const [expandedCustodyIds, setExpandedCustodyIds] = useState<Record<string, boolean>>({});
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  const handleCopyHash = (e: React.MouseEvent, id: string, hash: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleHashGenerated = (hash: string, fileName: string) => {
    setPrefilledHash({ hash, fileName });
    setIsModalOpen(true);
  };

  const toggleCustody = (id: string) => {
    setExpandedCustodyIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Forensic Evidence Register</h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {evidence.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Catalog digital artifacts, system logs, memory dumps, email headers, and file hashes with chain-of-custody tracking
          </p>
        </div>

        <button
          onClick={() => {
            setPrefilledHash(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-950/50 transition-all shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Record Evidence</span>
        </button>
      </div>

      {/* In-Browser File Hasher Utility */}
      <FileHasher onHashGenerated={handleHashGenerated} />

      {/* Evidence Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Logged Evidence Artifacts
        </h4>

        {evidence.length > 0 ? (
          <div className="divide-y divide-slate-800/80">
            {evidence.map((evd) => {
              const isCustodyOpen = expandedCustodyIds[evd.id] ?? false;

              return (
                <div key={evd.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          {evd.id}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {evd.evidenceType}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">
                          {evd.fileOrRefName}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {evd.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Server className="w-3 h-3 text-slate-500" />
                          Source: <strong className="text-slate-300 font-mono">{evd.sourceSystem}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          Collector: <strong className="text-slate-300">{evd.collectorName}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Collected: {new Date(evd.collectedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start">
                      <button
                        onClick={() =>
                          onDeleteEvidence(incidentId, evd.id)
                        }
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete evidence record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cryptographic Hash Bar */}
                  {evd.sha256Hash && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Hash className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          SHA-256:
                        </span>
                        <span className="text-xs font-mono text-cyan-300 truncate select-all">
                          {evd.sha256Hash}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleCopyHash(e, evd.id, evd.sha256Hash!)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
                      >
                        {copiedHashId === evd.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Chain of Custody & Storage Location Dropdown */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleCustody(evd.id)}
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                    >
                      {isCustodyOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      <span>Chain-of-Custody & Storage Location</span>
                    </button>

                    {isCustodyOpen && (
                      <div className="mt-2 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
                        <div>
                          <span className="text-slate-400 font-medium">Physical/Logical Location: </span>
                          <span className="font-mono text-slate-200">{evd.storageLocation}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Custody History & Notes: </span>
                          <p className="text-slate-300 mt-0.5 leading-relaxed">
                            {evd.chainOfCustodyNotes || 'No additional custody notes recorded.'}
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Recorded in IncidentKit: {new Date(evd.recordedAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No evidence records documented for this incident yet.
          </div>
        )}
      </div>

      {/* Warning Notice */}
      <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-xs text-rose-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-rose-300">Forensic Integrity Warning:</p>
          <p className="leading-relaxed text-slate-300">
            Evidence records stored in the browser are not tamper-proof and do not replace legal or enterprise-grade digital forensics management systems (e.g. EnCase, FTK). Never input sensitive proprietary source code, live passwords, or classified evidentiary materials into an unapproved browser environment.
          </p>
        </div>
      </div>

      {/* Evidence Modal */}
      {isModalOpen && (
        <EvidenceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={
            prefilledHash
              ? {
                  id: '',
                  incidentId,
                  evidenceType: 'File hashes',
                  description: `Integrity hash for file ${prefilledHash.fileName}`,
                  sourceSystem: 'Local Host',
                  collectedAt: new Date().toISOString(),
                  collectorName: 'Security Analyst',
                  fileOrRefName: prefilledHash.fileName,
                  sha256Hash: prefilledHash.hash,
                  storageLocation: 'Local Device',
                  chainOfCustodyNotes: 'Computed locally in browser via Web Crypto API.',
                  recordedAt: new Date().toISOString(),
                }
              : null
          }
          onSubmit={async (data) => {
            await onAddEvidence(incidentId, data);
          }}
        />
      )}
    </div>
  );
};
