# Security Architecture & Threat Model

## 1. Executive Summary

IncidentKit is designed from the ground up as a **privacy-first, offline-capable incident response planner and educational platform**. It operates entirely within the user's browser, eliminating remote attack surfaces typically associated with multi-tenant SaaS incident management platforms.

This document details the security principles, threat model, boundaries, and residual risks of the application.

---

## 2. Threat Model (STRIDE Assessment)

| Threat Category | Potential Risk | IncidentKit Mitigations |
| :--- | :--- | :--- |
| **Spoofing Identity** | Malicious actor impersonating another responder | Single-user, local-first model. No cloud user accounts or shared sessions exist to spoof. |
| **Tampering with Data** | Corruption of stored incident evidence or logs | Input sanitization, strict JSON schema validation on import, local browser cryptographic hashing (SHA-256). |
| **Repudiation** | Denying who logged an event or changed a status | Dual-timestamping captures both event occurrence time and system entry time. Explicit disclosure that browser timestamps are local decision-support logs. |
| **Information Disclosure** | Leakage of incident notes, IP addresses, or hashes | **Zero network egress**: No external telemetry, no analytics, no AI API calls, strict Content Security Policy (CSP `connect-src 'self'`). |
| **Denial of Service** | Application crash or freezing due to oversized inputs | 5 MB hard limit on imported JSON files, max 500 records per import, bounded string lengths on inputs. |
| **Elevation of Privilege** | Attacker gaining host execution via the planner | Pure client-side static bundle. No server execution, no `eval()`, zero automated command execution on target hosts. |

---

## 3. Privacy Design Principles

1. **Client-Side Processing Only**: All cryptographic hashing (Web Crypto API `crypto.subtle.digest`) occurs directly on the client CPU. No bytes are sent to any remote server.
2. **Local Persistence**: Data is persisted in browser IndexedDB (with transparent `localStorage` fallback). No external database connections or credentials are required or permitted.
3. **No Third-Party Scripts**: No tracking pixels (Google Analytics, Mixpanel), no external fonts, no third-party CDN scripts, and no advertising trackers.
4. **Explicit Data Lifecycle Controls**: Users have one-click access to export their entire database to JSON or permanently purge all browser records.

---

## 4. Defensive Operational Boundaries

- **No Automated Remediation**: The application deliberately avoids executing destructive automated actions (e.g. killing processes, wiping disks, disabling accounts, or modifying network infrastructure). It serves strictly as a structured planner and documentation console.
- **Forensic Disclaimer**: Hashing files locally verifies file integrity (detecting unintentional or intentional file modification). However, browser storage does not equal legally certified chain-of-custody or evidentiary certification (e.g., ISO/IEC 27037).
- **Sensitive Data Warning**: Users are explicitly warned not to upload or paste classified data, plaintext passwords, or regulated evidence files into an unapproved web browser environment.

---

## 5. Content Security Policy (CSP)

IncidentKit deploys with strict HTTP headers configured in `vercel.json`:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```
