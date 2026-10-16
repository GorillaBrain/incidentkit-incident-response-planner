export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus = 
  | 'New'
  | 'Investigating'
  | 'Contained'
  | 'Recovering'
  | 'Resolved'
  | 'Closed';

export type IncidentCategory =
  | 'Phishing'
  | 'Malware infection'
  | 'Ransomware'
  | 'Unauthorized access'
  | 'Credential compromise'
  | 'Data breach'
  | 'Denial-of-service attack'
  | 'Suspicious network activity'
  | 'Insider threat'
  | 'Other';

export interface SeverityFactors {
  businessImpact: 'none' | 'low' | 'moderate' | 'severe' | 'catastrophic';
  affectedScope: 'minimal' | 'limited' | 'moderate' | 'widespread';
  dataSensitivity: 'public' | 'internal' | 'confidential' | 'critical';
  serviceAvailability: 'normal' | 'minor_degradation' | 'major_degradation' | 'total_outage';
  activeMaliciousActivity: 'none' | 'suspected' | 'confirmed';
  spreadPotential: 'isolated' | 'low' | 'moderate' | 'high_wormable';
}

export interface SeverityScoreResult {
  score: number; // 0-100
  suggestedSeverity: SeverityLevel;
  breakdown: {
    businessImpactPoints: number;
    affectedScopePoints: number;
    dataSensitivityPoints: number;
    serviceAvailabilityPoints: number;
    activeMaliciousActivityPoints: number;
    spreadPotentialPoints: number;
  };
  rationale: string[];
}

export interface PlaybookTask {
  id: string;
  title: string;
  explanation: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  completed: boolean;
  completedAt?: string; // ISO string
  notes?: string;
}

export interface PlaybookStage {
  id: string;
  name: string;
  description: string;
  tasks: PlaybookTask[];
}

export interface PlaybookInstance {
  id: string;
  templateId: string;
  title: string;
  description: string;
  category: IncidentCategory;
  stages: PlaybookStage[];
}

export type EvidenceType =
  | 'System logs'
  | 'Network logs'
  | 'Screenshots'
  | 'Email headers'
  | 'File hashes'
  | 'Endpoint alerts'
  | 'User reports'
  | 'Other';

export interface EvidenceRecord {
  id: string;
  incidentId: string;
  evidenceType: EvidenceType;
  description: string;
  sourceSystem: string;
  collectedAt: string; // ISO string
  collectorName: string;
  fileOrRefName: string;
  sha256Hash?: string;
  storageLocation: string;
  chainOfCustodyNotes: string;
  recordedAt: string; // ISO timestamp when logged in IncidentKit
}

export type TimelineEventCategory =
  | 'Detection'
  | 'Triage'
  | 'Notification'
  | 'Containment'
  | 'Eradication'
  | 'Recovery'
  | 'Resolution'
  | 'Other';

export interface TimelineEvent {
  id: string;
  incidentId: string;
  timestamp: string; // User-provided event occurrence timestamp
  enteredAt: string; // System-recorded timestamp
  title: string;
  description: string;
  category: TimelineEventCategory;
  associatedEvidenceId?: string;
}

export interface PostIncidentActionItem {
  id: string;
  title: string;
  owner: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  targetDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  notes?: string;
}

export interface PostIncidentReview {
  completed: boolean;
  completedAt?: string;
  conductedBy?: string;
  whatHappened: string;
  howDetected: string;
  rootCause: string;
  whatWorkedWell: string;
  whatWentWrong: string;
  businessImpactSummary: string;
  delayedActions: string;
  improvementsNeeded: string;
  preventiveMeasures: string;
  keyLessonsLearned: string;
  actionItems: PostIncidentActionItem[];
}

export interface Incident {
  id: string; // e.g. "INC-2026-001"
  title: string;
  type: IncidentCategory;
  description: string;
  severity: SeverityLevel;
  severityAssessment?: {
    factors: SeverityFactors;
    result: SeverityScoreResult;
    manuallyOverridden: boolean;
    overrideReason?: string;
  };
  status: IncidentStatus;
  detectedAt: string;
  reportedAt: string;
  affectedSystems: string[];
  suspectedAttackVector: string;
  impactAssessment: string;
  assignedResponder: string;
  tags: string[];
  responseNotes: string;
  resolutionSummary?: string;
  createdAt: string;
  updatedAt: string;
  playbook?: PlaybookInstance;
  evidence: EvidenceRecord[];
  timeline: TimelineEvent[];
  postIncidentReview?: PostIncidentReview;
  isDemo?: boolean;
}

export interface AppExportData {
  version: string;
  exportedAt: string;
  source: 'IncidentKit';
  incidents: Incident[];
}
