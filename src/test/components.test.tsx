import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SeverityBadge, StatusBadge, PriorityBadge } from '../components/common/Badge'
import { StatCard } from '../components/dashboard/StatCard'
import { EmptyState, FirstTimeWelcomeCard } from '../components/common/EmptyState'
import { IncidentReport } from '../components/report/IncidentReport'
import type { Incident } from '../types/incident'

describe('UI Component Suite', () => {
  it('renders SeverityBadge with accessible label', () => {
    render(<SeverityBadge severity="Critical" />);
    const badge = screen.getByRole('status', { name: /Severity: Critical/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Critical');
  });

  it('renders StatusBadge with accessible label', () => {
    render(<StatusBadge status="Investigating" />);
    const badge = screen.getByRole('status', { name: /Status: Investigating/i });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Investigating');
  });

  it('renders PriorityBadge', () => {
    render(<PriorityBadge priority="High" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders StatCard with metric value and label', () => {
    render(
      <StatCard
        label="Critical Incidents"
        value={12}
        icon={<div>Icon</div>}
        subtitle="Requires immediate response"
        badge={{ text: 'Urgent', variant: 'danger' }}
      />
    );

    expect(screen.getByText('Critical Incidents')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Requires immediate response')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders EmptyState with action buttons', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No Incidents Found"
        description="Your incident registry is empty."
        actionText="Create Incident"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('No Incidents Found')).toBeInTheDocument();
    expect(screen.getByText('Your incident registry is empty.')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Create Incident/i });
    expect(btn).toBeInTheDocument();
  });

  it('renders FirstTimeWelcomeCard with Demo and Create triggers', () => {
    render(
      <FirstTimeWelcomeCard
        onLoadDemo={vi.fn()}
        onCreateIncident={vi.fn()}
      />
    );

    expect(screen.getByText(/Security Incident Response Planner & Operations Hub/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load Demo Scenarios/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New Incident/i })).toBeInTheDocument();
  });

  it('renders formal printable IncidentReport with required sections', () => {
    const mockIncident: Incident = {
      id: 'INC-2026-REPORT-TEST',
      title: 'DDoS Outage on Gateway API',
      type: 'Denial-of-service attack',
      description: 'Massive SYN flood targeted external ingress balancer.',
      severity: 'High',
      status: 'Contained',
      detectedAt: '2026-10-15T08:00:00Z',
      reportedAt: '2026-10-15T08:10:00Z',
      affectedSystems: ['gw-ext-01.corp', 'lb-vip-02'],
      suspectedAttackVector: 'SYN Flood',
      impactAssessment: '15 minutes of packet drop for APAC customers.',
      assignedResponder: 'Network CSIRT',
      tags: ['DDoS', 'Mitigated'],
      responseNotes: 'Edge rate-limiting deployed.',
      createdAt: '2026-10-15T08:10:00Z',
      updatedAt: '2026-10-15T09:00:00Z',
      evidence: [
        {
          id: 'EVD-001',
          incidentId: 'INC-2026-REPORT-TEST',
          evidenceType: 'Network logs',
          description: 'PCAP of initial flood wave',
          sourceSystem: 'gw-ext-01.corp',
          collectedAt: '2026-10-15T08:15:00Z',
          collectorName: 'Net Analyst',
          fileOrRefName: 'flood_capture.pcap',
          sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          storageLocation: 'Secure NAS',
          chainOfCustodyNotes: 'Direct tcpdump capture.',
          recordedAt: '2026-10-15T08:15:00Z',
        },
      ],
      timeline: [
        {
          id: 'EVT-001',
          incidentId: 'INC-2026-REPORT-TEST',
          timestamp: '2026-10-15T08:00:00Z',
          enteredAt: '2026-10-15T08:10:00Z',
          title: 'Traffic Spike Flagged',
          description: 'Bandwidth exceeded 40 Gbps.',
          category: 'Detection',
        },
      ],
    };

    render(<IncidentReport incident={mockIncident} />);

    expect(screen.getByText('DDoS Outage on Gateway API')).toBeInTheDocument();
    expect(screen.getByText('INC-2026-REPORT-TEST')).toBeInTheDocument();
    expect(screen.getByText(/1. Incident Overview & Classification/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Response Actions & Playbook Status/i)).toBeInTheDocument();
    expect(screen.getByText(/3. Forensic Evidence Register/i)).toBeInTheDocument();
    expect(screen.getByText(/4. Incident Timeline & Milestones/i)).toBeInTheDocument();
    expect(screen.getByText(/5. Root Cause & Post-Incident Review Findings/i)).toBeInTheDocument();
    expect(screen.getByText('flood_capture.pcap')).toBeInTheDocument();
  });
});
