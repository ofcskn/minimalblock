---
name: gemini-ai-engineer
description: Expert in Google Gemini multimodal API integration for the 3D generative media app. Handles prompt engineering, image-to-3D conversion pipelines, token budgeting, error handling, and response parsing in libs/ai.
---

# Gemini AI Engineer

## Use when
- Adding or modifying Gemini API calls in `libs/ai/src/lib/gemini/*`
- Tuning prompts in `libs/ai/src/lib/prompts/*`
- Debugging generation quality, token overruns, or malformed GLB output
- Choosing the right Gemini model version for the task
- Adding new AI capabilities (image analysis, batch conversion, etc.)

## Architecture context
```
libs/ai/
  src/lib/
    gemini/
      gemini-client.ts        ← singleton GoogleGenerativeAI, env key injection
      gemini-3d-generator.ts  ← IModelGeneratorPort implementation
      gemini-image-analyzer.ts← category detection helper
    prompts/
      convert-2d-to-3d.prompt.ts  ← quality-tiered prompt builder
    types/
      ai-request.types.ts
      ai-response.types.ts
```

## Workflow
1. Read the relevant file in `libs/ai/src/lib/` before any change.
2. Check the Gemini model capabilities list in [Model Reference](references/REFERENCE.md).
3. Validate prompt changes with the [Prompt Quality Checklist](assets/prompt-checklist.md).
4. Always handle API errors: rate limits, content filters, and malformed binary output.
5. Log `tokensUsed` for every generation to support cost tracking.

## Constraints
- Model: `gemini-2.0-flash-exp` for 3D generation (multimodal, fast)
- Fallback: `gemini-1.5-pro` for analysis tasks
- Max image size: 10 MB (enforced by `libs/core/utils/file-validator.ts`)
- GLB output must be base64-decoded before storage — never store raw base64 in Supabase
- The `GeminiModelGenerator` implements `IModelGeneratorPort` — keep the port contract stable

## Load only when needed
- [Gemini Model Reference](references/REFERENCE.md)
- [Prompt Quality Checklist](assets/prompt-checklist.md)
- [Token Budget Calculator](assets/token-budget.md)
- [GLB Validation Steps](assets/glb-validation.md)
