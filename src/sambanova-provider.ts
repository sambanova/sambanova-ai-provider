import {
  EmbeddingModelV1,
  LanguageModelV1,
  ProviderV1,
} from '@ai-sdk/provider';
import {
  FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { SambaNovaChatLanguageModel } from './sambanova-chat-language-model';
import {
  SambaNovaChatModelId,
  SambaNovaChatSettings,
} from './sambanova-chat-settings';
import {
  SambaNovaEmbeddingModelId,
  SambaNovaEmbeddingSettings,
} from './sambanova-embedding-settings';
import { SambaNovaEmbeddingModel } from './sambanova-embedding-model';

export interface SambaNovaProvider extends ProviderV1 {
  (
    modelId: SambaNovaChatModelId,
    settings?: SambaNovaChatSettings,
  ): LanguageModelV1;

  /**
   Create a chat model for text generation.
   * @param modelId The model ID.
   * @param settings The settings for the model.
   * @returns The chat model.
  */
  chatModel(
    modelId: SambaNovaChatModelId,
    settings?: SambaNovaChatSettings,
  ): LanguageModelV1;

  /**
   Create a language model for text generation.
   * @param modelId The model ID.
   * @param settings The settings for the model.
   * @returns The language model.
  */
  languageModel(
    modelId: SambaNovaChatModelId,
    settings?: SambaNovaChatSettings,
  ): LanguageModelV1;

  /**
   Create a text embedding model.
    * @param modelId The model ID.
    * @returns The text embedding model.
  */
  textEmbeddingModel(
    modelId: SambaNovaEmbeddingModelId,
    settings?: SambaNovaEmbeddingSettings,
  ): EmbeddingModelV1<string>;
}

export interface SambaNovaProviderSettings {
  /**
   Base URL for the SambaNova API calls.
  */
  baseURL?: string;

  /**
   API key for authenticating requests.
  */
  apiKey?: string;

  /**
   Custom headers to include in the requests.
  */
  headers?: Record<string, string>;

  /**
   Custom fetch implementation. You can use it as a middleware to intercept requests,
   or to provide a custom fetch implementation for e.g. testing.
  */
  fetch?: FetchFunction;
}

/**
 Create an SambaNova provider instance.
*/
export function createSambaNova(
  options: SambaNovaProviderSettings = {},
): SambaNovaProvider {
  const baseURL =
    withoutTrailingSlash(options.baseURL) ?? 'https://api.sambanova.ai/v1';

  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: 'SAMBANOVA_API_KEY',
      description: 'SambaNova',
    })}`,
    ...options.headers,
  });

  const createChatModel = (
    modelId: SambaNovaChatModelId,
    settings: SambaNovaChatSettings = {},
  ) =>
    new SambaNovaChatLanguageModel(modelId, settings, {
      provider: 'sambanova.chat',
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
    });

  const createLanguageModel = (
    modelId: SambaNovaChatModelId,
    settings?: SambaNovaChatSettings,
  ) => {
    if (new.target) {
      throw new Error(
        'The SambaNova model function cannot be called with the new keyword.',
      );
    }

    return createChatModel(modelId, settings);
  };

  const createEmbeddingModel = (
    modelId: SambaNovaEmbeddingModelId,
    settings: SambaNovaEmbeddingSettings = {},
  ) =>
    new SambaNovaEmbeddingModel(modelId, settings, {
      provider: 'sambanova.embedding',
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
    });

  // Default provider returns a chat model.
  const provider = function (
    modelId: SambaNovaChatModelId,
    settings?: SambaNovaChatSettings,
  ) {
    return createChatModel(modelId, settings);
  };

  provider.languageModel = createLanguageModel;
  provider.chatModel = createChatModel;
  provider.textEmbeddingModel = createEmbeddingModel;

  return provider;
}

/**
 Default SambaNova provider instance.
*/
export const sambanova = createSambaNova();
