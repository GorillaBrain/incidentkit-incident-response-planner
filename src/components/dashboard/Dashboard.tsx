import React from 'react'
import { useIncidentContext } from '../../context/IncidentContext'
import { StatCard } from './StatCard'
import { SeverityChart } from './SeverityChart'
import { RecentIncidents } from './RecentIncidents'
import { ActionItemsList } from './ActionItemsList'
import { FirstTimeWelcomeCard } from '../common/EmptyState'
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Sparkles,
  Trash2,
  Plus,
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const {
    incidents,
    selectIncident,
    setActiveNavTab,
    setIsCreateModalOpen,
    loadDemoData,
    removeDemoData,
    toggleActionItemStatus,
  } = useIncidentContext();

  const totalCount = incidents.length;
  const openCount = incidents.filter(
    (i) => i.status !== 'Resolved' && i.status !== 'Closed'
  ).length;
  const investigatingCount = incidents.filter((i) => i.status === 'Investigating').length;
  const resolvedCount = incidents.filter(
    (i) => i.status === 'Resolved' || i.status === 'Closed'
  ).length;
  const critHighCount = incidents.filter(
    (i) => i.severity === 'Critical' || i.severity === 'High'
  ).length;

  const hasDemo = incidents.some((i) => i.isDemo);

  return (
    <div className="space-y-6">
      {/* First-time empty state */}
      {totalCount === 0 && (
        <FirstTimeWelcomeCard
          onLoadDemo={loadDemoData}
          onCreateIncident={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Demo Data Notification Banner */}
      {hasDemo && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-200 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Demo Scenarios Active:</strong> You are currently viewing synthetic sample incident data. Explore playbooks, timelines, and reporting safely.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={removeDemoData}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Demo Data</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Real Incident</span>
            </button>
          </div>
        </div>
      )}

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Incidents"
          value={totalCount}
          icon={<ShieldAlert className="w-5 h-5 text-cyan-400" />}
          subtitle="All recorded incident files"
          onClick={() => setActiveNavTab('incidents')}
        />
        <StatCard
          label="Active / Open"
          value={openCount}
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          subtitle="New, Investigating, or Contained"
          badge={{
            text: openCount > 0 ? `${openCount} Active` : 'All Clear',
            variant: openCount > 0 ? 'warning' : 'success',
          }}
          onClick={() => setActiveNavTab('incidents')}
        />
        <StatCard
          label="Investigating"
          value={investigatingCount}
          icon={<Search className="w-5 h-5 text-sky-400" />}
          subtitle="Under active triage & scoping"
          onClick={() => setActiveNavTab('incidents')}
        />
        <StatCard
          label="Critical & High"
          value={critHighCount}
          icon={<AlertOctagon className="w-5 h-5 text-rose-400" />}
          subtitle="High operational severity"
          badge={{
            text: critHighCount > 0 ? 'Priority Queue' : 'Zero High',
            variant: critHighCount > 0 ? 'danger' : 'neutral',
          }}
          onClick={() => setActiveNavTab('incidents')}
        />
        <StatCard
          label="Resolved / Closed"
          value={resolvedCount}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          subtitle="Remediation complete"
          badge={{ text: `${resolvedCount} Remediated`, variant: 'success' }}
          onClick={() => setActiveNavTab('incidents')}
        />
      </div>

      {/* Visual Analytics */}
      <SeverityChart incidents={incidents} />

      {/* Outstanding Post-Incident Actions List */}
      <ActionItemsList
        incidents={incidents}
        onSelectIncident={(id) => selectIncident(id, 'review')}
        onToggleStatus={toggleActionItemStatus}
      />

      {/* Recent Incidents Activity List */}
      <RecentIncidents
        incidents={incidents}
        onSelectIncident={(id) => selectIncident(id, 'overview')}
        onViewAll={() => setActiveNavTab('incidents')}
      />
    </div>
  );
};
