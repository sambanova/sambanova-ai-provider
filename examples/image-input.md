# Image input

For more information, visit [SambaNova Cloud documentation](https://docs.sambanova.ai/cloud/docs/capabilities/vision) on vision models and the respective [API reference](https://docs.sambanova.ai/cloud/api-reference/endpoints/vision-endpoint) page.

```ts
import { sambanova } from 'sambanova-ai-provider';
import { generateText } from 'ai';
import dotenv from 'dotenv';
import fs from 'node:fs';

dotenv.config();

const { text } = await generateText({
  model: sambanova('Llama-3.2-90B-Vision-Instruct'),
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe the image in detail and review it' },
        { image: fs.readFileSync('./example-image.jpg'), type: 'image' },
      ],
    },
  ],
});

console.log(text);
```

You will get an output like this one:

```
The image depicts a solar eclipse, with the moon positioned in front of the sun. The sun's corona is visible as a bright ring around the moon, while the moon itself appears as a dark disk. The image also shows several pinkish-red solar flares or prominences extending from the sun's surface.

**Key Features:**

* **Solar Eclipse:** The moon is positioned in front of the sun, blocking most of its light and creating a dark disk.
* **Sun's Corona:** The sun's corona is visible as a bright ring around the moon, indicating the sun's outer atmosphere.
* **Solar Flares/Prominences:** Several pinkish-red solar flares or prominences are visible extending from the sun's surface, indicating intense magnetic activity.
* **Background:** The background of the image is black, which helps to highlight the details of the solar eclipse.

**Review:**

The image provides a clear and detailed view of a solar eclipse, showcasing the sun's corona and solar flares/prominences. The use of a black background effectively highlights the features of the eclipse, making it easier to observe and study. Overall, the image is a valuable resource for astronomers and space enthusiasts interested in understanding the dynamics of our solar system.
```
