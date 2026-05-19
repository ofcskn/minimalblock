---
name: Documentation & Governance System
description: Complete set of community, legal, and developer docs created for the minimalblock repo
type: project
---

Full documentation and governance system created on 2026-05-19.

**Why:** Needed enterprise-grade open-source docs for the repo — community governance, developer onboarding, security policy, legal disclaimers, and reference docs.

**How to apply:** All docs are in place. When adding new features, update CHANGELOG.md, ROADMAP.md (move items from Planned to In Progress/Completed), and the relevant `docs/` reference file.

Files created:
- `README.md` — complete rewrite with diagrams, full tech stack, API reference, troubleshooting, FAQ
- `CONTRIBUTING.md` — setup, TypeScript conventions, commit standards, branch strategy, PR process
- `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1
- `DISCLAIMER.md` — AI-generated content limitations, user responsibility, no-warranty
- `LICENSE` — MIT, 2024–2026 Ömer Faruk Coşkun
- `ARCHITECTURE.md` — system diagrams, ADRs, layer architecture, data flows, security model
- `ROADMAP.md` — completed phases 1–6, planned phases 7–12
- `CHANGELOG.md` — versioned history 0.1–0.6 following Conventional Commits format
- `SUPPORT.md` — support channels, response expectations
- `.github/SECURITY.md` — expanded: scope, practices, disclosure policy, known limitations
- `.github/PULL_REQUEST_TEMPLATE.md` — checklist-driven PR template
- `.github/ISSUE_TEMPLATE/bug_report.yml` — structured bug report form
- `.github/ISSUE_TEMPLATE/feature_request.yml` — structured feature request form
- `.github/ISSUE_TEMPLATE/config.yml` — disables blank issues, adds security/discussion links
- `docs/env-variables.md` — every env var with examples and security rules
- `docs/supabase-schema.md` — all 16 migrations, table columns, storage, RLS patterns
- `docs/ai-integration.md` — Gemini clients, category generators, prompt design, validation, mocking
- `docs/deployment.md` — Cloudflare Workers, static SPA, CI/CD, rollback, monitoring
