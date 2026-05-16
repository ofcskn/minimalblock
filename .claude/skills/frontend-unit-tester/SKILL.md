---
name: frontend-unit-tester
description: Write and maintain unit tests for React components (libs/ui), feature hooks (libs/features), domain logic (libs/core), and AI prompt builders (libs/ai). Covers rendering, interaction, performance guards, and input validation. Use after every UI, hook, or domain change.
---

# Frontend Unit Tester

## Use when
- A new component is added or modified in `libs/ui`
- A new hook is added or modified in `libs/features`
- Domain entity, VO, or aggregate logic changes in `libs/core`
- A Gemini prompt builder or parser changes in `libs/ai`
- A page is added or modified in `apps/web`

## Test runner & tooling
- **libs/core, libs/data, libs/ai, libs/features**: Jest + `@testing-library/react` (spec files next to source)
- **apps/web**: Vitest + `@testing-library/react` (`.spec.tsx` files)
- All tests run via Nx: `npx nx test <project>`

## What to test per layer

### libs/core — domain logic
```typescript
// Entities: constructor, methods, invariants
describe('Conversion', () => {
  it('should start in pending state', ...)
  it('markProcessing() throws if not pending', ...)
  it('markCompleted() sets outputAsset', ...)
  it('markFailed() sets errorMessage', ...)
  it('isAccessibleBy() guards owner', ...)
});

// Value objects: equality, factory methods
describe('ConversionStatus', () => {
  it('from() returns correct state', ...)
  it('isTerminal() true for completed and failed', ...)
});
```

### libs/ui — component rendering and interaction
```typescript
// Every component: renders without crash, key props, accessibility
describe('Button', () => {
  it('renders children', ...)
  it('shows spinner when loading=true', ...)
  it('is disabled when loading or disabled prop', ...)
  it('fires onClick handler', ...)
});

describe('FileUpload', () => {
  it('renders drop zone', ...)
  it('calls onFileSelected with valid file', ...)
  it('rejects files exceeding maxSizeMb', ...)
  it('accepts drag-and-drop', ...)
});

describe('StatusBadge', () => {
  it('renders correct label for each status', ...)
  it('applies pulse class for processing status', ...)
});
```

### libs/features — hooks (mock ports)
```typescript
// Mock every port interface; test state transitions
describe('useUpload', () => {
  it('validates file before uploading', ...)
  it('sets uploading=true during upload', ...)
  it('sets asset on success', ...)
  it('sets error on failure', ...)
  it('reset() clears state', ...)
});

describe('useConversion', () => {
  it('transitions pending → processing → completed', ...)
  it('marks failed when generator throws', ...)
  it('saves each state to repository', ...)
});
```

### libs/ai — prompt builders and parsers
```typescript
describe('buildConvert2DTo3DPrompt', () => {
  it('includes product category in output', ...)
  it('varies instructions by quality hint', ...)
});
```

## Performance guards
Every component test must include a render-performance assertion:
```typescript
it('renders within 50 ms', async () => {
  const start = performance.now();
  render(<Button>Click</Button>);
  expect(performance.now() - start).toBeLessThan(50);
});
```

## Input validation coverage
For every component or hook that accepts user input, test:
- Valid input → correct behavior
- Empty / null input → no crash
- Max boundary → handled gracefully
- Invalid MIME type (FileUpload) → rejected with message

## File naming convention
```
libs/ui/src/lib/components/Button.spec.tsx    ← next to the component
libs/core/src/lib/domain/aggregates/Conversion.spec.ts
libs/features/src/lib/upload/hooks/use-upload.spec.ts
libs/ai/src/lib/prompts/convert-2d-to-3d.spec.ts
```

## Workflow
1. Read the file being tested before writing the spec.
2. Write tests from the user's perspective (render, interact, assert).
3. Mock external ports (`IImageUploaderPort`, `IModelGeneratorPort`, etc.) — never mock internal domain logic.
4. Run `npx nx test <project>` and fix until green.
5. Check coverage: every public method/prop must have at least one test.

## Load only when needed
- [React Testing Library cheatsheet](references/REFERENCE.md)
- [Mock port factory](assets/mock-ports.ts)
- [Vitest render helper](assets/render-helper.ts)
- [Performance test template](assets/perf-test-template.ts)
