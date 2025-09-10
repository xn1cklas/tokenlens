import { describe, it, expect } from 'vitest';
import { fetchModels } from '../src/index.ts';
import type { FetchLike } from '../src/index.ts';

// Small mock catalog matching the models.dev API structure
const mockCatalog = {
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    api: 'https://api.deepseek.com',
    doc: 'https://platform.deepseek.com/api-docs/pricing',
    models: {
      'deepseek-chat': {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        modalities: { input: ['text'], output: ['text'] },
        limit: { context: 128000, output: 8192 },
      },
    },
  },
  xai: {
    id: 'xai',
    name: 'xAI',
    doc: 'https://docs.x.ai/docs/models',
    models: {
      'grok-2': {
        id: 'grok-2',
        name: 'Grok 2',
        modalities: { input: ['text'], output: ['text'] },
        limit: { context: 131072, output: 4096 },
      },
    },
  },
} as const;

function okFetch(): FetchLike {
  return async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => mockCatalog,
    text: async () => JSON.stringify(mockCatalog),
  });
}

function httpErrorFetch(): FetchLike {
  return async () => ({
    ok: false,
    status: 500,
    statusText: 'Internal Error',
    json: async () => ({}),
    text: async () => 'oops',
  });
}

function parseErrorFetch(): FetchLike {
  return async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => {
      throw new Error('invalid json');
    },
    text: async () => 'invalid',
  });
}

function networkErrorFetch(): FetchLike {
  return async () => {
    throw new Error('boom');
  };
}

describe('fetchModels (tokenlens)', () => {
  it('returns the full catalog with no filters', async () => {
    const res = await withMockedFetch(okFetch(), async () => fetchModels());
    expect(res).toEqual(mockCatalog as unknown);
  });

  it('filters by provider', async () => {
    const res = await withMockedFetch(okFetch(), async () => fetchModels({ provider: 'deepseek' }));
    expect(res).toEqual(mockCatalog.deepseek);
  });

  it('filters by provider and model', async () => {
    const res = await withMockedFetch(okFetch(), async () => fetchModels({ provider: 'deepseek', model: 'deepseek-chat' }));
    expect(res).toEqual(mockCatalog.deepseek.models['deepseek-chat']);
  });

  it('searches by model across providers', async () => {
    const res = await withMockedFetch(okFetch(), async () => fetchModels({ model: 'deepseek-chat' }));
    expect(Array.isArray(res)).toBe(true);
    const arr = res as Array<{ provider: string; model: unknown }>;
    expect(arr.length).toBe(1);
    expect(arr[0]!.provider).toBe('deepseek');
  });

  it('propagates HTTP errors with details', async () => {
    await expect(withMockedFetch(httpErrorFetch(), async () => fetchModels())).rejects.toMatchObject({ code: 'HTTP', status: 500 });
  });

  it('propagates parse errors', async () => {
    await expect(withMockedFetch(parseErrorFetch(), async () => fetchModels())).rejects.toMatchObject({ code: 'PARSE' });
  });

  it('propagates network errors', async () => {
    await expect(withMockedFetch(networkErrorFetch(), async () => fetchModels())).rejects.toMatchObject({ code: 'NETWORK' });
  });
});

async function withMockedFetch<T>(mock: FetchLike, run: () => Promise<T>): Promise<T> {
  const original = (globalThis as any).fetch;
  (globalThis as any).fetch = mock;
  try {
    return await run();
  } finally {
    (globalThis as any).fetch = original;
  }
}

