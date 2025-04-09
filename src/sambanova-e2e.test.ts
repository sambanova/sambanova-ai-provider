import dotenv from 'dotenv';

import { createSambaNova } from './sambanova-provider';
import { LanguageModelV1Prompt } from '@ai-sdk/provider';
import { JsonTestServer } from '@ai-sdk/provider-utils/test';

dotenv.config();

const TEST_PROMPT: LanguageModelV1Prompt = [
  { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
];
// Replace with the model you wish to test.
const MODEL_NAME = 'Meta-Llama-3.3-70B-Instruct';

// Ensure the SAMBANOVA_API_KEY is set in your environment variables
const sambanovaProvider = createSambaNova({
  apiKey: process.env.SAMBANOVA_API_KEY,
});
const model = sambanovaProvider(MODEL_NAME);

describe('SambaNova E2E Tests', () => {
  const server = new JsonTestServer(
    'https://api.sambanova.ai/v1/chat/completions',
  );
  server.setupTestEnvironment();

  function prepareJsonResponse({
    content = '',
    tool_calls,
    function_call,
    usage = {
      prompt_tokens: 4,
      total_tokens: 34,
      completion_tokens: 30,
    },
    finish_reason = 'stop',
    id = 'chatcmpl-95ZTZkhr0mHNKqerQfiwkuox3PHAd',
    created = 1711115037,
    model = MODEL_NAME,
  }: {
    content?: string;
    tool_calls?: Array<{
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string;
      };
    }>;
    function_call?: {
      name: string;
      arguments: string;
    };
    usage?: {
      prompt_tokens?: number;
      total_tokens?: number;
      completion_tokens?: number;
    };
    finish_reason?: string;
    created?: number;
    id?: string;
    model?: string;
  } = {}) {
    server.responseBodyJson = {
      id,
      object: 'chat.completion',
      created,
      model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content,
            tool_calls,
            function_call,
          },
          finish_reason,
        },
      ],
      usage,
      system_fingerprint: 'fp_3bc1b5746c',
    };
  }

  it('should generate text', async () => {
    prepareJsonResponse({ content: 'Hello. How can I help you today?' });

    try {
      const response = await model.doGenerate({
        inputFormat: 'prompt',
        mode: { type: 'regular' },
        prompt: TEST_PROMPT,
      });

      console.log('Generated text:', response.text);

      // Basic assertion to check if some text was generated
      expect(response.text).toBeDefined();
      expect(response.text?.length).toBeGreaterThan(0);
    } catch (error) {
      console.error('Error generating text:', error);
      // Fail the test if an error occurs
      console.error('Failed to generate text due to an error.');
      throw error;
    }
  });

  it('should use tool provided', async () => {
    prepareJsonResponse({
      tool_calls: [
        {
          type: 'function',
          id: 'call_29b18692920840aea8',
          function: {
            name: 'test-tool',
            arguments: 'value',
          },
        },
      ],
    });

    const response = await model.doGenerate({
      inputFormat: 'prompt',
      prompt: TEST_PROMPT,
      mode: {
        type: 'regular',
        tools: [
          {
            type: 'function',
            name: 'test-tool',
            description: 'test-description',
            parameters: {
              type: 'object',
              properties: {
                value: {
                  type: 'string',
                  description: 'test-param-description',
                },
              },
              required: ['value'],
            },
          },
        ],
        toolChoice: { type: 'required' },
      },
    });

    expect(await server.getRequestBodyJson()).toStrictEqual({
      model: 'Meta-Llama-3.3-70B-Instruct',
      messages: [{ role: 'user', content: 'Hello' }],
      tool_choice: 'required',
      tools: [
        {
          type: 'function',
          function: {
            name: 'test-tool',
            description: 'test-description',
            parameters: {
              type: 'object',
              properties: {
                value: {
                  type: 'string',
                  description: 'test-param-description',
                },
              },
              required: ['value'],
            },
          },
        },
      ],
    });

    expect(response.toolCalls).toStrictEqual([
      {
        toolCallType: 'function',
        toolCallId: 'call_29b18692920840aea8',
        toolName: 'test-tool',
        args: 'value',
      },
    ]);
  });
});
