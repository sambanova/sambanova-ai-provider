import {
  EmbeddingModelV1,
  TooManyEmbeddingValuesForCallError,
} from '@ai-sdk/provider';
import {
  createJsonResponseHandler,
  postJsonToApi,
  combineHeaders,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';

import {
  SambaNovaEmbeddingModelId,
  SambaNovaEmbeddingSettings,
} from '@/sambanova-embedding-settings';
import { sambaNovaFailedResponseHandler } from './sambanova-error';

type SambaNovaEmbeddingConfig = {
  url: (options: { modelId: string; path: string }) => string;
  fetch?: typeof fetch;
  headers: () => Record<string, string | undefined>;
  provider: string;
};

const sambaNovaTextEmbeddingResponseSchema = z.object({
  data: z.array(z.object({ embedding: z.array(z.number()) })),
  usage: z.object({ prompt_tokens: z.number() }).nullish(),
});

export class SambaNovaEmbeddingModel implements EmbeddingModelV1<string> {
  readonly specificationVersion = 'v1';
  readonly modelId: SambaNovaEmbeddingModelId;

  private readonly config: SambaNovaEmbeddingConfig;
  private readonly settings: SambaNovaEmbeddingSettings;

  get provider(): string {
    return this.config.provider;
  }

  get maxEmbeddingsPerCall(): number {
    return this.settings.maxEmbeddingsPerCall ?? 2048;
  }

  get supportsParallelCalls(): boolean {
    return false;
  }

  constructor(
    modelId: SambaNovaEmbeddingModelId,
    settings: SambaNovaEmbeddingSettings,
    config: SambaNovaEmbeddingConfig,
  ) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }

  async doEmbed({
    abortSignal,
    values,
    headers,
  }: Parameters<EmbeddingModelV1<string>['doEmbed']>[0]): Promise<
    Awaited<ReturnType<EmbeddingModelV1<string>['doEmbed']>>
  > {
    if (values.length > this.maxEmbeddingsPerCall) {
      throw new TooManyEmbeddingValuesForCallError({
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        modelId: this.modelId,
        provider: this.provider,
        values,
      });
    }

    const { responseHeaders, value: response } = await postJsonToApi({
      url: this.config.url({
        path: '/embeddings',
        modelId: this.modelId,
      }),
      headers: combineHeaders(this.config.headers(), headers),
      body: {
        input: values,
        model: this.modelId,
      },
      // Handle response errors using the provided error structure.
      failedResponseHandler: sambaNovaFailedResponseHandler,
      // Process successful responses based on a minimal schema.
      successfulResponseHandler: createJsonResponseHandler(
        sambaNovaTextEmbeddingResponseSchema,
      ),
      abortSignal,
      fetch: this.config.fetch,
    });

    // Map response data to output format.
    return {
      embeddings: response.data.map((item) => item.embedding),
      usage: response.usage
        ? { tokens: response.usage.prompt_tokens }
        : undefined,
      rawResponse: { headers: responseHeaders },
    };
  }
}
