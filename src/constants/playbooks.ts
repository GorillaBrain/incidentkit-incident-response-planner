import type { PlaybookInstance, IncidentCategory } from '../types/incident'

export interface PlaybookTemplate {
  id: string;
  title: string;
  category: IncidentCategory;
  description: string;
  overview: string;
  stages: {
    id: string;
    name: string;
    description: string;
    tasks: {
      id: string;
      title: string;
      explanation: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
    }[];
  }[];
}

export const PLAYBOOK_TEMPLATES: PlaybookTemplate[] = [
  {
    id: 'pb-phishing',
    title: 'Phishing Incident Response Playbook',
    category: 'Phishing',
    description: 'Standard operating procedure for investigating, mitigating, and neutralizing spearphishing, credential harvesting, and malicious message campaigns.',
    overview: 'Covers user-reported email triage, header extraction, message purge across mailboxes, credential reset for affected users, and security awareness feedback.',
    stages: [
      {
        id: 'stg-prep',
        name: 'Preparation & Initial Assessment',
        description: 'Verify report authenticity, extract raw email headers, and quarantine message artifacts.',
        tasks: [
          {
            id: 'phish-01',
            title: 'Export raw RFC 822 email (.eml or .msg) safely',
            explanation: 'Export the complete message with headers without opening embedded links or executing attachments. Store in an isolated folder.',
            priority: 'High',
          },
          {
            id: 'phish-02',
            title: 'Inspect SPF, DKIM, and DMARC authentication verdicts',
            explanation: 'Analyze Authentication-Results headers to check whether the sender domain was spoofed or failed cryptographic verification.',
            priority: 'Medium',
          },
          {
            id: 'phish-03',
            title: 'Identify targeted recipients and campaign blast radius',
            explanation: 'Query the email security gateway / mail server logs for identical Subject lines, Sender Envelope addresses, or Message-IDs to find all recipients.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-id',
        name: 'Identification & Triage',
        description: 'Analyze message payload (hyperlinks, attachments) in an isolated sandbox or URL inspection tool.',
        tasks: [
          {
            id: 'phish-04',
            title: 'Extract and defang all URLs and sender domains',
            explanation: 'Convert links to defanged format (e.g. hxxps://evil[.]com) to prevent accidental clicking. Check against threat intelligence feeds.',
            priority: 'High',
          },
          {
            id: 'phish-05',
            title: 'Calculate cryptographic hashes for any attachments',
            explanation: 'Generate SHA-256 hashes of any attached files and query known threat databases. Do not execute in production.',
            priority: 'High',
          },
          {
            id: 'phish-06',
            title: 'Interview reporting user on interactions',
            explanation: 'Determine whether the user clicked the link, entered corporate credentials, approved MFA prompts, or opened attachments.',
            priority: 'Critical',
          },
        ],
      },
      {
        id: 'stg-contain',
        name: 'Containment',
        description: 'Halt campaign spread, purge emails, and secure compromised user accounts.',
        tasks: [
          {
            id: 'phish-07',
            title: 'Purge or recall phishing message from all recipient mailboxes',
            explanation: 'Execute administrative message retraction or compliance purge to prevent other employees from opening the lure.',
            priority: 'Critical',
          },
          {
            id: 'phish-08',
            title: 'Add malicious domains/IPs to web gateway and firewall blocklists',
            explanation: 'Block egress HTTP/DNS traffic to the credential harvesting site across corporate proxies and perimeter firewalls.',
            priority: 'High',
          },
          {
            id: 'phish-09',
            title: 'Revoke active sessions and reset password for clicking users',
            explanation: 'If credentials were entered, immediately invalidate existing tokens/sessions, force password reset, and verify MFA device binding.',
            priority: 'Critical',
          },
        ],
      },
      {
        id: 'stg-erad',
        name: 'Eradication',
        description: 'Remove persistent artifacts, malicious inbox rules, and unauthorized access tokens.',
        tasks: [
          {
            id: 'phish-10',
            title: 'Audit user mailbox for unauthorized forwarding or delegate rules',
            explanation: 'Check for hidden inbox rules that automatically forward incoming emails to external addresses or move security alerts to RSS folders.',
            priority: 'High',
          },
          {
            id: 'phish-11',
            title: 'Inspect OAuth application consents and enterprise app grants',
            explanation: 'Verify whether user authorized malicious third-party OAuth apps ("illicit consent grant") that retain persistent API access.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-rec',
        name: 'Recovery',
        description: 'Restore normal account state, monitor sign-in logs, and confirm no lateral activity.',
        tasks: [
          {
            id: 'phish-12',
            title: 'Restore account access and verify MFA re-enrollment',
            explanation: 'Assist user with clean device setup, secure password reset, and hardware token / authenticator app confirmation.',
            priority: 'Medium',
          },
          {
            id: 'phish-13',
            title: 'Monitor affected account sign-in logs for 48-72 hours',
            explanation: 'Watch for anomalous geographic locations, impossible travel alerts, or unusual user-agent strings.',
            priority: 'Medium',
          },
        ],
      },
      {
        id: 'stg-pir',
        name: 'Post-Incident Review',
        description: 'Document findings, update mail filtering rules, and provide constructive security feedback.',
        tasks: [
          {
            id: 'phish-14',
            title: 'Tune mail gateway anti-spoofing and heuristic filters',
            explanation: 'Submit phishing indicators to mail filter vendor or add regex rules to stop similar variants.',
            priority: 'Medium',
          },
          {
            id: 'phish-15',
            title: 'Send positive acknowledgement and awareness tip to reporting user',
            explanation: 'Reinforce positive security reporting culture by thanking the employee for prompt notification.',
            priority: 'Low',
          },
        ],
      },
    ],
  },
  {
    id: 'pb-malware',
    title: 'Malware Infection Response Playbook',
    category: 'Malware infection',
    description: 'Step-by-step procedures to triage, isolate, investigate, and eradicate malware infections on endpoints and servers.',
    overview: 'Guidance on memory acquisition, process tree analysis, host network isolation, persistence removal, and safe system reimaging.',
    stages: [
      {
        id: 'stg-prep',
        name: 'Preparation & Initial Assessment',
        description: 'Confirm malware detection alert, determine affected host criticality, and establish communication.',
        tasks: [
          {
            id: 'mal-01',
            title: 'Verify EDR / Antivirus detection alert metadata',
            explanation: 'Note the triggering process path, parent process, detection rule name, and command-line arguments.',
            priority: 'High',
          },
          {
            id: 'mal-02',
            title: 'Determine host criticality and role (domain controller, workstation, database)',
            explanation: 'Assess whether the affected system houses sensitive data or critical services to gauge operational impact.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-id',
        name: 'Identification & Triage',
        description: 'Collect forensic artifacts before tampering with running memory or file system.',
        tasks: [
          {
            id: 'mal-03',
            title: 'Capture volatile system memory (RAM) if forensically required',
            explanation: 'Acquire a memory dump prior to rebooting or terminating processes if legal/regulatory forensics are needed.',
            priority: 'High',
          },
          {
            id: 'mal-04',
            title: 'Inspect active network connections and listening ports',
            explanation: 'Identify outbound connections to external IP addresses or command-and-control servers using netstat / EDR.',
            priority: 'High',
          },
          {
            id: 'mal-05',
            title: 'Extract file hash (SHA-256) of suspicious binary or script',
            explanation: 'Hash the dropped file to check threat intelligence feeds and sandbox analysis results.',
            priority: 'Medium',
          },
        ],
      },
      {
        id: 'stg-contain',
        name: 'Containment',
        description: 'Isolate host from the network while preserving live forensics capability.',
        tasks: [
          {
            id: 'mal-06',
            title: 'Isolate host at network level (EDR network isolation or switch VLAN quarantine)',
            explanation: 'Prevent malware from propagating laterally or exfiltrating data. Maintain management/IR connectivity if possible.',
            priority: 'Critical',
          },
          {
            id: 'mal-07',
            title: 'Block external C2 IP addresses and domains at the perimeter firewall',
            explanation: 'Prevent other internal endpoints from contacting identified adversary infrastructure.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-erad',
        name: 'Eradication',
        description: 'Eliminate persistence mechanisms, scheduled tasks, and rogue services.',
        tasks: [
          {
            id: 'mal-08',
            title: 'Audit common persistence locations (Run keys, Scheduled Tasks, Systemd units)',
            explanation: 'Inspect registry autorun keys, cron jobs, and startup services for malicious entries.',
            priority: 'High',
          },
          {
            id: 'mal-09',
            title: 'Terminate rogue processes and quarantine dropped binaries',
            explanation: 'Stop active malware processes and remove staging files from Temp/AppData directories.',
            priority: 'High',
          },
          {
            id: 'mal-10',
            title: 'Determine if gold-standard reimaging is required',
            explanation: 'In enterprise defense, standard policy is full disk reimaging rather than spot-cleaning for non-recoverable integrity.',
            priority: 'Critical',
          },
        ],
      },
      {
        id: 'stg-rec',
        name: 'Recovery',
        description: 'Rebuild system from known-good baseline and restore network connectivity.',
        tasks: [
          {
            id: 'mal-11',
            title: 'Reimage host from authenticated golden image or restore clean backup',
            explanation: 'Deploy standard operating system image with latest security patches and configured security agents.',
            priority: 'High',
          },
          {
            id: 'mal-12',
            title: 'Reset credentials of all users who recently logged into the affected host',
            explanation: 'Defend against cached credential dumping (e.g. LSASS dumping, Mimikatz).',
            priority: 'Critical',
          },
          {
            id: 'mal-13',
            title: 'Re-enable network connection and monitor endpoint telemetry closely',
            explanation: 'Validate normal operations and ensure no beaconing resumes.',
            priority: 'Medium',
          },
        ],
      },
      {
        id: 'stg-pir',
        name: 'Post-Incident Review',
        description: 'Analyze initial vector and enhance detection rules.',
        tasks: [
          {
            id: 'mal-14',
            title: 'Document root cause (e.g. unpatched software, phish click, rogue USB)',
            explanation: 'Identify the exact vulnerability or vector that allowed the malware payload execution.',
            priority: 'Medium',
          },
          {
            id: 'mal-15',
            title: 'Deploy custom YARA / EDR detection rule for identified indicators',
            explanation: 'Create alerting rules to automatically block identical files or behaviors across the fleet.',
            priority: 'Medium',
          },
        ],
      },
    ],
  },
  {
    id: 'pb-ransomware',
    title: 'Ransomware Incident Response Playbook',
    category: 'Ransomware',
    description: 'High-urgency emergency procedures for containing enterprise ransomware, safeguarding backups, and managing disaster recovery.',
    overview: 'Preserves critical offline backups, isolates infected network subnets, investigates exfiltration claims, and executes structured restoration.',
    stages: [
      {
        id: 'stg-prep',
        name: 'Preparation & Initial Assessment',
        description: 'Confirm encryption behavior, identify affected file shares, and assemble crisis team.',
        tasks: [
          {
            id: 'rans-01',
            title: 'Declare Major Security Incident and activate Incident Management Team',
            explanation: 'Notify CISO, SOC Lead, Infrastructure Director, and Legal counsel immediately.',
            priority: 'Critical',
          },
          {
            id: 'rans-02',
            title: 'Identify ransomware variant and ransom note characteristics',
            explanation: 'Catalog file extension appended, ransom note text, and any adversary contact identifier without initiating communication.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-id',
        name: 'Identification & Triage',
        description: 'Map blast radius, assess backup status, and check for evidence of data exfiltration.',
        tasks: [
          {
            id: 'rans-03',
            title: 'Immediately sever all network connections to backup repositories',
            explanation: 'Physically or logically air-gap backup targets, NAS appliances, and cloud backup consoles to prevent adversary deletion.',
            priority: 'Critical',
          },
          {
            id: 'rans-04',
            title: 'Identify patient zero host and active lateral movement vectors',
            explanation: 'Review authentication logs for PsExec, WMI, SMB, or compromised service accounts propagating across subnets.',
            priority: 'Critical',
          },
          {
            id: 'rans-05',
            title: 'Inspect egress traffic logs for mass data exfiltration (Double Extortion)',
            explanation: 'Review NetFlow, proxy, and cloud storage upload logs to determine if data was stolen prior to encryption.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-contain',
        name: 'Containment',
        description: 'Hard isolation of affected subnets, disabling compromised directory synchronization.',
        tasks: [
          {
            id: 'rans-06',
            title: 'Isolate affected VLANs and disable inter-subnet routing',
            explanation: 'Cut network boundaries to contain encryption activity to affected network segments.',
            priority: 'Critical',
          },
          {
            id: 'rans-07',
            title: 'Disable external remote access (VPN, RDP, Citrix, SSH)',
            explanation: 'Terminate all external ingress points to lock out active adversary access tunnels.',
            priority: 'Critical',
          },
          {
            id: 'rans-08',
            title: 'Force enterprise-wide domain admin and service account password reset',
            explanation: 'Revoke Kerberos TGT tickets (double KRBTGT reset if Active Directory compromise confirmed).',
            priority: 'Critical',
          },
        ],
      },
      {
        id: 'stg-erad',
        name: 'Eradication',
        description: 'Scour environment for persistence, backdoors, and secondary access brokers.',
        tasks: [
          {
            id: 'rans-09',
            title: 'Identify and close initial access vector (e.g. unpatched VPN/edge appliance)',
            explanation: 'Patch vulnerable gateway devices or disable compromised accounts used for primary entry.',
            priority: 'Critical',
          },
          {
            id: 'rans-10',
            title: 'Scan active directory for rogue accounts, SPN kerberoasting targets, and GPOs',
            explanation: 'Adversaries frequently push malicious GPOs to automate encryption; inspect group policy objects for unauthorized changes.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-rec',
        name: 'Recovery',
        description: 'Phased, prioritized restoration of mission-critical services from validated backups.',
        tasks: [
          {
            id: 'rans-11',
            title: 'Verify integrity and scan backup images prior to restoration',
            explanation: 'Ensure backup images are not corrupted or pre-infected with sleeping malware.',
            priority: 'Critical',
          },
          {
            id: 'rans-12',
            title: 'Restore services in strict priority order (Identity -> Network Core -> Critical Apps)',
            explanation: 'Bring Active Directory / IAM online in isolated recovery environment before connecting application servers.',
            priority: 'High',
          },
          {
            id: 'rans-13',
            title: 'Implement continuous enhanced monitoring on restored assets',
            explanation: 'Ensure all restored hosts run latest EDR agents with high-sensitivity heuristic policies.',
            priority: 'Medium',
          },
        ],
      },
      {
        id: 'stg-pir',
        name: 'Post-Incident Review',
        description: 'Legal notifications, root-cause debrief, and disaster recovery plan overhaul.',
        tasks: [
          {
            id: 'rans-14',
            title: 'Coordinate regulatory and cyber insurance notifications with Legal',
            explanation: 'Ensure compliance with mandatory breach reporting windows (e.g. GDPR 72hr, SEC 4-day, HIPAA).',
            priority: 'High',
          },
          {
            id: 'rans-15',
            title: 'Conduct executive post-mortem and update Business Continuity Plans',
            explanation: 'Document architecture vulnerabilities and prioritize immutable backup storage investments.',
            priority: 'Medium',
          },
        ],
      },
    ],
  },
  {
    id: 'pb-account',
    title: 'Compromised Account Response Playbook',
    category: 'Credential compromise',
    description: 'Procedures for investigating account takeover (ATO), credential stuffing, session theft, and privilege escalation.',
    overview: 'Revokes active tokens, analyzes sign-in history, audits email forwarding and OAuth permissions, and re-secures identity.',
    stages: [
      {
        id: 'stg-prep',
        name: 'Preparation & Initial Assessment',
        description: 'Verify report of unauthorized account activity or unusual sign-in alert.',
        tasks: [
          {
            id: 'act-01',
            title: 'Correlate user activity logs across IdP (Entra ID, Okta, Google Workspace)',
            explanation: 'Review sign-in timestamps, source IP addresses, geolocation, device compliance status, and MFA methods used.',
            priority: 'High',
          },
          {
            id: 'act-02',
            title: 'Contact user via out-of-band channel (phone/SMS) to verify activity',
            explanation: 'Do not use email if mailbox may be monitored by the attacker. Confirm if user was traveling or initiated the logins.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-id',
        name: 'Identification & Triage',
        description: 'Determine method of compromise (infostealer token theft, password reuse, AiTM phishing).',
        tasks: [
          {
            id: 'act-03',
            title: 'Check whether MFA was prompted, bypassed, or fatigue-spammed',
            explanation: 'Identify if attacker used session cookie hijacking (AiTM) or MFA push bombing to gain access.',
            priority: 'High',
          },
          {
            id: 'act-04',
            title: 'Review user role and permissions scope (admin, finance, HR, developer)',
            explanation: 'Determine whether compromised account has access to sensitive databases, source code, or cloud consoles.',
            priority: 'Medium',
          },
        ],
      },
      {
        id: 'stg-contain',
        name: 'Containment',
        description: 'Immediate revocation of access tokens and credential neutralization.',
        tasks: [
          {
            id: 'act-05',
            title: 'Revoke all active sessions and refresh tokens',
            explanation: 'Invalidate all current browser sessions and mobile app tokens in the identity provider.',
            priority: 'Critical',
          },
          {
            id: 'act-06',
            title: 'Reset user password and temporarily suspend account if necessary',
            explanation: 'Deploy complex temporary password or disable login pending full endpoint inspection.',
            priority: 'Critical',
          },
          {
            id: 'act-07',
            title: 'Audit and remove newly registered MFA factors',
            explanation: 'Attackers frequently register their own FIDO/authenticator device to maintain persistence. Remove unauthorized factors.',
            priority: 'Critical',
          },
        ],
      },
      {
        id: 'stg-erad',
        name: 'Eradication',
        description: 'Clean up unauthorized modifications made by the attacker.',
        tasks: [
          {
            id: 'act-08',
            title: 'Audit mailbox rules, delegates, and forwarding configurations',
            explanation: 'Check for auto-forwarding rules sending messages to external domains or deleting inbound security notifications.',
            priority: 'High',
          },
          {
            id: 'act-09',
            title: 'Inspect audit logs for files accessed, downloaded, or shared externally',
            explanation: 'Review SharePoint/Drive access logs to compile a precise list of documents accessed during the compromise window.',
            priority: 'High',
          },
          {
            id: 'act-10',
            title: 'Scan user workstation for infostealer malware',
            explanation: 'If session cookies were stolen, the endpoint may be infected with Lumma, RedLine, or similar stealers.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-rec',
        name: 'Recovery',
        description: 'Safely re-enable user with phishing-resistant MFA.',
        tasks: [
          {
            id: 'act-11',
            title: 'Enroll user in phishing-resistant MFA (FIDO2 / WebAuthn / Passkey)',
            explanation: 'Upgrade user authentication factor to prevent future adversary-in-the-middle bypasses.',
            priority: 'High',
          },
          {
            id: 'act-12',
            title: 'Monitor account audit logs for 7 days',
            explanation: 'Track sign-in attempts and monitor for failed authorization attempts.',
            priority: 'Low',
          },
        ],
      },
      {
        id: 'stg-pir',
        name: 'Post-Incident Review',
        description: 'Analyze policy gaps and conditional access tuning.',
        tasks: [
          {
            id: 'act-13',
            title: 'Review Conditional Access policies and enforce stricter risk-based blocks',
            explanation: 'Enable impossible-travel blocking, managed-device requirements, or risk-based step-up authentication.',
            priority: 'Medium',
          },
        ],
      },
    ],
  },
  {
    id: 'pb-databreach',
    title: 'Suspected Data Breach Playbook',
    category: 'Data breach',
    description: 'Structured framework for scoping, preserving evidence, and managing disclosure for suspected or confirmed data leaks.',
    overview: 'Scopes exposed data sensitivity, assesses exfiltration channels, quantifies exposed user records, and supports legal compliance.',
    stages: [
      {
        id: 'stg-prep',
        name: 'Preparation & Initial Assessment',
        description: 'Verify breach claim, notify Incident Commander and Data Protection Officer.',
        tasks: [
          {
            id: 'brch-01',
            title: 'Validate credibility of breach notification or public leak claim',
            explanation: 'Compare leaked data sample against production schemas to confirm whether data originated from internal systems.',
            priority: 'Critical',
          },
          {
            id: 'brch-02',
            title: 'Activate Breach Response Council (Legal, PR, Privacy, Compliance, Security)',
            explanation: 'Ensure all incident discussions are conducted under attorney-client privilege where appropriate.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-id',
        name: 'Identification & Triage',
        description: 'Determine exact volume, classification, and data types exposed.',
        tasks: [
          {
            id: 'brch-03',
            title: 'Determine data classification (PII, PHI, financial records, passwords, IP)',
            explanation: 'Catalog specific data fields exposed to determine applicable regulatory statutes (GDPR, CCPA/CPRA, HIPAA).',
            priority: 'Critical',
          },
          {
            id: 'brch-04',
            title: 'Identify exfiltration path (cloud bucket, API flaw, SQLi, insider export)',
            explanation: 'Pinpoint the exact system and vulnerability that allowed unauthorized bulk retrieval.',
            priority: 'High',
          },
          {
            id: 'brch-05',
            title: 'Count number of affected individual identities / customer records',
            explanation: 'Establish exact count of exposed users for regulatory threshold reporting requirements.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-contain',
        name: 'Containment',
        description: 'Plug exposure vector immediately and prevent further access.',
        tasks: [
          {
            id: 'brch-06',
            title: 'Restrict public access or revoke vulnerable API key / IAM policy',
            explanation: 'Change cloud bucket permissions to private, rotate database passwords, or patch API auth flaw immediately.',
            priority: 'Critical',
          },
          {
            id: 'brch-07',
            title: 'Preserve web server access logs, database query logs, and cloud audit trails',
            explanation: 'Ensure logs covering the breach window are archived in write-once tamper-evident storage.',
            priority: 'Critical',
          },
        ],
      },
      {
        id: 'stg-erad',
        name: 'Eradication',
        description: 'Audit entire perimeter for similar exposures and eliminate backdoor accounts.',
        tasks: [
          {
            id: 'brch-08',
            title: 'Scan cloud environment for additional publicly accessible storage or endpoints',
            explanation: 'Run cloud security posture management (CSPM) audits across all accounts and regions.',
            priority: 'High',
          },
          {
            id: 'brch-09',
            title: 'Review database access controls and enforce least privilege',
            explanation: 'Ensure service accounts only have minimum required table/column access.',
            priority: 'Medium',
          },
        ],
      },
      {
        id: 'stg-rec',
        name: 'Recovery',
        description: 'Restore normal data operations and monitor dark web / leak sites.',
        tasks: [
          {
            id: 'brch-10',
            title: 'Monitor threat intelligence and paste sites for dump dissemination',
            explanation: 'Track whether stolen datasets are being offered for sale or publicly mirrored.',
            priority: 'Medium',
          },
          {
            id: 'brch-11',
            title: 'Provide identity theft protection / credit monitoring if required by statute',
            explanation: 'Prepare customer communication and support infrastructure for affected individuals.',
            priority: 'Medium',
          },
        ],
      },
      {
        id: 'stg-pir',
        name: 'Post-Incident Review',
        description: 'Regulatory reporting filings and data loss prevention (DLP) architecture upgrade.',
        tasks: [
          {
            id: 'brch-12',
            title: 'Submit formal notification reports to regulatory authorities within statutory timelines',
            explanation: 'File mandatory incident reports with regulators within required timeframes (e.g. 72 hours for GDPR).',
            priority: 'Critical',
          },
          {
            id: 'brch-13',
            title: 'Implement automated Data Loss Prevention (DLP) and database encryption at rest',
            explanation: 'Deploy technical controls to prevent unencrypted bulk export in future.',
            priority: 'High',
          },
        ],
      },
    ],
  },
  {
    id: 'pb-network',
    title: 'Suspicious Network Activity Playbook',
    category: 'Suspicious network activity',
    description: 'Investigation protocol for anomalous outbound beaconing, unauthorized internal scans, and abnormal protocol traffic.',
    overview: 'Analyzes PCAP data, NetFlow records, firewall logs, queries threat intelligence for suspicious IPs/domains, and tunes sensors.',
    stages: [
      {
        id: 'stg-prep',
        name: 'Preparation & Initial Assessment',
        description: 'Capture traffic samples and identify originating internal host IP and MAC.',
        tasks: [
          {
            id: 'net-01',
            title: 'Identify source and destination IP addresses, ports, and protocols',
            explanation: 'Map internal source IP to DHCP / ARP leases to pinpoint the exact physical or virtual host.',
            priority: 'High',
          },
          {
            id: 'net-02',
            title: 'Initiate packet capture (PCAP) or sample NetFlow session data',
            explanation: 'Record live network frames or query SIEM flow logs for packet size distributions and session timing.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-id',
        name: 'Identification & Triage',
        description: 'Characterize traffic pattern (C2 beaconing, port scanning, data tunneling).',
        tasks: [
          {
            id: 'net-03',
            title: 'Analyze beaconing intervals (jitter, heartbeat regularity)',
            explanation: 'Check whether requests occur at regular intervals (e.g. every 60s with 10% jitter), indicative of Cobalt Strike or Metasploit C2.',
            priority: 'High',
          },
          {
            id: 'net-04',
            title: 'Inspect DNS request patterns for tunneling / domain generation algorithms (DGA)',
            explanation: 'Check for high entropy subdomains, abnormal TXT record queries, or high query volume to single domain.',
            priority: 'High',
          },
          {
            id: 'net-05',
            title: 'Perform passive threat intelligence lookup on destination IP / ASN',
            explanation: 'Check destination reputation, hosting provider, geolocations, and known adversary infrastructure tags.',
            priority: 'Medium',
          },
        ],
      },
      {
        id: 'stg-contain',
        name: 'Containment',
        description: 'Block outbound communication and isolate internal source.',
        tasks: [
          {
            id: 'net-06',
            title: 'Apply egress block rule at perimeter firewall / DNS sinkhole',
            explanation: 'Drop packets to the destination IP or sinkhole the domain to prevent C2 command delivery.',
            priority: 'Critical',
          },
          {
            id: 'net-07',
            title: 'Isolate internal initiating host from the local network',
            explanation: 'Quarantine the host to prevent internal horizontal reconnaissance or SMB lateral movement.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-erad',
        name: 'Eradication',
        description: 'Identify the underlying process generating the network traffic.',
        tasks: [
          {
            id: 'net-08',
            title: 'Correlate network connection with local process ID (PID) via EDR / netstat',
            explanation: 'Match source port to active process tree on the endpoint to find the executable initiating connections.',
            priority: 'High',
          },
          {
            id: 'net-09',
            title: 'Inspect host for rootkits, reverse shells, or unauthorized VPN clients',
            explanation: 'Check for living-off-the-land binaries (certutil, bitsadmin, powershell, curl) running hidden network tasks.',
            priority: 'High',
          },
        ],
      },
      {
        id: 'stg-rec',
        name: 'Recovery',
        description: 'Restore clean connectivity and verify absence of beaconing.',
        tasks: [
          {
            id: 'net-10',
            title: 'Validate that no secondary beaconing channels exist to fallback IPs',
            explanation: 'Monitor host outbound connections after initial block to check for backup C2 servers.',
            priority: 'Medium',
          },
          {
            id: 'net-11',
            title: 'Restore host network access after remediation and system clean check',
            explanation: 'Verify that endpoint health checks pass before restoring full network access.',
            priority: 'Medium',
          },
        ],
      },
      {
        id: 'stg-pir',
        name: 'Post-Incident Review',
        description: 'Tune network IDS/IPS rules and firewall policies.',
        tasks: [
          {
            id: 'net-12',
            title: 'Create Snort / Suricata / Zeek signature for observed traffic pattern',
            explanation: 'Write custom network detection rule to alert automatically if similar traffic occurs in future.',
            priority: 'Medium',
          },
          {
            id: 'net-13',
            title: 'Review egress firewall filtering policy (restrict non-standard outbound ports)',
            explanation: 'Enforce strict outbound port whitelist to prevent direct TCP egress on arbitrary high ports.',
            priority: 'Medium',
          },
        ],
      },
    ],
  },
];

/**
 * Creates a customized PlaybookInstance for an incident from a template.
 */
export function createPlaybookInstance(templateId: string): PlaybookInstance | undefined {
  const template = PLAYBOOK_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return undefined;

  return {
    id: `pbi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    templateId: template.id,
    title: template.title,
    description: template.description,
    category: template.category,
    stages: template.stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      description: stage.description,
      tasks: stage.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        explanation: task.explanation,
        priority: task.priority,
        completed: false,
      })),
    })),
  };
}
