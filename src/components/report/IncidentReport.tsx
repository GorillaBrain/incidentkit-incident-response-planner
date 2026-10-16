import React from 'react'
import type { Incident } from '../../types/incident'
import { SeverityBadge, StatusBadge } from '../common/Badge'
import {
  Printer,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  HelpCircle,
} from 'lucide-react'

export interface IncidentReportProps {
  incident: Incident;
  onExportJson?: () => void;
}

export const IncidentReport: React.FC<IncidentReportProps> = ({
  incident,
  onExportJson,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Analyze Playbook tasks
  const completedTasks: string[] = [];
  const openTasks: string[] = [];

  if (incident.playbook) {
    incident.playbook.stages.forEach((stage) => {
      stage.tasks.forEach((task) => {
        if (task.completed) {
          completedTasks.push(`${stage.name}: ${task.title}`);
        } else {
          openTasks.push(`${stage.name}: ${task.title} [${task.priority}]`);
        }
      });
    });
  }

  const pir = incident.postIncidentReview;

  return (
    <div className="space-y-6">
      {/* Action Header (Hidden during print) */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Executive & Technical Incident Summary Report</span>
          </h3>
          <p className="text-xs text-slate-400">
            Formal documentation package ready for executive briefing, legal counsel, or PDF archiving
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-950/50 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
          {onExportJson && (
            <button
              onClick={onExportJson}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Record (JSON)</span>
            </button>
          )}
        </div>
      </div>

      {/* Formal Printable Document Container */}
      <div className="print-container p-8 sm:p-10 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl space-y-8 text-slate-100">
        {/* Document Header */}
        <div className="border-b-2 border-slate-700 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase font-bold tracking-wider">
                CSIRT Formal Incident Report
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Generated: {new Date().toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {incident.title}
            </h1>
            <p className="text-xs text-slate-300 font-mono">
              Incident Reference: <strong className="text-cyan-400">{incident.id}</strong> | Category: <strong>{incident.type}</strong>
            </p>
          </div>

          <div className="flex sm:flex-col items-end gap-2 shrink-0">
            <SeverityBadge severity={incident.severity} size="lg" />
            <StatusBadge status={incident.status} />
          </div>
        </div>

        {/* Executive Summary & Classification Table */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1.5">
            1. Incident Overview & Classification
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
              <div>
                <span className="text-slate-400 font-medium">Detection Time:</span>
                <p className="font-mono text-slate-200 mt-0.5">
                  {new Date(incident.detectedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Reporting Time:</span>
                <p className="font-mono text-slate-200 mt-0.5">
                  {new Date(incident.reportedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Lead Incident Responder:</span>
                <p className="text-slate-200 mt-0.5 font-semibold">
                  {incident.assignedResponder || 'Unassigned'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
              <div>
                <span className="text-slate-400 font-medium">Affected Systems / Assets:</span>
                <p className="font-mono text-slate-200 mt-0.5">
                  {incident.affectedSystems.length > 0
                    ? incident.affectedSystems.join(', ')
                    : 'None specified / Under active scoping'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Suspected Attack Vector:</span>
                <p className="text-slate-200 mt-0.5">
                  {incident.suspectedAttackVector || 'Unconfirmed / Investigation Ongoing'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Incident Tags:</span>
                <p className="text-cyan-300 mt-0.5">
                  {incident.tags.length > 0 ? `#${incident.tags.join(' #')}` : 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Incident Description & Scope:
            </span>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
              {incident.description || 'No description recorded.'}
            </p>
          </div>

          {/* Impact Assessment */}
          <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Business & Technical Impact Assessment:
            </span>
            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
              {incident.impactAssessment || 'Impact assessment pending completed scoping.'}
            </p>
          </div>
        </div>

        {/* Response Actions & Playbook Execution */}
        <div className="space-y-4 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1.5">
            2. Response Actions & Playbook Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Completed Tasks */}
            <div className="p-4 rounded-lg bg-slate-950/70 border border-emerald-500/20 space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Completed Response Actions ({completedTasks.length})
              </span>
              {completedTasks.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {completedTasks.map((t, idx) => (
                    <li key={idx} className="line-clamp-2">
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 italic">No playbook tasks completed yet.</p>
              )}
            </div>

            {/* Outstanding Tasks */}
            <div className="p-4 rounded-lg bg-slate-950/70 border border-amber-500/20 space-y-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Outstanding Action Items ({openTasks.length})
              </span>
              {openTasks.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {openTasks.map((t, idx) => (
                    <li key={idx} className="line-clamp-2">
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-emerald-400/90 font-medium">All playbook tasks completed!</p>
              )}
            </div>
          </div>
        </div>

        {/* Evidence Register Table */}
        <div className="space-y-4 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1.5">
            3. Forensic Evidence Register
          </h2>

          {incident.evidence && incident.evidence.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 border-b border-slate-800">ID</th>
                    <th className="p-2.5 border-b border-slate-800">Type</th>
                    <th className="p-2.5 border-b border-slate-800">Artifact / Reference</th>
                    <th className="p-2.5 border-b border-slate-800">Source Host</th>
                    <th className="p-2.5 border-b border-slate-800">SHA-256 Hash</th>
                    <th className="p-2.5 border-b border-slate-800">Collector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {incident.evidence.map((evd) => (
                    <tr key={evd.id}>
                      <td className="p-2.5 font-mono text-cyan-400">{evd.id}</td>
                      <td className="p-2.5">{evd.evidenceType}</td>
                      <td className="p-2.5 font-medium text-slate-200">{evd.fileOrRefName}</td>
                      <td className="p-2.5 font-mono text-slate-300">{evd.sourceSystem}</td>
                      <td className="p-2.5 font-mono text-[11px] text-cyan-300 truncate max-w-[150px]">
                        {evd.sha256Hash || 'N/A'}
                      </td>
                      <td className="p-2.5">{evd.collectorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 rounded bg-slate-950/50 border border-slate-800">
              No evidence artifacts logged in register.
            </p>
          )}
        </div>

        {/* Chronological Incident Timeline */}
        <div className="space-y-4 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1.5">
            4. Incident Timeline & Milestones
          </h2>

          {incident.timeline && incident.timeline.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5 border-b border-slate-800">Event Time</th>
                    <th className="p-2.5 border-b border-slate-800">Phase</th>
                    <th className="p-2.5 border-b border-slate-800">Milestone Title</th>
                    <th className="p-2.5 border-b border-slate-800">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {incident.timeline.map((evt) => (
                    <tr key={evt.id}>
                      <td className="p-2.5 font-mono text-slate-300 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2.5 font-semibold text-cyan-400">{evt.category}</td>
                      <td className="p-2.5 font-medium text-slate-100">{evt.title}</td>
                      <td className="p-2.5 text-slate-300">{evt.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 rounded bg-slate-950/50 border border-slate-800">
              No timeline events recorded.
            </p>
          )}
        </div>

        {/* Root Cause & Post-Incident Review Findings */}
        <div className="space-y-4 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-1.5">
            5. Root Cause & Post-Incident Review Findings
          </h2>

          {pir && pir.completed ? (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-400">Confirmed Root Cause:</span>
                <p className="text-slate-200 mt-1">{pir.rootCause}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-slate-400">What Worked Well:</span>
                  <p className="text-slate-200 mt-1">{pir.whatWorkedWell}</p>
                </div>
                <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-slate-400">Gaps & Delayed Actions:</span>
                  <p className="text-slate-200 mt-1">{pir.whatWentWrong || pir.delayedActions}</p>
                </div>
              </div>

              <div className="p-3.5 rounded bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-400">Preventive Measures & Hardening:</span>
                <p className="text-slate-200 mt-1">{pir.preventiveMeasures}</p>
              </div>

              {pir.actionItems && pir.actionItems.length > 0 && (
                <div className="p-3.5 rounded bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-semibold text-slate-400">Assigned Follow-Up Actions:</span>
                  <div className="space-y-1.5">
                    {pir.actionItems.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between text-slate-300 p-2 rounded bg-slate-900 border border-slate-800"
                      >
                        <div>
                          <strong>{act.title}</strong> (Owner: {act.owner || 'Unassigned'}, Due: {act.targetDate || 'TBD'})
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            act.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {act.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong>Post-Incident Review Pending:</strong> Formal review has not yet been finalized for this incident file. Root cause and lessons learned will be recorded upon containment and resolution.
              </span>
            </div>
          )}
        </div>

        {/* Report Footer & Attestation */}
        <div className="pt-6 border-t-2 border-slate-700 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-300">Computer Security Incident Response Team (CSIRT)</p>
            <p className="text-[11px] text-slate-500">IncidentKit Decision Support Documentation Platform</p>
          </div>
          <div className="text-right text-[11px] text-slate-500 font-mono">
            Document Sign-off: _________________________
          </div>
        </div>
      </div>
    </div>
  );
};
