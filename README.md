# sambanova-ai-provider

Vercel AI Provider for running LLMs locally using SambaNova's models.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Setup Environment](#setup-environment)
- [Provider Instance](#provider-instance)
- [Models](#models)
  - [Tested models and capabilities](#tested-models-and-capabilities)
  - [Image input](#image-input)
  - [Tool calling](#tool-calling)
- [Examples](#examples)
- [Intercepting Fetch requests](#intercepting-fetch-requests)

## Requirements

API key can be obtained from the [SambaNova Cloud Platform](https://cloud.sambanova.ai/apis).

## Installation

The SambaNova provider is available in the `sambanova-ai-provider` module. You can install it with

```bash
# With npm
npm install sambanova-ai-provider
```

```bash
# With yarn
yarn add sambanova-ai-provider
```

```bash
# With pnpm
pnpm add sambanova-ai-provider
```

## Setup Environment

You will need to setup a `SAMBANOVA_API_KEY` environment variable. You can get your API key on the [SambaNova Cloud Portal](https://cloud.sambanova.ai/apis).

## Provider Instance

You can import the default provider instance `sambanova` from `sambanova-ai-provider`:

```ts
import { sambanova } from 'sambanova-ai-provider';
```

If you need a customized setup, you can import `createSambaNova` from `sambanova-ai-provider` and create a provider instance with your settings:

```ts
import { createSambaNova } from 'sambanova-ai-provider';

const sambanova = createSambaNova({
  apiKey: 'YOUR_API_KEY',
  // Optional settings
});
```

You can use the following optional settings to customize the SambaNova provider instance:

- **baseURL** _string_

  Use a different URL prefix for API calls, e.g. to use proxy servers.
  The default prefix is `https://api.sambanova.ai/v1`.

- **apiKey** _string_

  API key that is being sent using the `Authorization` header. It defaults to the `SAMBANOVA_API_KEY` environment variable\*.

- **headers** _Record&lt;string,string&gt;_

  Custom headers to include in the requests.

- **fetch** _(input: RequestInfo, init?: RequestInit) => Promise&lt;Response&gt;_

  Custom [fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch) implementation.
  Defaults to the global `fetch` function.
  You can use it as a middleware to intercept requests,
  or to provide a custom fetch implementation for e.g. testing.

\* If you set the environment variable in a `.env` file, you will need to use a loader like `dotenv` in order for the script to read it.

## Models

You can use [SambaNova models](https://docs.sambanova.ai/cloud/docs/get-started/supported-models) on the provider instance.
The first argument is the model ID, e.g. `Meta-Llama-3.1-70B-Instruct`.

```ts
const model = sambanova('Meta-Llama-3.1-70B-Instruct');
```

### Tested models and capabilities

This provider is capable of generating and streaming text, interpreting image inputs, run tool callings, and use embeddings.

At least it has been tested with the following features:

| Chat completion    | Image input        | Tool calling       | Embeddings         |
| ------------------ | ------------------ | ------------------ | ------------------ |
| :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |

### Image input

You need to use any of the following models for visual understanding:

- Llama3.2-11B-Vision-Instruct
- Llama3.2-90B-Vision-Instruct

SambaNova vision models don't support URLs.

### Tool calling

You can use any of the [Function calling supported models](https://docs.sambanova.ai/cloud/docs/capabilities/function-calling#supported-models) for tool calling.

### Embeddings

You can use the `E5-Mistral-7B-Instruct` model to use the embeddings feature of the SambaNova provider.

## Example Usage

### Generate text

Basic demonstration of text generation using the SambaNova provider.

```js
import { createSambaNova } from 'sambanova-ai-provider';
import { generateText } from 'ai';

const sambanova = createSambaNova({
  apiKey: 'YOUR_API_KEY',
});

const model = sambanova('Meta-Llama-3.1-70B-Instruct');

const { text } = await generateText({
  model,
  prompt: 'Hello, nice to meet you.',
});

console.log(text);
```

You will get an output text similar to this one:

```
Hello. Nice to meet you too. Is there something I can help you with or would you like to chat?
```

### Tool calling

```ts
import { generateText, tool } from 'ai';
import { sambanova } from 'sambanova-ai-provider';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const model = sambanova('Meta-Llama-3.1-405B-Instruct');

const result = await generateText({
  model,
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
console.log(result.toolCalls);
console.log('Tool results:');
console.log(result.toolResults);
```

And your output will be something like:

```bash
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

## Intercepting Fetch Requests

This provider supports [Intercepting Fetch Requests](https://sdk.vercel.ai/examples/providers/intercepting-fetch-requests).

### Example

```js
import { createSambaNova } from 'sambanova-ai-provider';
import { generateText } from 'ai';

const sambanovaProvider = createSambaNova({
  apiKey: 'YOUR_API_KEY',
  fetch: async (url, options) => {
    console.log(`URL ${url}`);
    console.log(`Headers ${JSON.stringify(options.headers, null, 2)}`);
    console.log(`Body ${JSON.stringify(JSON.parse(options.body), null, 2)}`);

    return await fetch(url, options);
  },
});

const model = sambanovaProvider('Meta-Llama-3.1-70B-Instruct');

await generateText({
  model,
  prompt: 'Hello, nice to meet you.',
});
```

And you will get an output like this:

```bash
URL https://api.sambanova.ai/v1/chat/completions
Headers {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
Body {
  "model": "Meta-Llama-3.1-70B-Instruct",
  "temperature": 0,
  "messages": [
    {
      "role": "user",
      "content": "Hello, nice to meet you."
    }
  ]
}
```
