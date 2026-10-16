import type { IncidentCategory } from '../types/incident'

export interface CategoryInfo {
  category: IncidentCategory;
  label: string;
  description: string;
  commonVectors: string[];
}

export const INCIDENT_CATEGORIES: CategoryInfo[] = [
  {
    category: 'Phishing',
    label: 'Phishing',
    description: 'Deceptive electronic communications designed to trick recipients into revealing sensitive data, executing malware, or taking fraudulent actions.',
    commonVectors: ['Spearphishing Email', 'Credential Harvesting Link', 'Malicious PDF/Office Attachment', 'Smishing / Vishing'],
  },
  {
    category: 'Malware infection',
    label: 'Malware Infection',
    description: 'Execution of malicious software (trojans, spyware, infostealers, rootkits) on endpoints or servers.',
    commonVectors: ['Drive-by Download', 'Malicious Email Attachment', 'Infected USB Media', 'Software Supply Chain Compromise'],
  },
  {
    category: 'Ransomware',
    label: 'Ransomware',
    description: 'Extortion malware that encrypts files, systems, or data and demands payment for decryption keys or non-disclosure.',
    commonVectors: ['Compromised RDP/VPN', 'Stolen Credentials', 'Exploited Public-Facing Vulnerability', 'Initial Access Broker'],
  },
  {
    category: 'Unauthorized access',
    label: 'Unauthorized Access',
    description: 'Inappropriate or illegitimate access to systems, applications, data stores, or network perimeters.',
    commonVectors: ['Misconfigured IAM / ACLs', 'Weak SSH Keys', 'Privilege Escalation Exploit', 'Unauthenticated API Endpoint'],
  },
  {
    category: 'Credential compromise',
    label: 'Credential Compromise',
    description: 'Compromise or unauthorized use of valid user, administrative, or service account credentials.',
    commonVectors: ['Credential Stuffing / Password Spraying', 'Keylogger / Infostealer', 'Exposed Cloud Secrets / Token Leak', 'Session Hijacking'],
  },
  {
    category: 'Data breach',
    label: 'Data Breach',
    description: 'Confirmed or suspected unauthorized access, extraction, exfiltration, or disclosure of sensitive, confidential, or regulated data.',
    commonVectors: ['Exposed Cloud Bucket (S3/GCS)', 'SQL Injection Database Dump', 'Compromised Third-Party Vendor', 'Exfiltrated Backup Archive'],
  },
  {
    category: 'Denial-of-service attack',
    label: 'Denial-of-Service Attack',
    description: 'Disruption of service availability or resource exhaustion targeting web servers, network uplinks, or critical APIs.',
    commonVectors: ['Volumetric UDP/NTP Amplification', 'SYN Flood', 'Application-Layer HTTP Flood', 'Slowloris / Resource Starvation'],
  },
  {
    category: 'Suspicious network activity',
    label: 'Suspicious Network Activity',
    description: 'Anomalous traffic patterns, unusual outbound beaconing, internal port scanning, or lateral movement signatures.',
    commonVectors: ['C2 Beaconing Protocol', 'DNS Tunneling / Data Tunnel', 'Internal SMB/RDP Sweep', 'Tor / Known Proxy Exit Node Connection'],
  },
  {
    category: 'Insider threat',
    label: 'Insider Threat',
    description: 'Security incident stemming from authorized users (employees, contractors, partners) acting maliciously or negligently.',
    commonVectors: ['Unauthorized Mass File Export', 'Offboarding Policy Violation', 'Access Right Abuse', 'Intentional Configuration Sabotage'],
  },
  {
    category: 'Other',
    label: 'Other / Unclassified',
    description: 'Anomalies or security events that do not neatly fit existing classifications or are pending initial classification.',
    commonVectors: ['Physical Security Intrusion', 'Hardware Tampering', 'Social Engineering (In-Person)', 'Unknown / TBD'],
  },
];
