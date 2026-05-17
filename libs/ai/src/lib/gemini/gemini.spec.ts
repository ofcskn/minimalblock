import { createGeminiClient, createGenerativeModel, DEFAULT_MODEL_ID, ANALYSIS_MODEL_ID } from './gemini-client.js';
import { GeminiModelGenerator } from './gemini-3d-generator.js';
import { GeminiImageAnalyzer } from './gemini-image-analyzer.js';
import { GeminiRiskAnalyzer } from './gemini-risk-analyzer.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeModel(responseText: string, totalTokenCount = 42) {
  return {
    generateContent: jest.fn().mockResolvedValue({
      response: {
        text: () => responseText,
        usageMetadata: { totalTokenCount },
      },
    }),
  } as any;
}

function makeMediaAsset(overrides: Record<string, unknown> = {}) {
  return {
    url: 'https://example.com/product.jpg',
    storageKey: 'media/product.jpg',
    mimeType: 'image/jpeg',
    kind: 'source-image',
    sizeBytes: 12345,
    ...overrides,
  } as any;
}

// ---------------------------------------------------------------------------
// gemini-client
// ---------------------------------------------------------------------------

describe('gemini-client', () => {
  it('exports gemini-2.5-flash as DEFAULT_MODEL_ID', () => {
    expect(DEFAULT_MODEL_ID).toBe('gemini-2.5-flash');
  });

  it('exports gemini-2.5-pro as ANALYSIS_MODEL_ID', () => {
    expect(ANALYSIS_MODEL_ID).toBe('gemini-2.5-pro');
  });

  it('createGeminiClient returns a GoogleGenerativeAI instance', () => {
    const client = createGeminiClient('fake-key');
    expect(client).toBeDefined();
    expect(typeof client.getGenerativeModel).toBe('function');
  });

  it('createGenerativeModel defaults to DEFAULT_MODEL_ID', () => {
    const model = createGenerativeModel('fake-key');
    expect(model).toBeDefined();
  });

  it('createGenerativeModel accepts an explicit model id', () => {
    const model = createGenerativeModel('fake-key', ANALYSIS_MODEL_ID);
    expect(model).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// GeminiModelGenerator
// ---------------------------------------------------------------------------

describe('GeminiModelGenerator', () => {
  const glbBytes = new Uint8Array([0x67, 0x6c, 0x54, 0x46]); // "glTF" magic bytes
  const glbBase64 = Buffer.from(glbBytes).toString('base64');

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(glbBytes.buffer),
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls generateContent with a text prompt and inline image data', async () => {
    const model = makeModel(glbBase64);
    const generator = new GeminiModelGenerator(model);

    await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'furniture',
      qualityHint: 'balanced',
    });

    expect(model.generateContent).toHaveBeenCalledTimes(1);
    const [parts] = model.generateContent.mock.calls[0];
    expect(parts[0]).toHaveProperty('text');
    expect(parts[1]).toHaveProperty('inlineData');
    expect(parts[1].inlineData.mimeType).toBe('image/jpeg');
  });

  it('returns outputAsset with gltf-binary mimeType and data URI', async () => {
    const model = makeModel(glbBase64);
    const generator = new GeminiModelGenerator(model);

    const result = await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'furniture',
    });

    expect(result.outputAsset.mimeType).toBe('model/gltf-binary');
    expect(result.outputAsset.url).toMatch(/^data:model\/gltf-binary;base64,/);
  });

  it('returns tokensUsed from usageMetadata', async () => {
    const model = makeModel(glbBase64, 99);
    const generator = new GeminiModelGenerator(model);

    const result = await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'electronics',
    });

    expect(result.tokensUsed).toBe(99);
  });

  it('defaults tokensUsed to 0 when usageMetadata is absent', async () => {
    const model = {
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => glbBase64, usageMetadata: undefined },
      }),
    } as any;
    const generator = new GeminiModelGenerator(model);

    const result = await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'bags',
    });

    expect(result.tokensUsed).toBe(0);
  });

  it('includes quality hint in the prompt', async () => {
    const model = makeModel(glbBase64);
    const generator = new GeminiModelGenerator(model);

    await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'furniture',
      qualityHint: 'quality',
    });

    const [parts] = model.generateContent.mock.calls[0];
    expect(parts[0].text).toContain('high-fidelity');
  });

  it('uses balanced quality when qualityHint is omitted', async () => {
    const model = makeModel(glbBase64);
    const generator = new GeminiModelGenerator(model);

    await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'furniture',
    });

    const [parts] = model.generateContent.mock.calls[0];
    expect(parts[0].text).toContain('balanced');
  });

  it('sets sizeBytes on the output asset', async () => {
    const model = makeModel(glbBase64);
    const generator = new GeminiModelGenerator(model);

    const result = await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'furniture',
    });

    expect(result.outputAsset.sizeBytes).toBe(glbBytes.byteLength);
  });

  it('accepts a data URI prefixed response from the model', async () => {
    const dataUri = `data:model/gltf-binary;base64,${glbBase64}`;
    const model = makeModel(dataUri);
    const generator = new GeminiModelGenerator(model);

    const result = await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'furniture',
    });

    expect(result.outputAsset.url).toContain(glbBase64);
  });

  it('accepts a markdown base64 code-fenced response', async () => {
    const fenced = '```base64\n' + glbBase64 + '\n```';
    const model = makeModel(fenced);
    const generator = new GeminiModelGenerator(model);

    const result = await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'furniture',
    });

    expect(result.outputAsset.url).toContain(glbBase64);
  });

  it('accepts a plain code-fenced response (no language tag)', async () => {
    const fenced = '```\n' + glbBase64 + '\n```';
    const model = makeModel(fenced);
    const generator = new GeminiModelGenerator(model);

    const result = await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'furniture',
    });

    expect(result.outputAsset.url).toContain(glbBase64);
  });

  it('throws a descriptive error when model returns non-base64 text', async () => {
    const model = makeModel("I'm sorry, I cannot generate 3D models.");
    const generator = new GeminiModelGenerator(model);

    await expect(
      generator.generate({ sourceAsset: makeMediaAsset(), productCategory: 'furniture' }),
    ).rejects.toThrow(/Gemini did not return valid base64 GLB data/);
  });

  it('throws a descriptive error when model returns an empty string', async () => {
    const model = makeModel('');
    const generator = new GeminiModelGenerator(model);

    await expect(
      generator.generate({ sourceAsset: makeMediaAsset(), productCategory: 'furniture' }),
    ).rejects.toThrow(/Gemini did not return valid base64 GLB data/);
  });

  it('prompt instructs model to return base64-encoded data', async () => {
    const model = makeModel(glbBase64);
    const generator = new GeminiModelGenerator(model);

    await generator.generate({
      sourceAsset: makeMediaAsset(),
      productCategory: 'furniture',
    });

    const [parts] = model.generateContent.mock.calls[0];
    expect(parts[0].text).toContain('base64-encoded');
  });
});

