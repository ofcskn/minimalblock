---
name: documentation-manager
description: Create and maintain technical documentation for the 3D generative media app — README, architecture docs, API contracts, contribution guides, and skill reference pages. Use when docs are missing, outdated, or need restructuring.
---

# Documentation Manager

## Use when
- README needs updating after structural or feature changes
- A new lib or skill requires a usage guide
- API contracts between libs/* need documenting
- Onboarding documentation is missing or unclear
- Architecture decisions need a concise ADR (Architecture Decision Record)

## Documentation locations
```
README.md                   ← top-level project overview
docs/
  architecture.md           ← lib layer diagram + dependency rules
  getting-started.md        ← local dev setup, env vars, Supabase init
  api-contracts.md          ← public exports from each @minimalblock/* package
  adr/
    001-gemini-model.md     ← why Gemini 2.0 Flash Exp
    002-glb-output.md       ← why GLB over OBJ/USDZ
.claude/skills/*/SKILL.md   ← skill documentation (maintained by each role)
```

## Writing rules
- **English only** — no machine-translated content
- Max 3 levels of heading depth
- Code examples must be runnable or clearly labelled as pseudocode
- Architecture diagrams use Mermaid
- No passive voice in instructions — use imperative ("Run", "Add", "Open")
- No trailing summaries — end sections at the last relevant fact

## Workflow
1. Identify what is missing or outdated.
2. Read current doc files before editing.
3. Write English draft; keep prose minimal — prefer tables and code blocks.
4. For architecture docs, generate a Mermaid diagram.
5. For ADRs, use the [ADR Template](assets/adr-template.md).
6. Update the table of contents if present.

## ADR trigger criteria
Write an ADR when a decision is:
- Hard to reverse (e.g., switching AI provider, changing DB schema strategy)
- Non-obvious to future contributors
- The result of a trade-off where alternatives were seriously considered

## Load only when needed
- [ADR Template](assets/adr-template.md)
- [Architecture diagram guide](assets/architecture-diagram.md)
- [README template](assets/readme-template.md)
