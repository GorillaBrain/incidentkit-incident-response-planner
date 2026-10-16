import { describe, it, expect } from 'vitest'
import type { TimelineEvent } from '../types/incident'

describe('Incident Timeline Logic', () => {
  it('chronologically sorts events based on user-entered event occurrence time', () => {
    const events: TimelineEvent[] = [
      {
        id: 'EVT-003',
        incidentId: 'INC-001',
        timestamp: '2026-10-15T14:00:00Z',
        enteredAt: '2026-10-15T15:00:00Z',
        title: 'Containment Completed',
        description: '',
        category: 'Containment',
      },
      {
        id: 'EVT-001',
        incidentId: 'INC-001',
        timestamp: '2026-10-15T08:00:00Z',
        enteredAt: '2026-10-15T15:05:00Z', // Logged later in the day
        title: 'Adversary Initial Entry',
        description: '',
        category: 'Detection',
      },
      {
        id: 'EVT-002',
        incidentId: 'INC-001',
        timestamp: '2026-10-15T10:30:00Z',
        enteredAt: '2026-10-15T11:00:00Z',
        title: 'SIEM Alert Flagged',
        description: '',
        category: 'Triage',
      },
    ];

    const sortedAsc = [...events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    expect(sortedAsc[0].id).toBe('EVT-001');
    expect(sortedAsc[1].id).toBe('EVT-002');
    expect(sortedAsc[2].id).toBe('EVT-003');

    // Verify dual timestamps exist and differ
    expect(sortedAsc[0].timestamp).not.toBe(sortedAsc[0].enteredAt);
  });

  it('filters timeline events by operational category', () => {
    const events: TimelineEvent[] = [
      {
        id: 'EVT-001',
        incidentId: 'INC-001',
        timestamp: '2026-10-15T08:00:00Z',
        enteredAt: '2026-10-15T08:00:00Z',
        title: 'Event 1',
        description: '',
        category: 'Detection',
      },
      {
        id: 'EVT-002',
        incidentId: 'INC-001',
        timestamp: '2026-10-15T09:00:00Z',
        enteredAt: '2026-10-15T09:00:00Z',
        title: 'Event 2',
        description: '',
        category: 'Containment',
      },
    ];

    const containmentOnly = events.filter((e) => e.category === 'Containment');
    expect(containmentOnly.length).toBe(1);
    expect(containmentOnly[0].id).toBe('EVT-002');
  });
});
