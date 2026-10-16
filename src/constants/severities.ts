import type { SeverityLevel } from '../types/incident'

export interface SeverityDefinition {
  level: SeverityLevel;
  label: string;
  badgeClass: string;
  borderClass: string;
  bgLightClass: string;
  textClass: string;
  description: string;
  recommendedSla: string;
  scoreRange: string;
  examples: string[];
}

export const SEVERITY_DEFINITIONS: Record<SeverityLevel, SeverityDefinition> = {
  Critical: {
    level: 'Critical',
    label: 'Critical',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    borderClass: 'border-rose-500',
    bgLightClass: 'bg-rose-950/20',
    textClass: 'text-rose-400',
    description: 'Catastrophic business impact, severe compromise of core infrastructure, active widespread ransomware, or verified massive data exfiltration.',
    recommendedSla: '< 15 Minutes Response / 24x7 War Room Mobilization',
    scoreRange: '75 - 100 Points',
    examples: [
      'Active ransomware spreading across enterprise domains',
      'Confirmed exfiltration of crown-jewel customer database / PII',
      'Complete compromise of Domain Controller / root cloud credentials',
    ],
  },
  High: {
    level: 'High',
    label: 'High',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    borderClass: 'border-amber-500',
    bgLightClass: 'bg-amber-950/20',
    textClass: 'text-amber-400',
    description: 'Significant operational impact, active lateral movement, compromise of privileged accounts, or localized critical service outage.',
    recommendedSla: '< 1 Hour Response / Dedicated Lead Responder',
    scoreRange: '50 - 74 Points',
    examples: [
      'Privileged administrator account compromised without MFA',
      'Malware persistence established on key file server',
      'DDoS causing major degradation of public ecommerce gateway',
    ],
  },
  Medium: {
    level: 'Medium',
    label: 'Medium',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    borderClass: 'border-cyan-500',
    bgLightClass: 'bg-cyan-950/20',
    textClass: 'text-cyan-400',
    description: 'Moderate impact, contained single-host malware, credential stuffing on non-privileged accounts, or isolated policy violation.',
    recommendedSla: '< 4 Hours Response / Business Hours Escalation',
    scoreRange: '25 - 49 Points',
    examples: [
      'Single user workstation infected with adware/trojan (contained)',
      'Phishing campaign reported with minor user clicks, no credential submission',
      'Suspicious off-hours login quickly blocked by conditional access',
    ],
  },
  Low: {
    level: 'Low',
    label: 'Low',
    badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    borderClass: 'border-slate-500',
    bgLightClass: 'bg-slate-900/40',
    textClass: 'text-slate-400',
    description: 'Minimal impact, isolated reconnaissance scans, automated spam, or blocked attack with no signs of compromise.',
    recommendedSla: '< 24 Hours Response / Standard Queue Triage',
    scoreRange: '0 - 24 Points',
    examples: [
      'External port scanning blocked at firewall perimeter',
      'Generic bulk phishing email caught by mail filter',
      'Brief transient connection to known low-risk suspicious IP',
    ],
  },
};
