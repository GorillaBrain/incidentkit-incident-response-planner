import { describe, it, expect, beforeEach } from 'vitest'
import * as storage from '../services/storage'
import type { Incident } from '../types/incident'

describe('Storage Service & Persistence Abstraction', () => {
  beforeEach(async () => {
    await storage.clearAllData();
  });

  it('starts with an empty incident list after clearing all data', async () => {
    const list = await storage.loadIncidents();
    expect(list).toEqual([]);
  });

  it('upserts and retrieves an incident by ID', async () => {
    const mockIncident: Incident = {
      id: 'INC-2026-099',
      title: 'Testing Storage Incident',
      type: 'Malware infection',
      description: 'Host infected with coinminer',
      severity: 'Medium',
      status: 'Investigating',
      detectedAt: '2026-10-15T10:00:00Z',
      reportedAt: '2026-10-15T10:15:00Z',
      affectedSystems: ['miner-01.corp'],
      suspectedAttackVector: 'Drive-by download',
      impactAssessment: 'CPU spiked to 100%',
      assignedResponder: 'Incident Responder',
      tags: ['Malware', 'Coinminer'],
      responseNotes: 'Process terminated.',
      createdAt: '2026-10-15T10:15:00Z',
      updatedAt: '2026-10-15T10:15:00Z',
      evidence: [],
      timeline: [],
    };

    const savedList = await storage.upsertIncident(mockIncident);
    expect(savedList.length).toBe(1);

    const retrieved = await storage.getIncidentById('INC-2026-099');
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Testing Storage Incident');
    expect(retrieved?.severity).toBe('Medium');
  });

  it('deletes an incident by ID', async () => {
    const inc: Incident = {
      id: 'INC-2026-100',
      title: 'To Be Deleted',
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
    };

    await storage.upsertIncident(inc);
    expect((await storage.loadIncidents()).length).toBe(1);

    const remaining = await storage.deleteIncident('INC-2026-100');
    expect(remaining.length).toBe(0);
    expect(await storage.getIncidentById('INC-2026-100')).toBeUndefined();
  });

  it('loads and removes demo scenarios cleanly', async () => {
    // 1. Create a real user incident
    const userInc: Incident = {
      id: 'INC-2026-USER',
      title: 'Real Production Incident',
      type: 'Data breach',
      description: 'Custom user record',
      severity: 'Critical',
      status: 'Investigating',
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
      isDemo: false,
    };
    await storage.upsertIncident(userInc);

    // 2. Load demo data
    const withDemo = await storage.loadDemoData();
    expect(withDemo.length).toBeGreaterThan(1);
    expect(withDemo.some((i) => i.isDemo)).toBe(true);
    expect(withDemo.some((i) => i.id === 'INC-2026-USER')).toBe(true);

    // 3. Remove demo data
    const cleaned = await storage.removeDemoData();
    expect(cleaned.length).toBe(1);
    expect(cleaned[0].id).toBe('INC-2026-USER');
    expect(cleaned.some((i) => i.isDemo)).toBe(false);
  });

  it('exports and imports JSON data accurately', async () => {
    const testInc: Incident = {
      id: 'INC-2026-EXP',
      title: 'Export Import Roundtrip Test',
      type: 'Phishing',
      description: 'Testing json export',
      severity: 'High',
      status: 'Contained',
      detectedAt: '2026-10-15T12:00:00Z',
      reportedAt: '2026-10-15T12:00:00Z',
      affectedSystems: ['mail.corp'],
      suspectedAttackVector: 'Phish link',
      impactAssessment: 'Credentials reset',
      assignedResponder: 'Analyst',
      tags: ['Test'],
      responseNotes: 'None',
      createdAt: '2026-10-15T12:00:00Z',
      updatedAt: '2026-10-15T12:00:00Z',
      evidence: [],
      timeline: [],
    };
    await storage.upsertIncident(testInc);

    const json = await storage.exportToJson();
    expect(json).toContain('IncidentKit');
    expect(json).toContain('INC-2026-EXP');

    // Clear and import back
    await storage.clearAllData();
    expect(await storage.loadIncidents()).toEqual([]);

    const importRes = await storage.importFromJson(json);
    expect(importRes.success).toBe(true);
    expect(importRes.importedCount).toBe(1);

    const restored = await storage.getIncidentById('INC-2026-EXP');
    expect(restored).toBeDefined();
    expect(restored?.title).toBe('Export Import Roundtrip Test');
  });

  it('handles corrupted JSON import safely with descriptive error', async () => {
    const res = await storage.importFromJson('not-valid-json');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
