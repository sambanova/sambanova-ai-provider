# Tool calling

For more information, visit [SambaNova Cloud documentation](https://docs.sambanova.ai/cloud/docs/capabilities/function-calling) on function calling models.

```ts
import { sambanova } from 'sambanova-ai-provider';
import { generateText, tool } from 'ai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const { toolCalls, toolResults } = await generateText({
  model: sambanova('Meta-Llama-3.1-405B-Instruct'),
  messages: [
    {
      role: 'system',
      content: 'You are a helpful AI assistant.',
    },
    { role: 'user', content: 'What is the weather in San Francisco?' },
  ],
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  toolChoice: 'auto',
});

console.log('Tool calls:');
console.log(toolCalls);
console.log('Tool results:');
console.log(toolResults);
```

And your output will be something like:

```
Tool calls:
[
  {
    type: 'tool-call',
    toolCallId: 'call_02c10aa37b224d46ac',
    toolName: 'weather',
    args: { location: 'San Francisco' }
  }
]
Tool results:
[
  {
    type: 'tool-result',
    toolCallId: 'call_02c10aa37b224d46ac',
    toolName: 'weather',
    args: { location: 'San Francisco' },
    result: { location: 'San Francisco', temperature: 82 }
  }
]
```

It's important to note that you can use both Zod schemas and raw JSON schemas. For more information see the [Schemas documentation](https://github.com/vercel/ai/blob/main/content/docs/02-foundations/04-tools.mdx#schemas) on Vercel AI's repository.
