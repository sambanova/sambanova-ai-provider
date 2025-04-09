import { EmbeddingModelV1Embedding } from '@ai-sdk/provider';
import { JsonTestServer } from '@ai-sdk/provider-utils/test';

import { createSambaNova } from './sambanova-provider';

const dummyEmbeddings = [
  [0.1, 0.2, 0.3, 0.4, 0.5],
  [0.6, 0.7, 0.8, 0.9, 1],
];
const testValues = ['sunny day at the beach', 'rainy day in the city'];

const provider = createSambaNova({ apiKey: 'test-api-key' });
const model = provider.textEmbeddingModel('E5-Mistral-7B-Instruct');

describe('doEmbed', () => {
  const server = new JsonTestServer('https://api.sambanova.ai/v1/embeddings');

  server.setupTestEnvironment();

  function prepareJsonResponse({
    embeddings = dummyEmbeddings,
    usage = { prompt_tokens: 8, total_tokens: 8 },
  }: {
    embeddings?: EmbeddingModelV1Embedding[];
    usage?: { prompt_tokens: number; total_tokens: number };
  } = {}) {
    server.responseBodyJson = {
      object: 'list',
      data: embeddings.map((embedding, i) => ({
        object: 'embedding',
        index: i,
        embedding,
      })),
      model: 'E5-Mistral-7B-Instruct',
      usage,
    };
  }

  it('should extract embedding', async () => {
    prepareJsonResponse();

    const { embeddings } = await model.doEmbed({ values: testValues });

    expect(embeddings).toStrictEqual(dummyEmbeddings);
  });

  it('should expose the raw response headers', async () => {
    prepareJsonResponse();

    server.responseHeaders = {
      'test-header': 'test-value',
    };

    const { rawResponse } = await model.doEmbed({ values: testValues });

    expect(rawResponse?.headers).toStrictEqual({
      'content-length': '236',
      // default headers:
      'content-type': 'application/json',

      // custom header
      'test-header': 'test-value',
    });
  });

  it('should pass the model and the values', async () => {
    prepareJsonResponse();

    await model.doEmbed({ values: testValues });

    expect(await server.getRequestBodyJson()).toStrictEqual({
      input: testValues,
      model: 'E5-Mistral-7B-Instruct',
    });
  });

  it('should pass custom headers', async () => {
    prepareJsonResponse();

    const sambaNovaProvider = createSambaNova({
      apiKey: 'test-api-key',
      headers: {
        'Custom-Header': 'test-header',
      },
    });

    await sambaNovaProvider
      .textEmbeddingModel('E5-Mistral-7B-Instruct')
      .doEmbed({
        values: testValues,
      });

    const requestHeaders = await server.getRequestHeaders();

    expect(requestHeaders).toStrictEqual({
      authorization: 'Bearer test-api-key',
      'content-type': 'application/json',
      'custom-header': 'test-header',
    });
  });
});
