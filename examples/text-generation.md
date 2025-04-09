# Text generation

Basic demonstration of text generation using the SambaNova provider.

```ts
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

## Chat completion

```ts
import { generateText } from 'ai';
import { sambanova } from 'sambanova-ai-provider';
import dotenv from 'dotenv';

dotenv.config();

const model = sambanova('Meta-Llama-3.3-70B-Instruct');

const { text } = await generateText({
  model,
  messages: [
    {
      role: 'system',
      content: 'You are a helpful AI assistant.',
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Answer the question in less than 10 words.',
        },
        {
          type: 'text',
          text: 'Are tomatoes a fruit or a vegetable?',
        },
      ],
    },
  ],
});

console.log(text);
```

You will get an output like this:

```
Tomatoes are a fruit.
```
