import { describe, it, expect } from 'vitest'
import {
  validateIncidentInput,
  generateIncidentId,
  generateEvidenceId,
  generateTimelineId,
  generateActionItemId,
  validateAndParseImportJson,
} from '../services/validation'
import type { Incident } from '../types/incident'

describe('Validation & ID Generation Service', () => {
  it('validates a complete and correct incident payload', () => {
    const input: Partial<Incident> = {
      title: 'Active Directory Kerberoasting Attack',
      type: 'Credential compromise',
      severity: 'High',
      status: 'Investigating',
      detectedAt: '2026-10-15T08:00:00Z',
      reportedAt: '2026-10-15T08:30:00Z',
    };

    const res = validateIncidentInput(input);
    expect(res.isValid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });

  it('rejects incident with missing or blank title', () => {
    const input: Partial<Incident> = {
      title: '   ',
      type: 'Phishing',
      severity: 'Low',
      status: 'New',
      detectedAt: '2026-10-15T08:00:00Z',
      reportedAt: '2026-10-15T08:30:00Z',
    };

    const res = validateIncidentInput(input);
    expect(res.isValid).toBe(false);
    expect(res.errors.title).toBeDefined();
  });

  it('rejects incident where reported date precedes detected date', () => {
    const input: Partial<Incident> = {
      title: 'Phishing Campaign',
      type: 'Phishing',
      severity: 'Low',
      status: 'New',
      detectedAt: '2026-10-15T12:00:00Z',
      reportedAt: '2026-10-15T09:00:00Z',
    };

    const res = validateIncidentInput(input);
    expect(res.isValid).toBe(false);
    expect(res.errors.reportedAt).toContain('cannot precede detection time');
  });

  it('generates sequential unique incident IDs for the specified year', () => {
    const existing: Incident[] = [];
    expect(generateIncidentId(existing, 2026)).toBe('INC-2026-001');

    existing.push({
      id: 'INC-2026-001',
      title: 'Test',
      type: 'Other',
      description: '',
      severity: 'Low',
      status: 'New',
      detectedAt: '',
      reportedAt: '',
      affectedSystems: [],
      suspectedAttackVector: '',
      impactAssessment: '',
      assignedResponder: '',
      tags: [],
      responseNotes: '',
      createdAt: '',
      updatedAt: '',
      evidence: [],
      timeline: [],
    });

    expect(generateIncidentId(existing, 2026)).toBe('INC-2026-002');

    // Handles out-of-order sequence
    existing.push({
      ...existing[0],
      id: 'INC-2026-009',
    });
    expect(generateIncidentId(existing, 2026)).toBe('INC-2026-010');
  });

  it('generates formatted IDs for evidence, timeline, and actions', () => {
    expect(generateEvidenceId(0)).toBe('EVD-001');
    expect(generateEvidenceId(14)).toBe('EVD-015');

    expect(generateTimelineId(0)).toBe('EVT-001');
    expect(generateTimelineId(5)).toBe('EVT-006');

    expect(generateActionItemId(0)).toBe('ACT-001');
  });

  describe('JSON Import Validation & Security Checks', () => {
    it('successfully parses and validates authentic IncidentKit export JSON', () => {
      const validPayload = JSON.stringify({
        version: '1.0.0',
        source: 'IncidentKit',
        exportedAt: '2026-10-15T12:00:00Z',
        incidents: [
          {
            id: 'INC-2026-001',
            title: 'Sample Test Incident',
            type: 'Phishing',
            severity: 'Low',
            status: 'Resolved',
            detectedAt: '2026-10-15T09:00:00Z',
            reportedAt: '2026-10-15T09:15:00Z',
            affectedSystems: ['host-01'],
            tags: ['test'],
          },
        ],
      });

      const res = validateAndParseImportJson(validPayload);
      expect(res.success).toBe(true);
      expect(res.data?.incidents.length).toBe(1);
      expect(res.data?.incidents[0].id).toBe('INC-2026-001');
    });

    it('rejects malformed syntax JSON', () => {
      const res = validateAndParseImportJson('{"invalid json: true');
      expect(res.success).toBe(false);
      expect(res.error).toContain('JSON syntax error');
    });

    it('rejects JSON missing the IncidentKit source signature', () => {
      const untrusted = JSON.stringify({
        source: 'UntrustedThirdPartyApp',
        incidents: [],
      });
      const res = validateAndParseImportJson(untrusted);
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid file signature');
    });

    it('rejects JSON where incidents array is missing or not an array', () => {
      const noArray = JSON.stringify({
        source: 'IncidentKit',
        incidents: 'not-an-array',
      });
      const res = validateAndParseImportJson(noArray);
      expect(res.success).toBe(false);
      expect(res.error).toContain('Missing "incidents" array');
    });

    it('rejects incidents with invalid severity levels', () => {
      const badSeverity = JSON.stringify({
        source: 'IncidentKit',
        incidents: [
          {
            id: 'INC-2026-001',
            title: 'Test',
            type: 'Phishing',
            severity: 'Explosive', // invalid
            status: 'New',
          },
        ],
      });
      const res = validateAndParseImportJson(badSeverity);
      expect(res.success).toBe(false);
      expect(res.error).toContain('invalid severity');
    });

    it('rejects payload exceeding file size limit of 5 MB', () => {
      const largeString = 'a'.repeat(6 * 1024 * 1024);
      const res = validateAndParseImportJson(largeString);
      expect(res.success).toBe(false);
      expect(res.error).toContain('exceeds maximum allowed size');
    });
  });
});
