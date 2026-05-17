import { GeminiVisualQa } from './gemini-visual-qa.js';
import type { VisualQaInput } from './gemini-visual-qa.js';

function makeModel(responseText: string) {
  return {
    generateContent: jest.fn().mockResolvedValue({
      response: { text: () => responseText },
    }),
  } as any;
}

function makePrimitive(): VisualQaInput['generatedPrimitive'] {
  return {
    shape: 'box',
    detectedType: 'other',
    widthM: 0.3,
    heightM: 0.4,
    depthM: 0.2,
    baseColor: [0.8, 0.6, 0.4, 1.0],
    roughness: 0.6,
    metalness: 0.1,
  };
}

const goodResponse = JSON.stringify({
  conversionSucceeded: true,
  qualityScore: 75,
  status: 'good',
  categoryMatch: { score: 7, reason: 'Box approximates the product shape adequately' },
  missingParts: [],
  sourceImageIssues: [],
  recommendedActions: [],
});

const failedResponse = JSON.stringify({
  conversionSucceeded: false,
  qualityScore: 25,
  status: 'failed',
  categoryMatch: { score: 2, reason: 'Electronics cannot be represented as a primitive box' },
  missingParts: ['circuit board detail', 'screen', 'ports'],
  sourceImageIssues: [],
  recommendedActions: ['Correct the product category from furniture to electronics.', 'A complex mesh is required.'],
});

describe('GeminiVisualQa', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'image/jpeg' },
      arrayBuffer: () => Promise.resolve(new Uint8Array([0xff, 0xd8]).buffer),
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches source images and passes them as inlineData to the model', async () => {
    const model = makeModel(goodResponse);
    const qa = new GeminiVisualQa(model);

    await qa.evaluate({
      sourceImageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      productCategory: 'furniture',
      generatedPrimitive: makePrimitive(),
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    const [parts] = model.generateContent.mock.calls[0];
    expect(parts[0]).toHaveProperty('text');
    expect(parts[1]).toHaveProperty('inlineData');
  });

  it('returns a passing GeminiQaResult for a good response', async () => {
    const model = makeModel(goodResponse);
    const qa = new GeminiVisualQa(model);

    const result = await qa.evaluate({
      sourceImageUrls: ['https://example.com/img.jpg'],
      productCategory: 'furniture',
      generatedPrimitive: makePrimitive(),
    });

    expect(result.conversionSucceeded).toBe(true);
    expect(result.qualityScore).toBe(75);
    expect(result.status).toBe('good');
    expect(result.categoryMatch.score).toBe(7);
  });

  it('returns a failed GeminiQaResult for an electronics product miscategorised as furniture', async () => {
    const model = makeModel(failedResponse);
    const qa = new GeminiVisualQa(model);

    const result = await qa.evaluate({
      sourceImageUrls: ['https://example.com/phone.jpg'],
      productCategory: 'electronics',
      generatedPrimitive: makePrimitive(),
    });

    expect(result.conversionSucceeded).toBe(false);
    expect(result.qualityScore).toBe(25);
    expect(result.status).toBe('failed');
    expect(result.categoryMatch.score).toBe(2);
    expect(result.missingParts).toContain('screen');
    expect(result.recommendedActions[0]).toContain('electronics');
  });

  it('strips markdown code fences from the model response', async () => {
    const fenced = '```json\n' + goodResponse + '\n```';
    const model = makeModel(fenced);
    const qa = new GeminiVisualQa(model);

    const result = await qa.evaluate({
      sourceImageUrls: ['https://example.com/img.jpg'],
      productCategory: 'furniture',
      generatedPrimitive: makePrimitive(),
    });

    expect(result.qualityScore).toBe(75);
  });

  it('returns critical_failure when no source images can be loaded', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false } as any);
    const model = makeModel(goodResponse);
    const qa = new GeminiVisualQa(model);

    const result = await qa.evaluate({
      sourceImageUrls: ['https://example.com/broken.jpg'],
      productCategory: 'furniture',
      generatedPrimitive: makePrimitive(),
    });

    expect(result.status).toBe('critical_failure');
    expect(result.qualityScore).toBe(0);
    expect(result.conversionSucceeded).toBe(false);
    expect(model.generateContent).not.toHaveBeenCalled();
  });

  it('returns critical_failure when model returns unparseable JSON', async () => {
    const model = makeModel('not valid json at all');
    const qa = new GeminiVisualQa(model);

    const result = await qa.evaluate({
      sourceImageUrls: ['https://example.com/img.jpg'],
      productCategory: 'furniture',
      generatedPrimitive: makePrimitive(),
    });

    expect(result.status).toBe('critical_failure');
    expect(result.qualityScore).toBe(0);
  });

  it('caps qualityScore to 0-100 range', async () => {
    const outOfRange = JSON.stringify({ ...JSON.parse(goodResponse), qualityScore: 150 });
    const model = makeModel(outOfRange);
    const qa = new GeminiVisualQa(model);

    const result = await qa.evaluate({
      sourceImageUrls: ['https://example.com/img.jpg'],
      productCategory: 'furniture',
      generatedPrimitive: makePrimitive(),
    });

    expect(result.qualityScore).toBe(100);
  });

  it('limits source images to 5', async () => {
    const model = makeModel(goodResponse);
    const qa = new GeminiVisualQa(model);
    const urls = Array.from({ length: 8 }, (_, i) => `https://example.com/img${i}.jpg`);

    await qa.evaluate({ sourceImageUrls: urls, productCategory: 'furniture', generatedPrimitive: makePrimitive() });

    expect(global.fetch).toHaveBeenCalledTimes(5);
  });

  it('includes shape description for a cylinder primitive', async () => {
    const model = makeModel(goodResponse);
    const qa = new GeminiVisualQa(model);

    await qa.evaluate({
      sourceImageUrls: ['https://example.com/img.jpg'],
      productCategory: 'home-decor',
      generatedPrimitive: { ...makePrimitive(), shape: 'cylinder' },
    });

    const [parts] = model.generateContent.mock.calls[0];
    expect(parts[0].text).toContain('cylinder');
  });

  it('includes shape description for a sphere primitive', async () => {
    const model = makeModel(goodResponse);
    const qa = new GeminiVisualQa(model);

    await qa.evaluate({
      sourceImageUrls: ['https://example.com/img.jpg'],
      productCategory: 'accessories',
      generatedPrimitive: { ...makePrimitive(), shape: 'sphere' },
    });

    const [parts] = model.generateContent.mock.calls[0];
    expect(parts[0].text).toContain('sphere');
  });
});
