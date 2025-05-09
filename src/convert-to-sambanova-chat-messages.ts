import {
  LanguageModelV1Prompt,
  UnsupportedFunctionalityError,
} from '@ai-sdk/provider';
import { convertUint8ArrayToBase64 } from '@ai-sdk/provider-utils';
import { SambaNovaChatPrompt } from './sambanova-api-types';

export function convertToSambaNovaChatMessages(
  prompt: LanguageModelV1Prompt,
): SambaNovaChatPrompt {
  const messages: SambaNovaChatPrompt = [];

  for (const { role, content } of prompt) {
    switch (role) {
      case 'system': {
        messages.push({ role: 'system', content });
        break;
      }

      case 'user': {
        if (content.length === 1 && content[0].type === 'text') {
          messages.push({ role: 'user', content: content[0].text });
          break;
        }

        // For multiple content parts, process each part.
        messages.push({
          role: 'user',
          content: content.map((part) => {
            switch (part.type) {
              case 'text': {
                // Plain text conversion.
                return { type: 'text', text: part.text };
              }
              case 'image': {
                // Convert images and encode if necessary.
                if (part.image instanceof URL) {
                  throw new UnsupportedFunctionalityError({
                    functionality: 'Image URLs in user messages',
                  });
                }

                return {
                  type: 'image_url',
                  image_url: {
                    url: `data:${
                      part.mimeType ?? 'image/jpeg'
                    };base64,${convertUint8ArrayToBase64(part.image)}`,
                  },
                };
              }
              case 'file': {
                throw new UnsupportedFunctionalityError({
                  functionality: 'File content parts in user messages',
                });
              }
            }
          }),
        });

        break;
      }

      case 'assistant': {
        let text = '';
        const toolCalls: Array<{
          id: string;
          type: 'function';
          function: { name: string; arguments: string };
        }> = [];

        for (const part of content) {
          switch (part.type) {
            case 'text': {
              text += part.text;
              break;
            }
            case 'tool-call': {
              toolCalls.push({
                id: part.toolCallId,
                type: 'function',
                function: {
                  name: part.toolName,
                  arguments: JSON.stringify(part.args),
                },
              });
              break;
            }
            default: {
              const _exhaustiveCheck = part;
              throw new Error(`Unsupported part: ${_exhaustiveCheck}`);
            }
          }
        }

        messages.push({
          role: 'assistant',
          content: text,
          tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        });

        break;
      }

      case 'tool': {
        for (const toolResponse of content) {
          messages.push({
            role: 'tool',
            tool_call_id: toolResponse.toolCallId,
            content: JSON.stringify(toolResponse.result),
          });
        }
        break;
      }

      default: {
        const _exhaustiveCheck: never = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }

  return messages;
}
