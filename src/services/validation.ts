import type {
  Incident,
  AppExportData,
  SeverityLevel,
  IncidentStatus,
  IncidentCategory,
} from '../types/incident'

const VALID_SEVERITIES: SeverityLevel[] = ['Critical', 'High', 'Medium', 'Low'];
const VALID_STATUSES: IncidentStatus[] = [
  'New',
  'Investigating',
  'Contained',
  'Recovering',
  'Resolved',
  'Closed',
];
const VALID_CATEGORIES: IncidentCategory[] = [
  'Phishing',
  'Malware infection',
  'Ransomware',
  'Unauthorized access',
  'Credential compromise',
  'Data breach',
  'Denial-of-service attack',
  'Suspicious network activity',
  'Insider threat',
  'Other',
];

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates core user inputs for incident creation/editing.
 */
export function validateIncidentInput(data: Partial<Incident>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Incident title is required.';
  } else if (data.title.trim().length > 150) {
    errors.title = 'Incident title must be 150 characters or less.';
  }

  if (!data.type || !VALID_CATEGORIES.includes(data.type)) {
    errors.type = 'Please select a valid incident category.';
  }

  if (!data.severity || !VALID_SEVERITIES.includes(data.severity)) {
    errors.severity = 'Please select a valid severity level.';
  }

  if (!data.status || !VALID_STATUSES.includes(data.status)) {
    errors.status = 'Please select a valid incident status.';
  }

  if (!data.detectedAt) {
    errors.detectedAt = 'Detection date and time are required.';
  } else if (isNaN(new Date(data.detectedAt).getTime())) {
    errors.detectedAt = 'Invalid detection timestamp format.';
  }

  if (!data.reportedAt) {
    errors.reportedAt = 'Reported date and time are required.';
  } else if (isNaN(new Date(data.reportedAt).getTime())) {
    errors.reportedAt = 'Invalid reported timestamp format.';
  }

  if (
    data.detectedAt &&
    data.reportedAt &&
    new Date(data.reportedAt).getTime() < new Date(data.detectedAt).getTime()
  ) {
    errors.reportedAt = 'Reported time cannot precede detection time.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Generates the next sequential unique incident ID for the given year.
 * Format: INC-YYYY-XXX (e.g. INC-2026-001)
 */
export function generateIncidentId(existingIncidents: Incident[], targetYear?: number): string {
  const year = targetYear || new Date().getFullYear();
  const prefix = `INC-${year}-`;

  let maxSeq = 0;
  for (const inc of existingIncidents) {
    if (inc.id && inc.id.startsWith(prefix)) {
      const seqStr = inc.id.substring(prefix.length);
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}

/**
 * Generates a unique evidence ID (e.g. EVD-001).
 */
export function generateEvidenceId(existingCount: number): string {
  return `EVD-${String(existingCount + 1).padStart(3, '0')}`;
}

/**
 * Generates a unique timeline event ID (e.g. EVT-001).
 */
export function generateTimelineId(existingCount: number): string {
  return `EVT-${String(existingCount + 1).padStart(3, '0')}`;
}

/**
 * Generates a unique action item ID (e.g. ACT-001).
 */
export function generateActionItemId(existingCount: number): string {
  return `ACT-${String(existingCount + 1).padStart(3, '0')}`;
}

const MAX_JSON_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_RECORD_COUNT = 500;

export interface ImportValidationResult {
  success: boolean;
  data?: AppExportData;
  error?: string;
}

/**
 * Strictly parses and validates imported JSON data.
 * Protects against oversized payloads, prototype pollution, malformed JSON, and invalid schema objects.
 */
export function validateAndParseImportJson(rawJsonString: string): ImportValidationResult {
  if (!rawJsonString || typeof rawJsonString !== 'string') {
    return { success: false, error: 'Empty or invalid file content.' };
  }

  if (rawJsonString.length > MAX_JSON_SIZE_BYTES) {
    return {
      success: false,
      error: `File exceeds maximum allowed size of 5 MB (size: ${(rawJsonString.length / 1024 / 1024).toFixed(2)} MB).`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJsonString);
  } catch (err) {
    return {
      success: false,
      error: `JSON syntax error: ${err instanceof Error ? err.message : 'Invalid JSON format.'}`,
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      success: false,
      error: 'Malformed JSON payload: Root must be an object with an "incidents" array.',
    };
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.source !== 'IncidentKit') {
    return {
      success: false,
      error: 'Invalid file signature: Imported file does not match IncidentKit export schema (missing or invalid "source" field).',
    };
  }

  if (!Array.isArray(obj.incidents)) {
    return {
      success: false,
      error: 'Invalid file structure: Missing "incidents" array in export package.',
    };
  }

  if (obj.incidents.length > MAX_RECORD_COUNT) {
    return {
      success: false,
      error: `Import rejected: Package contains ${obj.incidents.length} incidents, which exceeds the limit of ${MAX_RECORD_COUNT} records.`,
    };
  }

  // Validate each incident inside the array
  const sanitizedIncidents: Incident[] = [];

  for (let i = 0; i < obj.incidents.length; i++) {
    const item = obj.incidents[i];
    if (typeof item !== 'object' || item === null) {
      return { success: false, error: `Incident at index ${i} is not a valid object.` };
    }

    const inc = item as Record<string, unknown>;

    if (typeof inc.id !== 'string' || inc.id.trim().length === 0) {
      return { success: false, error: `Incident at index ${i} is missing a valid "id".` };
    }

    if (typeof inc.title !== 'string' || inc.title.trim().length === 0) {
      return { success: false, error: `Incident at index ${i} is missing a valid "title".` };
    }

    if (typeof inc.severity !== 'string' || !VALID_SEVERITIES.includes(inc.severity as SeverityLevel)) {
      return { success: false, error: `Incident ${inc.id} has an invalid severity "${inc.severity}".` };
    }

    if (typeof inc.status !== 'string' || !VALID_STATUSES.includes(inc.status as IncidentStatus)) {
      return { success: false, error: `Incident ${inc.id} has an invalid status "${inc.status}".` };
    }

    if (typeof inc.type !== 'string' || !VALID_CATEGORIES.includes(inc.type as IncidentCategory)) {
      return { success: false, error: `Incident ${inc.id} has an invalid category "${inc.type}".` };
    }

    // Ensure array fields exist
    const sanitizedIncident: Incident = {
      id: String(inc.id).trim(),
      title: String(inc.title).trim(),
      type: inc.type as IncidentCategory,
      description: typeof inc.description === 'string' ? inc.description : '',
      severity: inc.severity as SeverityLevel,
      severityAssessment: inc.severityAssessment as Incident['severityAssessment'],
      status: inc.status as IncidentStatus,
      detectedAt: typeof inc.detectedAt === 'string' ? inc.detectedAt : new Date().toISOString(),
      reportedAt: typeof inc.reportedAt === 'string' ? inc.reportedAt : new Date().toISOString(),
      affectedSystems: Array.isArray(inc.affectedSystems)
        ? inc.affectedSystems.map(String)
        : [],
      suspectedAttackVector: typeof inc.suspectedAttackVector === 'string' ? inc.suspectedAttackVector : '',
      impactAssessment: typeof inc.impactAssessment === 'string' ? inc.impactAssessment : '',
      assignedResponder: typeof inc.assignedResponder === 'string' ? inc.assignedResponder : 'Unassigned',
      tags: Array.isArray(inc.tags) ? inc.tags.map(String) : [],
      responseNotes: typeof inc.responseNotes === 'string' ? inc.responseNotes : '',
      resolutionSummary: typeof inc.resolutionSummary === 'string' ? inc.resolutionSummary : '',
      createdAt: typeof inc.createdAt === 'string' ? inc.createdAt : new Date().toISOString(),
      updatedAt: typeof inc.updatedAt === 'string' ? inc.updatedAt : new Date().toISOString(),
      playbook: inc.playbook as Incident['playbook'],
      evidence: Array.isArray(inc.evidence) ? (inc.evidence as Incident['evidence']) : [],
      timeline: Array.isArray(inc.timeline) ? (inc.timeline as Incident['timeline']) : [],
      postIncidentReview: inc.postIncidentReview as Incident['postIncidentReview'],
      isDemo: Boolean(inc.isDemo),
    };

    sanitizedIncidents.push(sanitizedIncident);
  }

  const exportData: AppExportData = {
    version: typeof obj.version === 'string' ? obj.version : '1.0.0',
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
    source: 'IncidentKit',
    incidents: sanitizedIncidents,
  };

  return {
    success: true,
    data: exportData,
  };
}
