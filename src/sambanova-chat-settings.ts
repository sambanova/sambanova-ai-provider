// https://docs.sambanova.ai/cloud/docs/get-started/supported-models#production-models
// Also check https://docs.sambanova.ai/cloud/api-reference/endpoints/model-list for instructions on how to query the model list endpoint.
export type SambaNovaChatModelId =
  | 'DeepSeek-R1'
  | 'DeepSeek-R1-Distill-Llama-70B'
  | 'DeepSeek-V3-0324'
  | 'Llama-4-Maverick-17B-128E-Instruct'
  | 'Llama-4-Scout-17B-16E-Instruct'
  | 'Meta-Llama-3.3-70B-Instruct'
  | 'Meta-Llama-3.2-3B-Instruct'
  | 'Meta-Llama-3.2-1B-Instruct'
  | 'Meta-Llama-3.1-405B-Instruct'
  | 'Meta-Llama-3.1-8B-Instruct'
  | 'QwQ-32B'
  | (string & {});

export interface SambaNovaChatSettings {
  /**
Whether to enable parallel function calling during tool use. Default to true.
   */
  parallelToolCalls?: boolean;

  /**
A unique identifier representing your end-user, which can help OpenAI to
monitor and detect abuse. Learn more.
*/
  user?: string;

  /**
Automatically download images and pass the image as data to the model.
SambaNova supports image URLs for public models, so this is only needed for
private models or when the images are not publicly accessible.

Defaults to `false`.
   */
  downloadImages?: boolean;
}
