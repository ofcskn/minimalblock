# Security Policy

## Supported Versions

| Version | Support status |
|---|---|
| `0.x` (pre-release) | Active development — security issues addressed on best-effort basis |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.** Public disclosure before a patch is available puts all users at risk.

Report security vulnerabilities privately by emailing:

**ofcskn1@gmail.com**

### What to include in your report

- A clear description of the vulnerability
- Steps to reproduce, with a minimal proof-of-concept (script, curl command, or screenshots)
- The component(s) affected (API, frontend, Supabase RLS, file upload, AI pipeline, etc.)
- Potential impact and severity assessment
- Any suggested mitigations or patches

### Encryption

If your report contains particularly sensitive details, request a PGP key in your initial email and we will provide one for encrypted communication.

---

## Response Timeline

| Milestone | Target |
|---|---|
| Acknowledgement of receipt | Within 48 hours |
| Initial triage and severity assessment | Within 5 business days |
| Patch or mitigation for critical issues | Within 7 days |
| Patch or mitigation for high-severity issues | Within 30 days |
| Public disclosure | After patch is released, coordinated with reporter |

We will keep you informed of progress throughout the process.

---

## Scope

### In scope

- **Cloudflare Worker API (`apps/api`)** — authentication bypass, unauthorized data access, injection vulnerabilities, credential exposure
- **Supabase Row-Level Security** — policies that allow users to access other users' data
- **File upload handling** — malicious file processing, MIME type bypass, path traversal, denial of processing
- **AI pipeline (Gemini integration)** — prompt injection enabling unauthorized actions, API key exposure
- **Frontend (`apps/web`)** — XSS, CSRF, sensitive data stored in `localStorage` or exposed in JavaScript bundles
- **Environment variable handling** — secrets accidentally exposed in client-side code or logs
- **Authentication flows** — session fixation, JWT validation bypass, insecure token storage

### Out of scope

- Vulnerabilities in third-party services (Supabase, Cloudflare, Google Gemini) — report these directly to the respective vendor
- Denial-of-service attacks without demonstrable security impact beyond availability
- Issues requiring physical access to a device
- Social engineering attacks targeting users or maintainers
- Vulnerabilities in dependencies with no direct exploitability in this project (open a regular issue to request a dependency update instead)
- Self-XSS (requires the attacker to execute code in their own browser)

---

## Security Practices

The following practices are in place to reduce attack surface:

### API key isolation
`GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are stored as Cloudflare Worker secrets. They are never present in `VITE_`-prefixed environment variables, never logged, and never returned in API responses.

### Row-Level Security
Every Supabase table containing user data has RLS enabled with owner-scoped policies. The browser client uses the anon key (subject to RLS). The Worker uses the service role key only for privileged server-side operations.

### File upload validation
Uploaded files are validated for MIME type and size in the Worker before any processing. Files are stored under the owner's `owner_id` prefix in Supabase Storage.

### Prompt injection mitigation
User-supplied content is interpolated only into designated content slots in AI prompts — not into system instructions. Inputs are not passed directly to Gemini without structure.

### CORS
The `CORS_ORIGIN` environment variable restricts which origins can call the Worker API. Defaults to `*` in development; set to your frontend domain in production.

### No secrets in version control
`.env` files are in `.gitignore`. `wrangler.toml` contains no secrets — only non-sensitive configuration variables.

---

## Disclosure Policy

We follow **coordinated (responsible) disclosure**:

1. Reporter submits details privately by email.
2. We acknowledge receipt within 48 hours.
3. We work toward a patch on the timeline above.
4. Once a patch is ready, we coordinate the public disclosure date with the reporter.
5. We credit the reporter in the release notes and changelog unless they request anonymity.

We do not currently offer a monetary bug bounty. We do publicly credit reporters and will provide a letter of acknowledgement on request.

---

## Known Limitations

- This is a pre-release (`0.x`) project. The security model is appropriate for early adoption but has not undergone a formal third-party security audit.
- Gemini-generated 3D models are user-visible outputs — content moderation for AI-generated content is not currently implemented.
- Rate limiting on the `/convert` endpoint is not yet enforced (planned in Phase 7).
