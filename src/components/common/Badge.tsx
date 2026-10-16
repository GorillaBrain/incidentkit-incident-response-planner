import React from 'react'
import type { SeverityLevel, IncidentStatus } from '../../types/incident'
import { SEVERITY_DEFINITIONS } from '../../constants/severities'
import { STATUS_DEFINITIONS } from '../../constants/statuses'
import {
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  Search,
  ShieldCheck,
  RotateCw,
  CheckCircle2,
  Archive,
} from 'lucide-react'

export interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showIcon = true,
}) => {
  const def = SEVERITY_DEFINITIONS[severity] || SEVERITY_DEFINITIONS.Low;

  const getIcon = () => {
    switch (severity) {
      case 'Critical':
        return <AlertOctagon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />;
      case 'High':
        return <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />;
      case 'Medium':
        return <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />;
      case 'Low':
      default:
        return <Info className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />;
    }
  };

  const sizeClass =
    size === 'sm'
      ? 'text-xs px-2 py-0.5'
      : size === 'lg'
      ? 'text-sm px-3 py-1 font-semibold'
      : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${def.badgeClass} ${sizeClass}`}
      role="status"
      aria-label={`Severity: ${severity}`}
    >
      {showIcon && getIcon()}
      <span>{def.label}</span>
    </span>
  );
};

export interface StatusBadgeProps {
  status: IncidentStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const def = STATUS_DEFINITIONS[status] || STATUS_DEFINITIONS.New;

  const getIcon = () => {
    switch (status) {
      case 'New':
        return <Clock className="w-3 h-3" aria-hidden="true" />;
      case 'Investigating':
        return <Search className="w-3 h-3 animate-pulse" aria-hidden="true" />;
      case 'Contained':
        return <ShieldCheck className="w-3 h-3" aria-hidden="true" />;
      case 'Recovering':
        return <RotateCw className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} aria-hidden="true" />;
      case 'Resolved':
        return <CheckCircle2 className="w-3 h-3" aria-hidden="true" />;
      case 'Closed':
        return <Archive className="w-3 h-3" aria-hidden="true" />;
    }
  };

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${def.badgeClass} ${sizeClass}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {showIcon && getIcon()}
      <span>{def.label}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
}> = ({ priority }) => {
  const getColors = () => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'High':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'Medium':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
      case 'Low':
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    }
  };

  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded border font-medium ${getColors()}`}
    >
      {priority}
    </span>
  );
};
