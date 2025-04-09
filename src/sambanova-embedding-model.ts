import {
  EmbeddingModelV1,
  TooManyEmbeddingValuesForCallError,
} from '@ai-sdk/provider';
import {
  createJsonResponseHandler,
  postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';

import {
  SambaNovaEmbeddingModelId,
  SambaNovaEmbeddingSettings,
} from '@/sambanova-embedding-settings';
import { sambanovaFailedResponseHandler } from './sambanova-error';

type SambaNovaEmbeddingConfig = {
  url: (options: { modelId: string; path: string }) => string;
  fetch?: typeof fetch;
  headers: () => Record<string, string | undefined>;
  provider: string;
};
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
      headers: this.config.headers(),
      body: {
        input: values,
        model: this.modelId,
      },
      // Handle response errors using the provided error structure.
      failedResponseHandler: sambanovaFailedResponseHandler,
      abortSignal,
      fetch: this.config.fetch,
      // Process successful responses based on a minimal schema.
      successfulResponseHandler: createJsonResponseHandler(
        sambaNovaTextEmbeddingResponseSchema,
      ),
    });

    return {
      embeddings: response.embeddings,
      rawResponse: { headers: responseHeaders },
      usage: response.prompt_eval_count
        ? { tokens: response.prompt_eval_count }
        : undefined,
    };
  }
}

const sambaNovaTextEmbeddingResponseSchema = z.object({
  embeddings: z.array(z.array(z.number())),
  prompt_eval_count: z.number().nullable(),
});
