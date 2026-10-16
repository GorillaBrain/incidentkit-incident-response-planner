import type { Incident } from '../types/incident'
import { createPlaybookInstance } from './playbooks'

const now = new Date()
const daysAgo = (days: number, hours = 0) => {
  const d = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000) - (hours * 60 * 60 * 1000))
  return d.toISOString()
}

export const DEMO_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-001',
    title: 'LockBit 3.0 Ransomware Outbreak on Finance NAS',
    type: 'Ransomware',
    description: 'Finance department share mounted on srv-fin-nas01 began encrypting .xlsx and .pdf files with .lockbit extension. Ransom note README_RESTORE.txt discovered in accounting directory. Automated file integrity monitor triggered high-severity alert.',
    severity: 'Critical',
    severityAssessment: {
      factors: {
        businessImpact: 'severe',
        affectedScope: 'moderate',
        dataSensitivity: 'critical',
        serviceAvailability: 'major_degradation',
        activeMaliciousActivity: 'confirmed',
        spreadPotential: 'high_wormable',
      },
      result: {
        score: 88,
        suggestedSeverity: 'Critical',
        breakdown: {
          businessImpactPoints: 20,
          affectedScopePoints: 12,
          dataSensitivityPoints: 18,
          serviceAvailabilityPoints: 14,
          activeMaliciousActivityPoints: 14,
          spreadPotentialPoints: 10,
        },
        rationale: [
          'Severe business impact: Critical financial transaction storage impacted.',
          'Critical data sensitivity: Houses unencrypted payroll and quarterly reporting.',
          'Active ongoing malicious activity: Confirmed file renaming process actively running.',
          'High spread potential: Server shares mapped across 80+ workstations.',
        ],
      },
      manuallyOverridden: false,
    },
    status: 'Contained',
    detectedAt: daysAgo(2, 4),
    reportedAt: daysAgo(2, 3),
    affectedSystems: ['srv-fin-nas01.corp', 'srv-ad01.corp', 'wkst-acc-04.corp', 'wkst-acc-07.corp'],
    suspectedAttackVector: 'Compromised VPN credentials followed by PsExec lateral movement',
    impactAssessment: 'Roughly 14,000 accounting records encrypted. Offline backups from 24h prior verified clean. Operational impact high, but contained to Finance subnet.',
    assignedResponder: 'Sarah Chen (Lead CSIRT Analyst)',
    tags: ['Ransomware', 'LockBit', 'Finance', 'EDR-Isolation', 'Tier-1'],
    responseNotes: 'Subnet 10.10.40.0/24 immediately isolated. Active Directory service account svc_backup disabled. Offline tape vault verified offline and untouched.',
    createdAt: daysAgo(2, 3),
    updatedAt: daysAgo(0, 2),
    isDemo: true,
    playbook: (() => {
      const pb = createPlaybookInstance('pb-ransomware');
      if (pb) {
        // Mark first 7 tasks completed
        let count = 0;
        for (const stage of pb.stages) {
          for (const task of stage.tasks) {
            if (count < 7) {
              task.completed = true;
              task.completedAt = daysAgo(1, 12 - count);
              task.notes = 'Verified completed by CSIRT Incident Commander.';
              count++;
            }
          }
        }
      }
      return pb;
    })(),
    evidence: [
      {
        id: 'EVD-001',
        incidentId: 'INC-2026-001',
        evidenceType: 'File hashes',
        description: 'SHA-256 hash of malicious encryptor payload discovered in C:\\Windows\\Temp\\msupdate.exe',
        sourceSystem: 'wkst-acc-04.corp',
        collectedAt: daysAgo(2, 2),
        collectorName: 'Sarah Chen',
        fileOrRefName: 'msupdate.exe',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        storageLocation: 'Secure Evidence Storage /cases/2026/INC-001/binaries/',
        chainOfCustodyNotes: 'Transferred via write-blocked USB drive to forensics sandbox. Original timestamp preserved.',
        recordedAt: daysAgo(2, 2),
      },
      {
        id: 'EVD-002',
        incidentId: 'INC-2026-001',
        evidenceType: 'System logs',
        description: 'Windows Security Event Log showing Event ID 4624 (Logon) followed by 7045 (New Service Installed) via PsExec',
        sourceSystem: 'srv-fin-nas01.corp',
        collectedAt: daysAgo(2, 1),
        collectorName: 'Marcus Vance',
        fileOrRefName: 'Security_EventLog_srv-fin-nas01.evtx',
        sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        storageLocation: 'NAS Evidence Store /cases/2026/INC-001/logs/',
        chainOfCustodyNotes: 'Exported via PowerShell script with SHA-256 validation log.',
        recordedAt: daysAgo(2, 1),
      },
    ],
    timeline: [
      {
        id: 'EVT-001',
        incidentId: 'INC-2026-001',
        timestamp: daysAgo(2, 5),
        enteredAt: daysAgo(2, 3),
        title: 'Initial Access via VPN',
        description: 'Adversary logged into corporate SSL-VPN using compromised contractor credentials from IP 185.220.101.5 (Tor Exit Node).',
        category: 'Detection',
      },
      {
        id: 'EVT-002',
        incidentId: 'INC-2026-001',
        timestamp: daysAgo(2, 4),
        enteredAt: daysAgo(2, 3),
        title: 'High-Velocity Encryption Alert',
        description: 'SIEM alert triggered: 500+ file renames per minute detected on srv-fin-nas01 with extension .lockbit.',
        category: 'Triage',
      },
      {
        id: 'EVT-003',
        incidentId: 'INC-2026-001',
        timestamp: daysAgo(2, 3),
        enteredAt: daysAgo(2, 2),
        title: 'CSIRT Mobilization & Network Containment',
        description: 'Network engineering severed Finance VLAN 40 trunk port. EDR host isolation applied to 4 endpoints.',
        category: 'Containment',
        associatedEvidenceId: 'EVD-002',
      },
      {
        id: 'EVT-004',
        incidentId: 'INC-2026-001',
        timestamp: daysAgo(1, 10),
        enteredAt: daysAgo(1, 8),
        title: 'Payload Binary Acquired & Hashed',
        description: 'Acquired msupdate.exe from workstation staging directory. Extracted SHA-256 hash and submitted to threat intel feed.',
        category: 'Containment',
        associatedEvidenceId: 'EVD-001',
      },
    ],
  },
  {
    id: 'INC-2026-002',
    title: 'Executive AiTM Spearphishing Campaign Targeting C-Suite',
    type: 'Phishing',
    description: 'CEO and CFO received highly targeted emails impersonating Board of Directors audit committee requesting review of "Confidential 2026 Stock Plan.pdf". Embedded link routed through an Adversary-in-the-Middle (AiTM) reverse proxy bypassing SMS MFA.',
    severity: 'High',
    severityAssessment: {
      factors: {
        businessImpact: 'moderate',
        affectedScope: 'minimal',
        dataSensitivity: 'critical',
        serviceAvailability: 'normal',
        activeMaliciousActivity: 'confirmed',
        spreadPotential: 'moderate',
      },
      result: {
        score: 64,
        suggestedSeverity: 'High',
        breakdown: {
          businessImpactPoints: 12,
          affectedScopePoints: 4,
          dataSensitivityPoints: 18,
          serviceAvailabilityPoints: 4,
          activeMaliciousActivityPoints: 14,
          spreadPotentialPoints: 12,
        },
        rationale: [
          'Targeted C-suite accounts hold global enterprise tenant privileges.',
          'AiTM reverse proxy allowed session cookie interception.',
          'Active session token used to access CFO mailbox before containment.',
        ],
      },
      manuallyOverridden: false,
    },
    status: 'Investigating',
    detectedAt: daysAgo(1, 6),
    reportedAt: daysAgo(1, 5),
    affectedSystems: ['cfo-mailbox@corp.com', 'ceo-mailbox@corp.com', 'entra-id-tenant'],
    suspectedAttackVector: 'AiTM reverse proxy phishing URL (hxxps://board-secure-portal[.]top/auth)',
    impactAssessment: 'CFO approved token. Attacker logged in for 11 minutes and created an inbox rule moving "wire transfer" emails to Deleted Items. No unauthorized wire transfers initiated.',
    assignedResponder: 'David Miller (Senior Security Engineer)',
    tags: ['Phishing', 'AiTM', 'Executive', 'EntraID', 'SessionTheft'],
    responseNotes: 'Forced session revocation on all executive accounts. Deleted rogue inbox rule. Upgraded executives to hardware security keys (FIDO2).',
    createdAt: daysAgo(1, 5),
    updatedAt: daysAgo(0, 1),
    isDemo: true,
    playbook: (() => {
      const pb = createPlaybookInstance('pb-phishing');
      if (pb) {
        let count = 0;
        for (const stage of pb.stages) {
          for (const task of stage.tasks) {
            if (count < 8) {
              task.completed = true;
              task.completedAt = daysAgo(0, 12 - count);
              count++;
            }
          }
        }
      }
      return pb;
    })(),
    evidence: [
      {
        id: 'EVD-003',
        incidentId: 'INC-2026-002',
        evidenceType: 'Email headers',
        description: 'Raw email headers from spoofed message with failed SPF/DKIM validation',
        sourceSystem: 'Exchange Online Protection Gateway',
        collectedAt: daysAgo(1, 5),
        collectorName: 'David Miller',
        fileOrRefName: 'board_review_phish.eml',
        sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        storageLocation: 'Secure Evidence Store /cases/2026/INC-002/emails/',
        chainOfCustodyNotes: 'Extracted directly from message trace log by Exchange administrator.',
        recordedAt: daysAgo(1, 5),
      },
    ],
    timeline: [
      {
        id: 'EVT-005',
        incidentId: 'INC-2026-002',
        timestamp: daysAgo(1, 7),
        enteredAt: daysAgo(1, 5),
        title: 'Phishing Email Delivered',
        description: 'Inbound message from spoofed address audit-committee@corp-board[.]net delivered to 3 executive inboxes.',
        category: 'Detection',
        associatedEvidenceId: 'EVD-003',
      },
      {
        id: 'EVT-006',
        incidentId: 'INC-2026-002',
        timestamp: daysAgo(1, 6),
        enteredAt: daysAgo(1, 5),
        title: 'User Clicks & Authentication Proxy',
        description: 'CFO clicked link and entered credentials. AiTM proxy intercepted session token and authenticated to Microsoft 365 from IP 45.142.214.12.',
        category: 'Triage',
      },
      {
        id: 'EVT-007',
        incidentId: 'INC-2026-002',
        timestamp: daysAgo(1, 5),
        enteredAt: daysAgo(1, 4),
        title: 'Global Session Revocation Executed',
        description: 'Security team revoked all active refresh tokens and forced immediate password reset.',
        category: 'Containment',
      },
    ],
  },
  {
    id: 'INC-2026-003',
    title: 'Compromised SSH Jumpbox & Internal Port Reconnaissance',
    type: 'Suspicious network activity',
    description: 'DMZ bastion host srv-jump01 observed initiating aggressive TCP SYN sweeps across internal subnets 10.0.0.0/16 targeting port 445 (SMB) and 3389 (RDP). Inbound SSH session traced to unrotated root key.',
    severity: 'High',
    severityAssessment: {
      factors: {
        businessImpact: 'moderate',
        affectedScope: 'moderate',
        dataSensitivity: 'internal',
        serviceAvailability: 'normal',
        activeMaliciousActivity: 'confirmed',
        spreadPotential: 'moderate',
      },
      result: {
        score: 58,
        suggestedSeverity: 'High',
        breakdown: {
          businessImpactPoints: 10,
          affectedScopePoints: 12,
          dataSensitivityPoints: 8,
          serviceAvailabilityPoints: 4,
          activeMaliciousActivityPoints: 14,
          spreadPotentialPoints: 10,
        },
        rationale: [
          'Internal port sweeps indicate active reconnaissance phase of attack chain.',
          'Host has dual-homed network interface into production subnets.',
        ],
      },
      manuallyOverridden: false,
    },
    status: 'Recovering',
    detectedAt: daysAgo(3, 8),
    reportedAt: daysAgo(3, 7),
    affectedSystems: ['srv-jump01.dmz', 'firewall-core01'],
    suspectedAttackVector: 'Leaked developer SSH private key uploaded to public GitHub gist',
    impactAssessment: 'Port scanning detected and halted before any internal servers were successfully breached. Bastion host completely redeployed with hardened configuration.',
    assignedResponder: 'Alex Rivera (Infrastructure Security)',
    tags: ['SSH', 'DMZ', 'PortScan', 'Bastion', 'Hardening'],
    responseNotes: 'Bastion host replaced with immutable Teleport access proxy. All legacy SSH authorized_keys rotated across all environments.',
    createdAt: daysAgo(3, 7),
    updatedAt: daysAgo(0, 4),
    isDemo: true,
    playbook: (() => {
      const pb = createPlaybookInstance('pb-network');
      if (pb) {
        for (const stage of pb.stages) {
          if (stage.id !== 'stg-pir') {
            for (const task of stage.tasks) {
              task.completed = true;
              task.completedAt = daysAgo(1, 2);
            }
          }
        }
      }
      return pb;
    })(),
    evidence: [
      {
        id: 'EVD-004',
        incidentId: 'INC-2026-003',
        evidenceType: 'Network logs',
        description: 'Firewall flow logs exhibiting 12,000 SYN packets in 90 seconds from 192.168.1.10',
        sourceSystem: 'firewall-core01',
        collectedAt: daysAgo(3, 7),
        collectorName: 'Alex Rivera',
        fileOrRefName: 'firewall_flows_20261014.csv',
        sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        storageLocation: 'Evidence Store /cases/2026/INC-003/network/',
        chainOfCustodyNotes: 'Direct export from Palo Alto Panorama management console.',
        recordedAt: daysAgo(3, 7),
      },
    ],
    timeline: [
      {
        id: 'EVT-008',
        incidentId: 'INC-2026-003',
        timestamp: daysAgo(3, 9),
        enteredAt: daysAgo(3, 7),
        title: 'Unauthorized SSH Login',
        description: 'SSH connection accepted on srv-jump01 using root key from unknown IP in Romania.',
        category: 'Detection',
      },
      {
        id: 'EVT-009',
        incidentId: 'INC-2026-003',
        timestamp: daysAgo(3, 8),
        enteredAt: daysAgo(3, 7),
        title: 'Internal Sweep Triggered IDS Rule',
        description: 'Zeek network IDS flagged mass TCP connection attempts on port 445.',
        category: 'Triage',
        associatedEvidenceId: 'EVD-004',
      },
      {
        id: 'EVT-010',
        incidentId: 'INC-2026-003',
        timestamp: daysAgo(3, 6),
        enteredAt: daysAgo(3, 5),
        title: 'Host Isolated & Revoked Keys',
        description: 'Firewall rule disabled bastion routing; all SSH keys wiped.',
        category: 'Containment',
      },
    ],
  },
  {
    id: 'INC-2026-004',
    title: 'Misconfigured Public S3 Bucket Housing Legacy Customer Data',
    type: 'Data breach',
    description: 'Cloud Security Posture Management (CSPM) scanner identified an AWS S3 bucket named corp-analytics-archive-prod configured with public READ permissions via an overly permissive bucket ACL.',
    severity: 'Medium',
    severityAssessment: {
      factors: {
        businessImpact: 'low',
        affectedScope: 'limited',
        dataSensitivity: 'confidential',
        serviceAvailability: 'normal',
        activeMaliciousActivity: 'none',
        spreadPotential: 'isolated',
      },
      result: {
        score: 38,
        suggestedSeverity: 'Medium',
        breakdown: {
          businessImpactPoints: 6,
          affectedScopePoints: 6,
          dataSensitivityPoints: 12,
          serviceAvailabilityPoints: 2,
          activeMaliciousActivityPoints: 2,
          spreadPotentialPoints: 2,
        },
        rationale: [
          'Confidential customer analytics archive exposed publicly for 48 hours.',
          'CloudTrail logs show no external download activity except the security scanner.',
        ],
      },
      manuallyOverridden: false,
    },
    status: 'Resolved',
    detectedAt: daysAgo(6, 2),
    reportedAt: daysAgo(6, 1),
    affectedSystems: ['corp-analytics-archive-prod (S3)'],
    suspectedAttackVector: 'Misconfigured Terraform script during storage migration',
    impactAssessment: 'Access logs confirmed only authorized vulnerability scanner accessed the bucket. Zero external downloads occurred. No reportable regulatory breach occurred.',
    assignedResponder: 'Maya Patel (Cloud Security Lead)',
    tags: ['Cloud', 'AWS', 'S3', 'CSPM', 'Resolved'],
    responseNotes: 'Enabled AWS S3 Block Public Access at the organization root level. Added Terraform drift detection in CI/CD pipeline.',
    createdAt: daysAgo(6, 1),
    updatedAt: daysAgo(4, 0),
    isDemo: true,
    playbook: (() => {
      const pb = createPlaybookInstance('pb-databreach');
      if (pb) {
        for (const stage of pb.stages) {
          for (const task of stage.tasks) {
            task.completed = true;
            task.completedAt = daysAgo(5, 4);
          }
        }
      }
      return pb;
    })(),
    evidence: [
      {
        id: 'EVD-005',
        incidentId: 'INC-2026-004',
        evidenceType: 'System logs',
        description: 'AWS CloudTrail S3 Data Events log demonstrating only 3 GetObject calls from internal scanner IP',
        sourceSystem: 'AWS CloudTrail',
        collectedAt: daysAgo(6, 0),
        collectorName: 'Maya Patel',
        fileOrRefName: 'cloudtrail_s3_events_audit.json',
        sha256Hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        storageLocation: 'Evidence S3 Archive /evidence/2026/INC-004/',
        chainOfCustodyNotes: 'Downloaded from CloudWatch Logs with AWS KMS cryptographic signature.',
        recordedAt: daysAgo(6, 0),
      },
    ],
    timeline: [
      {
        id: 'EVT-011',
        incidentId: 'INC-2026-004',
        timestamp: daysAgo(6, 3),
        enteredAt: daysAgo(6, 1),
        title: 'CSPM Alert Triggered',
        description: 'Wiz scanner detected s3:GetObject permission granted to AllUsers.',
        category: 'Detection',
      },
      {
        id: 'EVT-012',
        incidentId: 'INC-2026-004',
        timestamp: daysAgo(6, 2),
        enteredAt: daysAgo(6, 1),
        title: 'S3 Public Access Blocked',
        description: 'Applied bucket policy restriction via AWS CLI in 4 minutes.',
        category: 'Containment',
      },
      {
        id: 'EVT-013',
        incidentId: 'INC-2026-004',
        timestamp: daysAgo(5, 5),
        enteredAt: daysAgo(5, 4),
        title: 'Access Log Audit Completed',
        description: 'Verified no malicious actors queried bucket before mitigation.',
        category: 'Resolution',
        associatedEvidenceId: 'EVD-005',
      },
    ],
    postIncidentReview: {
      completed: true,
      completedAt: daysAgo(4, 2),
      conductedBy: 'Maya Patel & DevSecOps Lead',
      whatHappened: 'A legacy data migration script applied an outdated Terraform template that omitted the aws_s3_bucket_public_access_block resource.',
      howDetected: 'Automated Cloud Security Posture Management (CSPM) policy evaluation.',
      rootCause: 'Lack of automated pre-commit linting (tfsec / checkov) in the data engineering team repository.',
      whatWorkedWell: 'Fast automated detection and sub-10 minute containment by the cloud security on-call.',
      whatWentWrong: 'Development team deployed directly to staging/prod without peer security approval.',
      businessImpactSummary: 'Zero financial or customer impact. Zero external downloads occurred.',
      delayedActions: 'None. Containment occurred within SLA.',
      improvementsNeeded: 'Enforce mandatory pre-merge static code analysis for all infrastructure-as-code pull requests.',
      preventiveMeasures: 'Service Control Policy (SCP) at AWS Organizations level forbidding any S3 bucket creation without public access block enabled.',
      keyLessonsLearned: 'Decentralized cloud access without guardrails creates predictable configuration drift.',
      actionItems: [
        {
          id: 'act-001',
          title: 'Implement AWS Organization SCP for S3 Block Public Access',
          owner: 'Maya Patel',
          priority: 'High',
          targetDate: '2026-11-01',
          status: 'Completed',
          notes: 'SCP deployed and tested in staging account.',
        },
        {
          id: 'act-002',
          title: 'Add Checkov IaC security scanner to data engineering CI/CD pipeline',
          owner: 'Kevin Zhao (DevOps)',
          priority: 'High',
          targetDate: '2026-11-15',
          status: 'In Progress',
          notes: 'Integrating with GitHub Actions.',
        },
      ],
    },
  },
  {
    id: 'INC-2026-005',
    title: 'Volumetric DNS Amplification Attack against Public Customer API',
    type: 'Denial-of-service attack',
    description: 'Customer login portal api.customer.corp experienced brief packet loss due to a 35 Gbps UDP DNS amplification DDoS attack originating from open resolver reflection.',
    severity: 'Low',
    severityAssessment: {
      factors: {
        businessImpact: 'low',
        affectedScope: 'minimal',
        dataSensitivity: 'public',
        serviceAvailability: 'minor_degradation',
        activeMaliciousActivity: 'confirmed',
        spreadPotential: 'isolated',
      },
      result: {
        score: 22,
        suggestedSeverity: 'Low',
        breakdown: {
          businessImpactPoints: 4,
          affectedScopePoints: 4,
          dataSensitivityPoints: 2,
          serviceAvailabilityPoints: 4,
          activeMaliciousActivityPoints: 6,
          spreadPotentialPoints: 2,
        },
        rationale: [
          'Brief 4-minute latency spike before Cloudflare automated mitigation engaged.',
          'No backend compromise, zero data exposure.',
        ],
      },
      manuallyOverridden: false,
    },
    status: 'Closed',
    detectedAt: daysAgo(10, 4),
    reportedAt: daysAgo(10, 3),
    affectedSystems: ['api.customer.corp'],
    suspectedAttackVector: 'DNS Amplification UDP Flood (Port 53 reflectors)',
    impactAssessment: 'Customer API dropped 3.2% of requests for 4 minutes before Edge scrubbing rules filtered the UDP traffic. Normal operations resumed immediately.',
    assignedResponder: 'SOC Network Guard Team',
    tags: ['DDoS', 'Cloudflare', 'Network', 'Resolved', 'Closed'],
    responseNotes: 'Edge rate-limiting rule adjusted. Upstream transit scrubbing verified.',
    createdAt: daysAgo(10, 3),
    updatedAt: daysAgo(8, 0),
    isDemo: true,
    evidence: [],
    timeline: [
      {
        id: 'EVT-014',
        incidentId: 'INC-2026-005',
        timestamp: daysAgo(10, 4),
        enteredAt: daysAgo(10, 3),
        title: 'DDoS Attack Spike Detected',
        description: 'Upstream edge provider detected 35 Gbps UDP spike.',
        category: 'Detection',
      },
      {
        id: 'EVT-015',
        incidentId: 'INC-2026-005',
        timestamp: daysAgo(10, 3),
        enteredAt: daysAgo(10, 3),
        title: 'Auto-Scrubbing Activated',
        description: 'Cloudflare Magic Transit mitigated 99.8% of volumetric UDP traffic.',
        category: 'Containment',
      },
      {
        id: 'EVT-016',
        incidentId: 'INC-2026-005',
        timestamp: daysAgo(10, 2),
        enteredAt: daysAgo(10, 2),
        title: 'Traffic Normalized & Incident Closed',
        description: 'Latencies returned to normal 32ms baseline.',
        category: 'Resolution',
      },
    ],
    postIncidentReview: {
      completed: true,
      completedAt: daysAgo(8, 2),
      conductedBy: 'SOC Network Lead',
      whatHappened: 'Volumetric DNS reflection attack targeted public customer API.',
      howDetected: 'Edge CDN automatic anomaly detection.',
      rootCause: 'Targeted DDoS extortion / script-kiddie scan against public domain.',
      whatWorkedWell: 'Edge scrubbing absorbed attack with negligible user disruption.',
      whatWentWrong: 'No human escalation needed, but alerting threshold was slightly sensitive.',
      businessImpactSummary: 'Negligible.',
      delayedActions: 'None.',
      improvementsNeeded: 'Tune edge DDoS sensitivity thresholds to prevent unnecessary pager duty alerts.',
      preventiveMeasures: 'Continuous DDoS simulation testing.',
      keyLessonsLearned: 'Edge architecture functioned as designed.',
      actionItems: [],
    },
  },
];
