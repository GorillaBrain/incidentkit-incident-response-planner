import type { IncidentStatus } from '../types/incident'

export interface StatusDefinition {
  status: IncidentStatus;
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
  allowedTransitions: IncidentStatus[];
}

export const STATUS_DEFINITIONS: Record<IncidentStatus, StatusDefinition> = {
  New: {
    status: 'New',
    label: 'New',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    dotClass: 'bg-indigo-400',
    description: 'Initial alert or notification received. Pending preliminary analyst triage and scoping.',
    allowedTransitions: ['Investigating', 'Closed'],
  },
  Investigating: {
    status: 'Investigating',
    label: 'Investigating',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    dotClass: 'bg-sky-400 animate-pulse',
    description: 'Active technical investigation underway: determining scope, vector, affected assets, and collecting evidence.',
    allowedTransitions: ['Contained', 'Recovering', 'Closed'],
  },
  Contained: {
    status: 'Contained',
    label: 'Contained',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dotClass: 'bg-amber-400',
    description: 'Spread of the incident has been halted. Compromised systems isolated, sessions revoked, or firewall blocks deployed.',
    allowedTransitions: ['Investigating', 'Recovering', 'Resolved'],
  },
  Recovering: {
    status: 'Recovering',
    label: 'Recovering',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dotClass: 'bg-purple-400',
    description: 'Threat eradicated. Restoring affected systems from trusted backups, rebuilding workstations, and validating service integrity.',
    allowedTransitions: ['Contained', 'Resolved'],
  },
  Resolved: {
    status: 'Resolved',
    label: 'Resolved',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    description: 'Operations restored to normal state. Ready for formal post-incident review and corrective action assignments.',
    allowedTransitions: ['Closed', 'Investigating'],
  },
  Closed: {
    status: 'Closed',
    label: 'Closed',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    dotClass: 'bg-slate-500',
    description: 'Post-incident review concluded, lessons learned recorded, and documentation archived.',
    allowedTransitions: ['Investigating'],
  },
};

export const STATUS_ORDER: IncidentStatus[] = [
  'New',
  'Investigating',
  'Contained',
  'Recovering',
  'Resolved',
  'Closed',
];
