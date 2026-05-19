## Summary

<!-- One paragraph describing what this PR does and why. Focus on the "why" — the diff shows the "what". -->

## Type of change

- [ ] Bug fix (non-breaking change that resolves an issue)
- [ ] New feature (non-breaking addition)
- [ ] Breaking change (changes existing API or behavior)
- [ ] Performance improvement
- [ ] Refactor (no behavior change)
- [ ] Documentation update
- [ ] CI / tooling change

## Related issues

<!-- Link any related issues: Closes #123, Fixes #456 -->

## Testing

<!-- Describe how this was tested. Include commands to reproduce. -->

```bash
# Example: test command run
pnpm nx test core
```

## Checklist

- [ ] `pnpm nx run-many -t lint` passes
- [ ] `pnpm nx run-many -t typecheck` passes
- [ ] `pnpm nx run-many -t test` passes (affected projects at minimum)
- [ ] New functionality is covered by tests
- [ ] Docs updated if public behavior changed
- [ ] No secrets, credentials, or `.env` files committed
- [ ] New Supabase tables have RLS policies
- [ ] Migration file is sequentially numbered (if applicable)

## Screenshots / recordings

<!-- For UI changes: add before/after screenshots or a short screen recording. Delete this section if not applicable. -->

## Notes for reviewers

<!-- Anything that needs special attention, known limitations, or open questions. -->
