import React from 'react'
import { Modal } from '../common/Modal'
import { useIncidentContext } from '../../context/IncidentContext'
import {
  ShieldCheck,
  Database,
  Lock,
  Download,
  Trash2,
  AlertTriangle,
  Info,
  ServerOff,
} from 'lucide-react'

export interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const { storageInfo, exportAll, clearAllData, showToast } = useIncidentContext();

  const handleExport = async () => {
    try {
      const json = await exportAll();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidentkit-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Local backup exported.', 'success');
    } catch {
      showToast('Export failed.', 'error');
    }
  };

  const handlePurge = async () => {
    if (
      window.confirm(
        'Warning: This will permanently delete all incidents, evidence metadata, timelines, and playbooks stored in your browser. This action cannot be undone. Continue?'
      )
    ) {
      await clearAllData();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Architecture, Privacy & Local Storage Disclosure"
      subtitle="How IncidentKit stores your data, protects your privacy, and handles security records"
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs text-slate-300">
        {/* Core Guarantee Card */}
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">
              100% Offline-First Client-Side Architecture
            </h4>
            <p className="leading-relaxed text-slate-300">
              IncidentKit runs completely inside your browser. No backend server, cloud database, or remote telemetry endpoint is involved. Zero bytes of your incident notes, hostnames, IP addresses, or file hashes are ever transmitted across the internet.
            </p>
          </div>
        </div>

        {/* Current Storage Engine Status */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Active Browser Storage Engine</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Primary Engine:</span>
              <span className="font-mono text-cyan-300 font-bold text-sm mt-0.5 block">
                {storageInfo.engine}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Persistence Status:</span>
              <span className="font-mono text-emerald-400 font-bold text-sm mt-0.5 block">
                {storageInfo.isPersisted ? 'Persistent' : 'Session Memory'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Stored Incident Records:</span>
              <span className="font-mono text-white font-bold text-sm mt-0.5 block">
                {storageInfo.count} Records
              </span>
            </div>
          </div>
        </div>

        {/* Technical Boundaries & Limitations */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            System Limitations & Resiliency Facts
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Browser Cache Clearing Risk
              </span>
              <p className="text-slate-400 leading-relaxed">
                If you clear your browser cookies, site storage, or website data, all locally stored incidents will be permanently deleted. Export JSON backups regularly to safeguard your work.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ServerOff className="w-4 h-4 text-cyan-400" />
                No Multi-User Cloud Sync
              </span>
              <p className="text-slate-400 leading-relaxed">
                IncidentKit does not support multi-tenant real-time collaboration. Data exists only on the specific browser profile and computer on which it was created.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                Zero External Network Calls
              </span>
              <p className="text-slate-400 leading-relaxed">
                No Google Analytics, no tracking pixels, no advertising networks, and no external AI models are loaded or invoked.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/40 space-y-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-400" />
                Evidence Preservation Rules
              </span>
              <p className="text-slate-400 leading-relaxed">
                Evidence files are never uploaded. Hashes are calculated purely in-memory via the browser Web Crypto API without writing copies to remote storage.
              </p>
            </div>
          </div>
        </div>

        {/* Data Maintenance Controls */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div>
            <span className="font-semibold text-slate-200 block">
              Backup & Data Life Cycle Actions
            </span>
            <span className="text-slate-500 text-[11px]">
              Export full backup or permanently purge local records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON Backup</span>
            </button>
            <button
              onClick={handlePurge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All Records</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
