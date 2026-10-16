import React, { useState } from 'react'
import type { Incident, IncidentStatus } from '../../types/incident'
import { useIncidentContext, type IncidentDetailTab } from '../../context/IncidentContext'
import { SeverityBadge, StatusBadge } from '../common/Badge'
import { StatusTransitionModal } from './StatusTransitionModal'
import { PlaybookView } from '../playbooks/PlaybookView'
import { PlaybookCatalog } from '../playbooks/PlaybookCatalog'
import { EvidenceRegister } from '../evidence/EvidenceRegister'
import { IncidentTimeline } from '../timeline/IncidentTimeline'
import { IncidentReport } from '../report/IncidentReport'
import { PostIncidentReviewForm } from '../review/PostIncidentReviewForm'
import {
  ArrowLeft,
  Edit,
  Download,
  Trash2,
  Sparkles,
  BookOpen,
  FileCheck2,
  Clock,
  Printer,
  FileText,
  Activity,
  Server,
  Crosshair,
  User,
} from 'lucide-react'

export interface IncidentDetailProps {
  incident: Incident;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ incident }) => {
  const {
    selectIncident,
    incidentDetailTab,
    setIncidentDetailTab,
    setEditingIncident,
    setIsCreateModalOpen,
    deleteIncident,
    exportSingle,
    updateIncident,
    attachPlaybook,
    togglePlaybookTask,
    addEvidence,
    deleteEvidence,
    addTimelineEvent,
    deleteTimelineEvent,
    updatePostIncidentReview,
    showToast,
  } = useIncidentContext();

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSwitchingPlaybook, setIsSwitchingPlaybook] = useState(false);

  const handleUpdateStatus = async (newStatus: IncidentStatus, transitionNote: string) => {
    const updated: Incident = {
      ...incident,
      status: newStatus,
      timeline: [
        ...incident.timeline,
        {
          id: `EVT-${Date.now().toString().slice(-4)}`,
          incidentId: incident.id,
          timestamp: new Date().toISOString(),
          enteredAt: new Date().toISOString(),
          title: `Status Transition: ${incident.status} -> ${newStatus}`,
          description: transitionNote || `Incident status updated to ${newStatus}.`,
          category:
            newStatus === 'Contained'
              ? 'Containment'
              : newStatus === 'Resolved' || newStatus === 'Closed'
              ? 'Resolution'
              : 'Triage',
        },
      ],
      responseNotes: transitionNote
        ? `${incident.responseNotes}\n[${new Date().toLocaleDateString()}] ${transitionNote}`.trim()
        : incident.responseNotes,
    };
    await updateIncident(updated);
    showToast(`Status updated to ${newStatus}.`, 'success');
  };

  const handleExportJson = async () => {
    try {
      const json = await exportSingle(incident.id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incident-${incident.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${incident.id} JSON.`, 'success');
    } catch {
      showToast('Failed to export incident.', 'error');
    }
  };

  const tabs: { id: IncidentDetailTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    {
      id: 'playbook',
      label: 'Playbook',
      icon: <BookOpen className="w-4 h-4" />,
      badge: incident.playbook ? `${incident.playbook.stages.reduce((acc, s) => acc + s.tasks.filter(t => t.completed).length, 0)}/${incident.playbook.stages.reduce((acc, s) => acc + s.tasks.length, 0)}` : undefined,
    },
    {
      id: 'evidence',
      label: 'Evidence Register',
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: incident.evidence.length > 0 ? incident.evidence.length : undefined,
    },
    {
      id: 'timeline',
      label: 'Chronology Timeline',
      icon: <Clock className="w-4 h-4" />,
      badge: incident.timeline.length > 0 ? incident.timeline.length : undefined,
    },
    { id: 'report', label: 'Incident Report', icon: <Printer className="w-4 h-4" /> },
    {
      id: 'review',
      label: 'Post-Incident Review',
      icon: <FileText className="w-4 h-4" />,
      badge: incident.postIncidentReview?.completed ? 'Done' : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation & Summary */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => selectIncident(null)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Back to incident list"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {incident.id}
                </span>
                <SeverityBadge severity={incident.severity} />
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  className="group cursor-pointer focus:outline-none"
                  title="Click to transition status"
                >
                  <StatusBadge status={incident.status} />
                </button>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {incident.type}
                </span>
                {incident.isDemo && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    <Sparkles className="w-2.5 h-2.5" />
                    Synthetic Demo
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">
                {incident.title}
              </h2>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Transition Status
            </button>
            <button
              onClick={() => {
                setEditingIncident(incident);
                setIsCreateModalOpen(true);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Edit incident details"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportJson}
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title="Export as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={async () => {
                if (window.confirm(`Delete incident ${incident.id}?`)) {
                  await deleteIncident(incident.id);
                }
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Delete incident"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-800/80 no-print">
          {tabs.map((tab) => {
            const isActive = incidentDetailTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setIsSwitchingPlaybook(false);
                  setIncidentDetailTab(tab.id);
                }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtab 1: Overview */}
      {incidentDetailTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols: Details & Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Incident Description & Narrative
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {incident.description || 'No description provided.'}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Business & Technical Impact Assessment
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {incident.impactAssessment || 'Impact assessment pending completed scoping.'}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Response Notes & Internal Log
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap text-xs bg-slate-950 p-4 rounded-lg border border-slate-800">
                {incident.responseNotes || 'No response notes entered.'}
              </p>
            </div>
          </div>

          {/* Right Col: Scope, Metadata, Systems */}
          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4 text-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Incident Metadata
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-slate-400">Lead Responder:</span>
                  <p className="text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>{incident.assignedResponder || 'Unassigned'}</span>
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Detected:</span>
                  <p className="text-slate-200 font-mono mt-0.5">
                    {new Date(incident.detectedAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Reported:</span>
                  <p className="text-slate-200 font-mono mt-0.5">
                    {new Date(incident.reportedAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400">Attack Vector:</span>
                  <p className="text-slate-200 mt-0.5 flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-slate-500" />
                    <span>{incident.suspectedAttackVector || 'Unconfirmed'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-3 text-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Affected Assets ({incident.affectedSystems.length})</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {incident.affectedSystems.map((sys, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    {sys}
                  </span>
                ))}
                {incident.affectedSystems.length === 0 && (
                  <span className="text-slate-500 italic">None specified.</span>
                )}
              </div>
            </div>

            {incident.tags.length > 0 && (
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-3 text-xs">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Incident Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {incident.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/40"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 2: Playbook */}
      {incidentDetailTab === 'playbook' && (
        <div>
          {incident.playbook && !isSwitchingPlaybook ? (
            <PlaybookView
              incidentId={incident.id}
              playbook={incident.playbook}
              onToggleTask={togglePlaybookTask}
              onChangePlaybook={() => setIsSwitchingPlaybook(true)}
            />
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Select a Playbook for this Incident
                  </h4>
                  <p className="text-xs text-slate-400">
                    Attach standard operating procedures to guide your investigation and containment
                  </p>
                </div>
                {incident.playbook && (
                  <button
                    onClick={() => setIsSwitchingPlaybook(false)}
                    className="px-3 py-1.5 text-xs rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Keep Current Playbook
                  </button>
                )}
              </div>
              <PlaybookCatalog
                onAttachToIncident={async (templateId) => {
                  await attachPlaybook(incident.id, templateId);
                  setIsSwitchingPlaybook(false);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Subtab 3: Evidence */}
      {incidentDetailTab === 'evidence' && (
        <EvidenceRegister
          incidentId={incident.id}
          evidence={incident.evidence}
          onAddEvidence={addEvidence}
          onDeleteEvidence={deleteEvidence}
        />
      )}

      {/* Subtab 4: Timeline */}
      {incidentDetailTab === 'timeline' && (
        <IncidentTimeline
          incidentId={incident.id}
          timeline={incident.timeline}
          evidenceList={incident.evidence}
          onAddEvent={addTimelineEvent}
          onDeleteEvent={deleteTimelineEvent}
          onSelectEvidence={(evidenceId) => {
            setIncidentDetailTab('evidence');
            showToast(`Jumped to evidence ${evidenceId}`, 'info');
          }}
        />
      )}

      {/* Subtab 5: Report */}
      {incidentDetailTab === 'report' && (
        <IncidentReport incident={incident} onExportJson={handleExportJson} />
      )}

      {/* Subtab 6: Post-Incident Review */}
      {incidentDetailTab === 'review' && (
        <PostIncidentReviewForm
          incidentId={incident.id}
          initialReview={incident.postIncidentReview}
          onSaveReview={updatePostIncidentReview}
        />
      )}

      {/* Status Transition Modal */}
      {isStatusModalOpen && (
        <StatusTransitionModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          incident={incident}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};
