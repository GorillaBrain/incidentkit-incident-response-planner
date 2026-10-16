export interface EducationalTopic {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  summary: string;
  keyTakeaways: string[];
  content: {
    heading: string;
    body: string;
  }[];
}

export const EDUCATIONAL_TOPICS: EducationalTopic[] = [
  {
    id: 'ir-lifecycle',
    title: 'Incident Response Lifecycle: NIST vs SANS',
    subtitle: 'Standardized operational frameworks for defensive cybersecurity teams',
    iconName: 'RotateCcw',
    summary: 'Incident Response (IR) is the structured methodology an organization uses to detect, contain, investigate, and recover from cybersecurity incidents while minimizing operational disruption and financial loss.',
    keyTakeaways: [
      'NIST SP 800-61 Rev 2 defines a 4-phase cyclic model: Preparation; Detection & Analysis; Containment, Eradication & Recovery; Post-Incident Activity.',
      'The SANS Institute 6-step model breaks execution down into Preparation, Identification, Containment, Eradication, Recovery, and Lessons Learned.',
      'Incident response is iterative: discovery during eradication often loops back to new identification and containment activities.',
    ],
    content: [
      {
        heading: 'Why Frameworks Matter in a Crisis',
        body: 'During an active attack, cognitive overload and panic cause responders to skip critical forensic steps—such as isolating a machine before grabbing RAM or rebooting an infected host. Adhering to structured frameworks ensures actions are repeatable, defensible in court, and prioritized effectively.',
      },
      {
        heading: 'The SANS 6-Step Model Explained',
        body: '1. Preparation: Tooling, training, and policy.\n2. Identification (Triage): Scoping the severity, patient zero, and IOCs.\n3. Containment: Short-term isolation to stop the bleeding without destroying live evidence.\n4. Eradication: Removing rootkit persistence, malware binaries, and rogue credentials.\n5. Recovery: Validating backups, restoring services, and monitoring for resurgence.\n6. Lessons Learned: Documenting timelines, root causes, and updating defensive controls.',
      },
    ],
  },
  {
    id: 'phases-deepdive',
    title: 'Containment vs Eradication vs Recovery',
    subtitle: 'Avoiding common mistakes during active response',
    iconName: 'ShieldAlert',
    summary: 'A frequent junior responder mistake is rushing to wipe a computer or delete a malicious file immediately upon detection, which destroys live evidence and triggers attacker retaliation before their lateral presence is fully scoped.',
    keyTakeaways: [
      'Containment buys time: It stops the fire from spreading without necessarily extinguishing it.',
      'Eradication removes the disease: It ensures every persistence mechanism (C2 backdoors, rogue admins, scheduled tasks) is neutralized.',
      'Recovery tests resilience: Systems are returned to production under enhanced surveillance.',
    ],
    content: [
      {
        heading: 'The Dangers of Premature Eradication',
        body: 'If you terminate an adversary\'s visible malware before finding their secondary beacon or web shell, they will realize they have been spotted. They may immediately deploy ransomware, dump credentials, or switch to backup access mechanisms. Containment must isolate the adversary while responders silently map their entire footprint.',
      },
      {
        heading: 'Safe Containment Strategies',
        body: 'Prefer EDR network quarantine or switch VLAN isolation over pulling power cables. Powering off a machine instantly wipes volatile RAM, caches, open network sockets, and running process trees that hold unencrypted encryption keys or injected payloads.',
      },
    ],
  },
  {
    id: 'evidence-preservation',
    title: 'Evidence Preservation & RFC 3227',
    subtitle: 'Order of volatility, cryptographic hashing, and chain-of-custody',
    iconName: 'Database',
    summary: 'Forensic integrity relies on preserving digital evidence without altering its state. Digital evidence is fragile, easily corrupted, and subject to intense scrutiny in legal, regulatory, or insurance proceedings.',
    keyTakeaways: [
      'RFC 3227 establishes the Order of Volatility: capture the most ephemeral data first.',
      'Cryptographic hashing (SHA-256) proves that an evidence file was not altered after collection.',
      'Chain-of-custody tracks who collected the evidence, when, where it was stored, and who had access.',
    ],
    content: [
      {
        heading: 'RFC 3227 Order of Volatility',
        body: 'Collect evidence in order of fastest decay to slowest decay:\n1. Registers and CPU cache\n2. Routing tables, ARP cache, process table, kernel statistics, volatile RAM\n3. Temporary file systems, swap space\n4. Disk storage and persistent media\n5. Remote logging and network monitoring data\n6. Physical configuration and network topology\n7. Archival media and offline backups.',
      },
      {
        heading: 'Cryptographic Hashing vs Chain of Custody',
        body: 'A SHA-256 hash verifies integrity: if even a single bit in a 10GB log file changes, the hash changes completely. However, a hash alone does not prove authenticity or who held the file. Chain-of-custody documentation bridges that gap by legally recording the custodial lifecycle of every artifact.',
      },
    ],
  },
  {
    id: 'timeline-documentation',
    title: 'Incident Timelines & Operational Rigor',
    subtitle: 'Why time synchronization and dual-timestamping are vital',
    iconName: 'Clock',
    summary: 'An incident timeline is the central narrative spine of any response. It demonstrates when an attack occurred, how quickly the organization responded, and where delays occurred.',
    keyTakeaways: [
      'Always distinguish between Event Occurrence Time (when it happened) and Record Entry Time (when you logged it).',
      'Timestamps in IncidentKit are decision-support logs, not independently verified NTP proofs.',
      'Accurate timelines expose adversary dwell time and validate SLA compliance.',
    ],
    content: [
      {
        heading: 'Dual Timestamping in IncidentKit',
        body: 'Security audits require distinguishing between when an attacker accessed a database (e.g. 02:14 UTC) and when an analyst documented that discovery in the ticketing system (e.g. 08:30 UTC). IncidentKit explicitly captures both timestamps to preserve narrative truth.',
      },
      {
        heading: 'Dwell Time & MTTD / MTTR',
        body: 'Mean Time to Detect (MTTD) measures the gap between breach occurrence and first alert. Mean Time to Remediate (MTTR) measures the gap between detection and full containment. Clear timelines highlight bottlenecks in alerting, escalation, and playbook execution.',
      },
    ],
  },
  {
    id: 'severity-vs-impact',
    title: 'Technical Severity vs Business Impact',
    subtitle: 'Why a CVSS 10 vulnerability might be a low-priority incident',
    iconName: 'Sliders',
    summary: 'Technical severity measures how severe an exploit or payload is; business impact measures how much financial, operational, or legal damage the organization actually suffers.',
    keyTakeaways: [
      'A critical remote code execution vulnerability on an isolated sandbox has high technical severity but low business impact.',
      'A simple credential compromise of a billing administrator account has moderate technical severity but catastrophic business impact.',
      'Incident prioritization must weigh both technical indicators and mission criticality.',
    ],
    content: [
      {
        heading: 'The 6 Multi-Factor Evaluation Criteria',
        body: 'IncidentKit uses a 6-factor assessment matrix:\n1. Business Impact: Core revenue or operational disruption.\n2. Scope: Number of endpoints, subnets, or users impacted.\n3. Data Sensitivity: Exposure of customer PII, trade secrets, or healthcare records.\n4. Service Availability: Total outage vs minor degradation.\n5. Active Malicious Activity: Confirmed live hands-on-keyboard vs dormant artifact.\n6. Spread Potential: Wormable or automated lateral movement capabilities.',
      },
    ],
  },
  {
    id: 'post-incident-reviews',
    title: 'Post-Incident Review & Blameless Culture',
    subtitle: 'Transforming crisis into structural defense improvements',
    iconName: 'FileCheck',
    summary: 'The Post-Incident Review (PIR or Post-Mortem) is the single most valuable activity in the incident lifecycle. Without a rigorous PIR, organizations are doomed to repeat identical security failures.',
    keyTakeaways: [
      'Foster a blameless culture: Focus on systemic, tooling, and process gaps rather than human error.',
      'Every PIR must produce concrete, assigned follow-up action items with owners and deadlines.',
      'Unresolved action items should be continuously tracked on executive dashboards.',
    ],
    content: [
      {
        heading: 'The 10 Core Questions of a Thorough PIR',
        body: 'A complete review answers: 1) What happened? 2) How was it detected? 3) What was the root cause? 4) What worked well? 5) What went wrong? 6) What was the true business impact? 7) Which response actions were delayed? 8) What process gaps existed? 9) What technical controls prevent recurrence? 10) What lessons must be retained?',
      },
    ],
  },
];
