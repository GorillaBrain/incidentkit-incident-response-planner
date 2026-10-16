import { describe, it, expect } from 'vitest'
import {
  calculateSeverity,
  DEFAULT_SEVERITY_FACTORS,
} from '../services/severityCalculator'
import type { SeverityFactors } from '../types/incident'

describe('Severity Assessment Calculator', () => {
  it('evaluates catastrophic widespread breach as Critical severity (>= 75 score)', () => {
    const factors: SeverityFactors = {
      businessImpact: 'catastrophic',
      affectedScope: 'widespread',
      dataSensitivity: 'critical',
      serviceAvailability: 'total_outage',
      activeMaliciousActivity: 'confirmed',
      spreadPotential: 'high_wormable',
    };

    const result = calculateSeverity(factors);
    expect(result.score).toBe(100);
    expect(result.suggestedSeverity).toBe('Critical');
    expect(result.rationale.length).toBeGreaterThan(0);
    expect(result.rationale.some((r) => r.includes('Substantial operational impact'))).toBe(true);
  });

  it('evaluates minimal benign incident as Low severity (< 25 score)', () => {
    const factors: SeverityFactors = {
      businessImpact: 'none',
      affectedScope: 'minimal',
      dataSensitivity: 'public',
      serviceAvailability: 'normal',
      activeMaliciousActivity: 'none',
      spreadPotential: 'isolated',
    };

    const result = calculateSeverity(factors);
    expect(result.score).toBeLessThan(25);
    expect(result.suggestedSeverity).toBe('Low');
    expect(result.rationale[0]).toContain('minimal disruption');
  });

  it('evaluates single department moderate ransomware as High severity (50 - 74 score)', () => {
    const factors: SeverityFactors = {
      businessImpact: 'moderate',
      affectedScope: 'limited',
      dataSensitivity: 'confidential',
      serviceAvailability: 'major_degradation',
      activeMaliciousActivity: 'confirmed',
      spreadPotential: 'moderate',
    };

    const result = calculateSeverity(factors);
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThan(75);
    expect(result.suggestedSeverity).toBe('High');
  });

  it('evaluates isolated non-critical phishing as Medium severity (25 - 49 score)', () => {
    const factors: SeverityFactors = {
      businessImpact: 'low',
      affectedScope: 'minimal',
      dataSensitivity: 'internal',
      serviceAvailability: 'normal',
      activeMaliciousActivity: 'suspected',
      spreadPotential: 'low',
    };

    const result = calculateSeverity(factors);
    expect(result.score).toBeGreaterThanOrEqual(25);
    expect(result.score).toBeLessThan(50);
    expect(result.suggestedSeverity).toBe('Medium');
  });

  it('provides complete points breakdown summing exactly to total score', () => {
    const result = calculateSeverity(DEFAULT_SEVERITY_FACTORS);
    const sum =
      result.breakdown.businessImpactPoints +
      result.breakdown.affectedScopePoints +
      result.breakdown.dataSensitivityPoints +
      result.breakdown.serviceAvailabilityPoints +
      result.breakdown.activeMaliciousActivityPoints +
      result.breakdown.spreadPotentialPoints;

    expect(result.score).toBe(sum);
  });
});
