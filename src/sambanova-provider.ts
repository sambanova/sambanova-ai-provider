import {
  EmbeddingModelV2,
  LanguageModelV2,
  ProviderV2,
  NoSuchModelError,
} from '@ai-sdk/provider';
import {
  OpenAICompatibleChatLanguageModel,
  OpenAICompatibleCompletionLanguageModel,
  OpenAICompatibleEmbeddingModel,
} from '@ai-sdk/openai-compatible';
import {
  FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { SambaNovaCompletionModelId } from './sambanova-completion-options';
import { SambaNovaChatModelId } from './sambanova-chat-options';
import { SambaNovaEmbeddingModelId } from './sambanova-embedding-options';

export interface SambaNovaProviderSettings {
  /**
   * Base URL for the SambaNova API calls.
   */
  baseURL?: string;

  /**
   * API key for authenticating requests.
   */
  apiKey?: string;

  /**
   * Custom headers to include in the requests.
   */
  headers?: Record<string, string>;

  /**
   * Custom fetch implementation. You can use it as a middleware to intercept requests,
   * or to provide a custom fetch implementation for e.g. testing.
   */
  fetch?: FetchFunction;
}

export interface SambaNovaProvider extends ProviderV2 {
  /**
   * Default function returns a chat model.
   */
  (modelId: SambaNovaChatModelId): LanguageModelV2;

  /**
  Creates a completion model for text generation.
  */
  completionModel(modelId: SambaNovaCompletionModelId): LanguageModelV2;

  /**
   * Create a chat model for text generation.
   */
  chatModel(modelId: SambaNovaChatModelId): LanguageModelV2;

  /**
   * Create a language model for text generation.
   */
  languageModel(modelId: SambaNovaChatModelId): LanguageModelV2;

  /**
   * Create a text embedding model.
   */
  textEmbeddingModel(
    modelId: SambaNovaEmbeddingModelId,
  ): EmbeddingModelV2<string>;
}

/**
 * Create a SambaNova provider instance.
 */
export function createSambaNova(
  options: SambaNovaProviderSettings = {},
): SambaNovaProvider {
  const baseURL = withoutTrailingSlash(
    options.baseURL ?? 'https://api.sambanova.ai/v1',
  );

  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: 'SAMBANOVA_API_KEY',
      description: 'SambaNova',
    })}`,
    ...options.headers,
  });

  interface CommonModelConfig {
    provider: string;
    url: ({ path }: { path: string }) => string;
    headers: () => Record<string, string>;
    fetch?: FetchFunction;
    supportsStructuredOutputs: boolean;
  }

  const getCommonModelConfig = (modelType: string): CommonModelConfig => ({
    provider: `sambanova.${modelType}`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch,
    supportsStructuredOutputs: true,
  });

  const createChatModel = (modelId: SambaNovaChatModelId) =>
    new OpenAICompatibleChatLanguageModel(
      modelId,
      getCommonModelConfig('chat'),
    );

  const createCompletionModel = (modelId: SambaNovaCompletionModelId) =>
    new OpenAICompatibleCompletionLanguageModel(
      modelId,
      getCommonModelConfig('completion'),
    );

  const createEmbeddingModel = (modelId: SambaNovaEmbeddingModelId) =>
    new OpenAICompatibleEmbeddingModel(
      modelId,
      getCommonModelConfig('embedding'),
    );

  // Default provider returns a chat model
  const provider = (modelId: SambaNovaChatModelId) => createChatModel(modelId);

  provider.completionModel = createCompletionModel;
  provider.chatModel = createChatModel;
  provider.languageModel = createChatModel;
  provider.textEmbeddingModel = createEmbeddingModel;
  provider.imageModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: 'imageModel' });
  };

  return provider;
}

/**
 * Default SambaNova provider instance.
 */
export const sambanova = createSambaNova();
