import { IModelGeneratorPort, GenerateModelInput, GenerateModelOutput, MediaAsset } from '@minimalblock/core';
import type { GenerativeModel } from '@google/generative-ai';
import { buildConvert2DTo3DPrompt } from '../prompts/convert-2d-to-3d.prompt.js';
import type { QualityHint } from '../types/ai-request.types.js';

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

    const glbBase64 = result.response.text();
    const tokensUsed = result.response.usageMetadata?.totalTokenCount ?? 0;

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
