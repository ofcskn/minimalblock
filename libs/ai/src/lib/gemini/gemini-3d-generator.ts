import { IModelGeneratorPort, GenerateModelInput, GenerateModelOutput, MediaAsset } from '@minimalblock/core';
import type { GenerativeModel } from '@google/generative-ai';
import { buildConvert2DTo3DPrompt } from '../prompts/convert-2d-to-3d.prompt.js';
import type { QualityHint } from '../types/ai-request.types.js';

// Accepts: raw base64, data URI (data:model/gltf-binary;base64,<data>),
// or markdown code-fenced base64 (```base64\n...\n```).
// Throws a descriptive error when the string is not valid base64.
function extractBase64(raw: string): string {
  // Strip data URI prefix
  const dataUriMatch = raw.match(/^data:[^;]+;base64,(.+)$/s);
  if (dataUriMatch) return validateBase64(dataUriMatch[1].trim());

  // Strip markdown code fences (``` or ```base64 / ```glb / ```binary)
  const fenceMatch = raw.match(/^```[a-z0-9]*\s*([\s\S]+?)\s*```$/i);
  if (fenceMatch) return validateBase64(fenceMatch[1].trim());

  return validateBase64(raw);
}

function validateBase64(value: string): string {
  if (value.length === 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    const preview = value.slice(0, 120).replace(/\n/g, '\\n');
    throw new Error(
      `Gemini did not return valid base64 GLB data. Response preview: "${preview}"`,
    );
  }
  return value;
}

export class GeminiModelGenerator implements IModelGeneratorPort {
  constructor(private readonly model: GenerativeModel) {}

  async generate(input: GenerateModelInput): Promise<GenerateModelOutput> {
    const quality = (input.qualityHint ?? 'balanced') as QualityHint;
    const prompt = buildConvert2DTo3DPrompt(input.productCategory, quality);

    const imageResp = await fetch(input.sourceAsset.url);
    const imageBuffer = await imageResp.arrayBuffer();
    const imageBytes = new Uint8Array(imageBuffer);
    let binary = '';
    for (let i = 0; i < imageBytes.byteLength; i += 1) {
      binary += String.fromCharCode(imageBytes[i]);
    }
    const imageBase64 = btoa(binary);

    const result = await this.model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: input.sourceAsset.mimeType as string,
          data: imageBase64,
        },
      },
    ]);

    const tokensUsed = result.response.usageMetadata?.totalTokenCount ?? 0;

    // Text models return base64 in their text response; strip any wrapping the model adds.
    const raw = result.response.text().trim();
    const glbBase64 = extractBase64(raw);

    const glbBytes = Uint8Array.from(atob(glbBase64), (value) => value.charCodeAt(0));

    // Return base64 encoded GLB; the caller (app layer) handles storage upload
    const outputAsset = new MediaAsset({
      url: `data:model/gltf-binary;base64,${glbBase64}`,
      storageKey: '',
      mimeType: 'model/gltf-binary',
      kind: 'generated-model',
      sizeBytes: glbBytes.byteLength,
    });

    return { outputAsset, tokensUsed };
  }
}
