# Support

This document explains how to get help with Minimal Block.

---

## Documentation

The first place to look is the documentation:

- **Running docs site:** `pnpm nx serve docs` → http://localhost:5173
- **Static docs:** [`docs/en/`](docs/en/) — English, [`docs/tr/`](docs/tr/) — Turkish

**Key guides:**

| Guide | Path |
|---|---|
| Getting started | [`docs/en/tutorials/getting-started.md`](docs/en/tutorials/getting-started.md) |
| Configure Gemini AI | [`docs/en/how-to/configure-gemini.md`](docs/en/how-to/configure-gemini.md) |
| Configure Supabase | [`docs/en/how-to/configure-supabase.md`](docs/en/how-to/configure-supabase.md) |
| API endpoints reference | [`docs/en/reference/api-endpoints.md`](docs/en/reference/api-endpoints.md) |
| AI pipeline explained | [`docs/en/explanation/ai-pipeline.md`](docs/en/explanation/ai-pipeline.md) |
| Environment variables | [`docs/env-variables.md`](docs/env-variables.md) |
| Deployment guide | [`docs/deployment.md`](docs/deployment.md) |

---

## Troubleshooting

See the [Troubleshooting section in README.md](README.md#troubleshooting) for common problems and their solutions, including:

- CORS errors when connecting to the API
- Missing environment variables
- Supabase RLS policy violations
- GLB validation failures
- pnpm / Nx cache issues

---

## GitHub Issues

**For bugs:** Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml).  
**For features:** Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml).

Before opening an issue:

1. Search [existing issues](https://github.com/ofcskn/minimalblock/issues) — your question may already be answered.
2. Check the documentation and README troubleshooting sections.
3. Ensure you are on the latest commit of the `development` branch.

---

## GitHub Discussions

For questions, ideas, and general discussion that do not fit a bug report or feature request, use [GitHub Discussions](https://github.com/ofcskn/minimalblock/discussions).

Good topics for Discussions:
- "How do I integrate the model viewer into my existing storefront?"
- "What image quality settings produce the best 3D results?"
- "I'm thinking of adding X — is this aligned with the project direction?"

---

## Security Issues

**Do not use public issues for security vulnerabilities.**

Report security issues privately by email: **ofcskn1@gmail.com**

See [.github/SECURITY.md](.github/SECURITY.md) for the full policy.

---

## Response Expectations

This is an open-source project maintained on a best-effort basis.

| Channel | Typical response time |
|---|---|
| Security email | ≤ 48 hours |
| Bug report (critical) | ≤ 5 business days |
| Bug report (non-critical) | Best effort |
| Feature request | Best effort |
| GitHub Discussions | Best effort |

Responses are not guaranteed within any timeframe for non-security issues.

---

## Contributing

If you can fix a bug or implement a feature yourself, pull requests are very welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.
