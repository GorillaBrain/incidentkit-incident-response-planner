import type { SeverityFactors, SeverityScoreResult, SeverityLevel } from '../types/incident'

/**
 * Scoring weights for multi-factor severity assessment.
 * Maximum possible total score = 100 points.
 * 
 * Distribution:
 * - Business Impact: max 25 points
 * - Scope (Affected assets/users): max 20 points
 * - Data Sensitivity: max 20 points
 * - Service Availability: max 15 points
 * - Active Malicious Activity: max 10 points
 * - Spread Potential: max 10 points
 */
export const SCORING_MATRIX = {
  businessImpact: {
    none: { points: 0, label: 'None / No operational impact' },
    low: { points: 6, label: 'Low / Minor inconvenience or workaround available' },
    moderate: { points: 12, label: 'Moderate / Department-level disruption or delays' },
    severe: { points: 20, label: 'Severe / Core revenue or enterprise workflow crippled' },
    catastrophic: { points: 25, label: 'Catastrophic / Enterprise-wide existential threat' },
  },
  affectedScope: {
    minimal: { points: 3, label: 'Minimal / 1-4 individual endpoints or accounts' },
    limited: { points: 8, label: 'Limited / 5-25 systems or single department' },
    moderate: { points: 14, label: 'Moderate / 26-100 systems or entire regional site' },
    widespread: { points: 20, label: 'Widespread / 100+ systems or global network' },
  },
  dataSensitivity: {
    public: { points: 2, label: 'Public / Non-confidential information' },
    internal: { points: 6, label: 'Internal / Non-public business communications' },
    confidential: { points: 14, label: 'Confidential / PII, employee records, financial reports' },
    critical: { points: 20, label: 'Critical / Trade secrets, crown-jewel IP, health records, banking credentials' },
  },
  serviceAvailability: {
    normal: { points: 2, label: 'Normal / All services fully operational' },
    minor_degradation: { points: 6, label: 'Minor Degradation / Increased latency or non-critical feature unavailable' },
    major_degradation: { points: 10, label: 'Major Degradation / Core transactions failing for a subset of users' },
    total_outage: { points: 15, label: 'Total Outage / Mission-critical infrastructure offline' },
  },
  activeMaliciousActivity: {
    none: { points: 1, label: 'None / Blocked attack, historical artifact, or benign false alarm' },
    suspected: { points: 5, label: 'Suspected / Anomalous activity observed, intent unconfirmed' },
    confirmed: { points: 10, label: 'Confirmed / Active hands-on-keyboard adversary or running payload' },
  },
  spreadPotential: {
    isolated: { points: 1, label: 'Isolated / Endpoint quarantined, blast radius strictly contained' },
    low: { points: 3, label: 'Low / Requires manual interactive credentials to pivot' },
    moderate: { points: 6, label: 'Moderate / Shared domain credentials or network file shares accessible' },
    high_wormable: { points: 10, label: 'High / Automated wormable exploit or widespread GPO propagation' },
  },
};

/**
 * Calculates severity score (0 - 100), suggested severity classification, and plain-English rationale.
 */
export function calculateSeverity(factors: SeverityFactors): SeverityScoreResult {
  const bi = SCORING_MATRIX.businessImpact[factors.businessImpact] || SCORING_MATRIX.businessImpact.none;
  const as = SCORING_MATRIX.affectedScope[factors.affectedScope] || SCORING_MATRIX.affectedScope.minimal;
  const ds = SCORING_MATRIX.dataSensitivity[factors.dataSensitivity] || SCORING_MATRIX.dataSensitivity.public;
  const sa = SCORING_MATRIX.serviceAvailability[factors.serviceAvailability] || SCORING_MATRIX.serviceAvailability.normal;
  const ma = SCORING_MATRIX.activeMaliciousActivity[factors.activeMaliciousActivity] || SCORING_MATRIX.activeMaliciousActivity.none;
  const sp = SCORING_MATRIX.spreadPotential[factors.spreadPotential] || SCORING_MATRIX.spreadPotential.isolated;

  const totalScore = Math.min(
    100,
    bi.points + as.points + ds.points + sa.points + ma.points + sp.points
  );

  let suggestedSeverity: SeverityLevel = 'Low';
  if (totalScore >= 75) {
    suggestedSeverity = 'Critical';
  } else if (totalScore >= 50) {
    suggestedSeverity = 'High';
  } else if (totalScore >= 25) {
    suggestedSeverity = 'Medium';
  } else {
    suggestedSeverity = 'Low';
  }

  // Generate plain-language rationale bullets
  const rationale: string[] = [];

  if (factors.businessImpact === 'catastrophic' || factors.businessImpact === 'severe') {
    rationale.push(`Substantial operational impact: ${bi.label}.`);
  }
  if (factors.dataSensitivity === 'critical' || factors.dataSensitivity === 'confidential') {
    rationale.push(`Sensitive data exposure risk: ${ds.label}.`);
  }
  if (factors.serviceAvailability === 'total_outage' || factors.serviceAvailability === 'major_degradation') {
    rationale.push(`Critical service disruption: ${sa.label}.`);
  }
  if (factors.activeMaliciousActivity === 'confirmed') {
    rationale.push('Confirmed ongoing active adversary presence requires immediate emergency triage.');
  }
  if (factors.spreadPotential === 'high_wormable') {
    rationale.push('High lateral spread potential warrants immediate isolation of network segments.');
  }
  if (factors.affectedScope === 'widespread') {
    rationale.push(`Broad blast radius: ${as.label}.`);
  }

  if (rationale.length === 0) {
    rationale.push('Incident parameters reflect minimal disruption and isolated scope.');
  }

  return {
    score: totalScore,
    suggestedSeverity,
    breakdown: {
      businessImpactPoints: bi.points,
      affectedScopePoints: as.points,
      dataSensitivityPoints: ds.points,
      serviceAvailabilityPoints: sa.points,
      activeMaliciousActivityPoints: ma.points,
      spreadPotentialPoints: sp.points,
    },
    rationale,
  };
}

export const DEFAULT_SEVERITY_FACTORS: SeverityFactors = {
  businessImpact: 'none',
  affectedScope: 'minimal',
  dataSensitivity: 'internal',
  serviceAvailability: 'normal',
  activeMaliciousActivity: 'suspected',
  spreadPotential: 'low',
};
