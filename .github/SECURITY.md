# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.x (pre-release) | ✓ Active development — issues addressed on a best-effort basis |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues privately by emailing:

**ofcskn1@gmail.com**

Include the following in your report:
- A clear description of the vulnerability
- Steps to reproduce (PoC, screenshots, or a minimal script)
- Potential impact and affected components (API, frontend, Supabase RLS, file upload, etc.)
- Any suggested mitigations

## Response Timeline

| Milestone | Target |
|-----------|--------|
| Acknowledgement | Within 48 hours |
| Initial triage | Within 5 business days |
| Patch or mitigation | Depends on severity (critical ≤ 7 days, high ≤ 30 days) |
| Public disclosure | After patch is released, coordinated with reporter |

## Scope

**In scope:**
- Cloudflare Workers API (`apps/api`) — auth bypass, injection, data exposure
- Supabase RLS policy bypasses — unauthorized data access
- File upload handling — malicious file processing, path traversal
- AI pipeline (Gemini integration) — prompt injection, credential exposure
- Frontend (`apps/web`) — XSS, CSRF, sensitive data in client

**Out of scope:**
- Vulnerabilities in third-party services (Supabase, Cloudflare, Google Gemini) — report directly to them
- Denial of service without meaningful impact
- Issues requiring physical access to a device
- Social engineering attacks

## Disclosure Policy

We follow **coordinated disclosure**. Please give us reasonable time to address the issue before public disclosure. We will credit reporters in release notes unless anonymity is requested.
