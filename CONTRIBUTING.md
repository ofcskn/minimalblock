# Contributing to Minimal Block

Thank you for your interest in contributing. This document covers everything you need to get started — from local setup through the pull request review process.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Repository Structure](#repository-structure)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
  - [TypeScript Conventions](#typescript-conventions)
  - [React Conventions](#react-conventions)
  - [File Naming](#file-naming)
  - [Import Order](#import-order)
- [Testing Requirements](#testing-requirements)
- [Linting and Formatting](#linting-and-formatting)
- [Commit Standards](#commit-standards)
- [Branching Strategy](#branching-strategy)
- [Pull Request Process](#pull-request-process)
- [Security Practices](#security-practices)
- [Performance Expectations](#performance-expectations)
- [Review Workflow](#review-workflow)
- [First-Time Contributors](#first-time-contributors)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold these standards. Report unacceptable behavior to **ofcskn1@gmail.com**.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork: `git clone https://github.com/<your-username>/minimalblock.git`
3. **Add the upstream remote:**
   ```bash
   git remote add upstream https://github.com/ofcskn/minimalblock.git
   ```
4. Complete [Development Setup](#development-setup)
5. Create a branch, make your changes, and open a pull request

---

## Repository Structure

```
minimalblock/
├── apps/
│   ├── web/        # React 19 + Vite SPA
│   ├── api/        # Cloudflare Worker API
│   └── docs/       # VitePress documentation site
├── libs/
│   ├── core/       # Domain entities, value objects, ports (no framework deps)
│   ├── data/       # Supabase repository implementations
│   ├── ai/         # Gemini clients, generators, prompts
│   ├── features/   # React hooks connecting UI to data layer
│   ├── ui/         # Shared React component library
│   └── trendyol/   # Trendyol marketplace integration
├── supabase/
│   └── migrations/ # Sequential SQL migrations
└── docs/           # Static documentation (Diátaxis framework)
```

**Dependency rules** (enforced by Nx):

- `apps/*` may import from `libs/*`
- `libs/features` and `libs/ui` may import from `libs/core` and `libs/data`
- `libs/ai` may import from `libs/core`
- `libs/core` has **no** workspace dependencies (fully portable)
- No circular dependencies

---

## Development Setup

### Requirements

- Node.js 20.x
- pnpm 10.30.3 (`npm install -g pnpm@10.30.3`)
- Supabase account and project
- Google Gemini API key

### Steps

```bash
# Install dependencies
pnpm install

# Copy and configure environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# Edit both files with your Supabase and Gemini credentials

# Apply database migrations
supabase link --project-ref <project-ref>
supabase db push

# Start development servers
pnpm nx run-many -t serve -p web api
```

Web app runs at http://localhost:4200, API at http://localhost:8787.

---

## Coding Standards

### TypeScript Conventions

- **Strict mode** is enabled (`tsconfig.base.json`). No `any`, no `as any`.
- Prefer `interface` over `type` for object shapes that will be extended or implemented.
- Use `type` for unions, intersections, and computed types.
- All public functions must have explicit return types.
- Prefer `unknown` over `any` when the type is genuinely unknown.
- Prefer named exports over default exports.
- Use `readonly` on arrays and objects that should not be mutated.
- Use optional chaining (`?.`) and nullish coalescing (`??`) instead of `||` for nullable values.

```typescript
// Good
interface ProductRepository {
  findById(id: string): Promise<Product | null>;
}

// Bad — implicit any, missing return type
function getProduct(id) {
  return fetch(`/products/${id}`).then(r => r.json());
}
```

### React Conventions

- **Functional components only** — no class components.
- Props interfaces are named `<ComponentName>Props`.
- Co-locate related logic (hooks, utils) with the component that primarily uses them.
- Extract multi-line JSX into named sub-components rather than inline arrow functions in render.
- Avoid `useEffect` for derived state — prefer `useMemo` or computing directly.
- Use React Query for all server state; React Context for app-wide UI state only.
- Components in `libs/ui` must be stateless or use only local state — no direct Supabase calls.

```typescript
// Good
interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) { ... }

// Bad — missing prop types, default export
export default function ProductCard({ product, onSelect }) { ... }
```

### File Naming

| Content | Convention | Example |
|---|---|---|
| React component | `PascalCase.tsx` | `ProductCard.tsx` |
| Hook | `use-kebab-case.ts` | `use-gallery.ts` |
| Service/class | `kebab-case.ts` | `gemini-client.ts` |
| Utility | `kebab-case.ts` | `file-validation.ts` |
| Test | `*.spec.ts` / `*.spec.tsx` | `ProductCard.spec.tsx` |
| Prompt | `kebab-case.prompt.ts` | `material-inference.prompt.ts` |

### Import Order

Enforced by ESLint. Order:

1. Node built-ins
2. Third-party packages
3. Workspace packages (`@minimalblock/*`)
4. Relative imports (closest first)

---

## Testing Requirements

### What must be tested

- All pure functions and utilities in `libs/core`
- All repository methods in `libs/data` (use a mock Supabase client)
- All Gemini client methods in `libs/ai` (use `MockImageAnalyzer`)
- All React hooks in `libs/features` (use `@testing-library/react`)
- Critical UI components in `libs/ui`

### What does not need tests

- Wiring components that only compose library components with no logic
- One-line utility wrappers
- Configuration files

### Running tests

```bash
# All tests
pnpm nx run-many -t test

# Specific library
pnpm nx test core

# Watch mode
pnpm nx test web --watch

# With coverage
pnpm nx test ai --coverage
```

### Test conventions

- Use `describe` / `it` blocks with clear human-readable descriptions.
- One assertion per test where possible.
- Use `libs/ai/src/lib/mock/mock-image-analyzer.ts` for AI tests — never call the real Gemini API in tests.
- Do not add `@ts-ignore` or `as any` to make tests pass.
- Test file lives adjacent to the module it tests.

---

## Linting and Formatting

```bash
# Lint (ESLint 9 flat config)
pnpm nx run-many -t lint

# Auto-fix lint issues
pnpm nx run-many -t lint --fix

# Check formatting (Prettier 3)
pnpm nx format:check

# Auto-fix formatting
pnpm nx format:write
```

CI will reject PRs with lint errors or formatting violations. Run these before pushing.

---

## Commit Standards

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature visible to users or developers |
| `fix` | A bug fix |
| `perf` | Performance improvement with no behavior change |
| `refactor` | Code change that neither adds a feature nor fixes a bug |
| `test` | Adding or updating tests |
| `docs` | Documentation changes only |
| `chore` | Build system, CI, dependency updates |
| `style` | Formatting, whitespace (no logic change) |

### Scopes

Use the library or app name: `web`, `api`, `docs`, `core`, `data`, `ai`, `ui`, `features`, `trendyol`.

### Examples

```
feat(ai): add return-risk scoring to Gemini image analyzer
fix(data): correct RLS policy on generation_feedback table
perf(web): virtualize gallery grid with TanStack Virtual
docs(api): document /convert endpoint request schema
chore(ci): upgrade Nx Cloud agents to linux-medium-js
```

### Rules

- Subject line: max 72 characters, lowercase, no trailing period
- Body: explain **why**, not what (the diff shows what)
- Breaking changes: add `BREAKING CHANGE:` footer with migration instructions

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code. CI must pass. |
| `development` | Integration branch for in-progress work |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `perf/<name>` | Performance improvements |
| `docs/<name>` | Documentation-only changes |
| `chore/<name>` | Maintenance, dependency updates |

### Rules

- Branch from `development` for all feature work.
- Keep branches short-lived (merge within a sprint if possible).
- Rebase onto `development` before opening a PR — no merge commits in feature branches.
- Delete the branch after it is merged.

```bash
# Start a feature
git fetch upstream
git checkout -b feat/hotspot-animation upstream/development

# Keep up to date
git fetch upstream
git rebase upstream/development

# Push
git push -u origin feat/hotspot-animation
```

---

## Pull Request Process

1. **Open a draft PR** as soon as you push the first commit — allows early feedback.
2. Fill out the [pull request template](.github/PULL_REQUEST_TEMPLATE.md) completely.
3. Ensure CI passes: lint, typecheck, tests, build.
4. Request review from a maintainer once the PR is ready.
5. Respond to all review comments within 3 business days.
6. Squash-merge after approval.

### PR checklist

Before marking a PR ready for review:

- [ ] `pnpm nx run-many -t lint` passes
- [ ] `pnpm nx run-many -t typecheck` passes
- [ ] `pnpm nx run-many -t test` passes (or the affected subset)
- [ ] New code is covered by tests
- [ ] Docs updated if behavior changes
- [ ] No secrets, credentials, or `.env` files committed
- [ ] Migrations are sequential and named correctly (e.g., `017_...sql`)

---

## Security Practices

- **Never** commit secrets, API keys, `.env` files, or credentials.
- Use `VITE_` prefix only for variables safe to expose in the browser.
- `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must stay in `apps/api` secrets only.
- All new Supabase tables must have RLS enabled with explicit owner-scoped policies.
- Sanitize any user-supplied input before passing it to AI prompts (prompt injection risk).
- Use parameterized queries — never string-concatenate user input into SQL.
- Validate file types server-side before processing uploads — MIME type checking only is insufficient.

Report security vulnerabilities privately — see [.github/SECURITY.md](.github/SECURITY.md).

---

## Performance Expectations

When adding new features, consider:

- **Bundle size:** New npm dependencies need justification — check the Vite bundle analyzer before adding.
- **Supabase queries:** Add indexes for any query that filters on non-indexed columns.
- **AI calls:** Gemini calls are expensive. Cache results where possible; don't call in loops.
- **React renders:** Profile with React DevTools before submitting components that render frequently.
- **Worker cold starts:** Keep `apps/api` bundle small — avoid heavy dependencies.

Run the bundle analyzer:

```bash
pnpm nx build web -- --sourcemap
```

---

## Review Workflow

### As an author

- Keep PRs focused — one logical change per PR.
- Write a clear PR description explaining **why** the change is needed.
- Annotate non-obvious decisions with code comments **in the PR description**, not inline comments.

### As a reviewer

- Review for correctness, security, performance, and maintainability — in that order.
- Suggest alternatives rather than just identifying problems.
- Approve only when all blocking comments are resolved.
- Use GitHub's "Request changes" only for blocking issues; use "Comment" for suggestions.

---

## First-Time Contributors

Not sure where to start? Look for issues tagged **`good first issue`** on the GitHub issue tracker.

For questions that don't fit an issue, open a [GitHub Discussion](https://github.com/ofcskn/minimalblock/discussions) or see [SUPPORT.md](SUPPORT.md).

We appreciate every contribution — including documentation fixes, typo corrections, and translation improvements.