// ---------------------------------------------------------------------------
// GeminiImageAnalyzer
// ---------------------------------------------------------------------------

describe('GeminiImageAnalyzer', () => {
  const validResponse = JSON.stringify({
    description: 'A wooden chair with four legs',
    suggestedCategory: 'furniture',
  });

  it('returns parsed description and suggestedCategory', async () => {
    const model = makeModel(validResponse, 20);
    const analyzer = new GeminiImageAnalyzer(model);

    const result = await analyzer.analyze('base64data', 'image/png');

    expect(result.description).toBe('A wooden chair with four legs');
    expect(result.suggestedCategory).toBe('furniture');
  });

  it('returns tokensUsed from usageMetadata', async () => {
    const model = makeModel(validResponse, 55);
    const analyzer = new GeminiImageAnalyzer(model);

    const result = await analyzer.analyze('base64data', 'image/png');

    expect(result.tokensUsed).toBe(55);
  });

  it('defaults tokensUsed to 0 when usageMetadata is absent', async () => {
    const model = {
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => validResponse, usageMetadata: undefined },
      }),
    } as any;
    const analyzer = new GeminiImageAnalyzer(model);

    const result = await analyzer.analyze('base64data', 'image/jpeg');

    expect(result.tokensUsed).toBe(0);
  });

  it('passes mimeType through to inlineData', async () => {
    const model = makeModel(validResponse);
    const analyzer = new GeminiImageAnalyzer(model);

    await analyzer.analyze('base64data', 'image/webp');

    const [parts] = model.generateContent.mock.calls[0];
    expect(parts[1].inlineData.mimeType).toBe('image/webp');
  });

  it('throws when Gemini returns invalid JSON', async () => {
    const model = makeModel('not-valid-json');
    const analyzer = new GeminiImageAnalyzer(model);

    await expect(analyzer.analyze('base64data', 'image/jpeg')).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// GeminiRiskAnalyzer
// ---------------------------------------------------------------------------

describe('GeminiRiskAnalyzer', () => {
  const risks = [
    { risk: 'Buyers cannot judge true scale from photos.', recommendation: 'Add a size-comparison annotation.' },
    { risk: 'Fabric texture is ambiguous.', recommendation: 'Label the material in a hotspot.' },
  ];

  it('returns parsed risk items', async () => {
    const model = makeModel(JSON.stringify(risks));
    const analyzer = new GeminiRiskAnalyzer(model);

    const result = await analyzer.analyze({
      name: 'Linen Sofa',
      category: 'furniture',
      description: 'A comfortable three-seater sofa',
      hotspotCount: 2,
    });

    expect(result).toHaveLength(2);
    expect(result[0].risk).toBe('Buyers cannot judge true scale from photos.');
    expect(result[1].recommendation).toBe('Label the material in a hotspot.');
  });

  it('strips markdown code fences before parsing', async () => {
    const fenced = '```json\n' + JSON.stringify(risks) + '\n```';
    const model = makeModel(fenced);
    const analyzer = new GeminiRiskAnalyzer(model);

    const result = await analyzer.analyze({
      name: 'Velvet Chair',
      category: 'furniture',
      description: '',
      hotspotCount: 0,
    });

    expect(result).toHaveLength(2);
  });

  it('strips plain code fences (no language tag) before parsing', async () => {
    const fenced = '```\n' + JSON.stringify(risks) + '\n```';
    const model = makeModel(fenced);
    const analyzer = new GeminiRiskAnalyzer(model);

    const result = await analyzer.analyze({
      name: 'Side Table',
      category: 'home-decor',
      description: 'Minimalist wooden side table',
      hotspotCount: 1,
    });

    expect(result).toHaveLength(2);
  });

  it('throws when Gemini returns malformed JSON', async () => {
    const model = makeModel('{"broken":');
    const analyzer = new GeminiRiskAnalyzer(model);

    await expect(
      analyzer.analyze({ name: 'X', category: 'other', description: '', hotspotCount: 0 })
    ).rejects.toThrow();
  });

  it('passes the full prompt including product name to generateContent', async () => {
    const model = makeModel(JSON.stringify(risks));
    const analyzer = new GeminiRiskAnalyzer(model);

    await analyzer.analyze({
      name: 'Ceramic Mug',
      category: 'accessories',
      description: 'A handmade ceramic mug',
      hotspotCount: 3,
    });

    const [prompt] = model.generateContent.mock.calls[0];
    expect(prompt).toContain('Ceramic Mug');
    expect(prompt).toContain('accessories');
  });
});
