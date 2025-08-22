// https://docs.sambanova.ai/cloud/docs/get-started/supported-models#production-models
// Also check https://docs.sambanova.ai/cloud/api-reference/endpoints/model-list for instructions on how to query the model list endpoint.
export type SambaNovaChatModelId =
  | 'DeepSeek-R1-0528'
  | 'DeepSeek-R1-Distill-Llama-70B'
  | 'DeepSeek-V3-0324'
  | 'Llama-4-Maverick-17B-128E-Instruct'
  | 'Llama-3.3-Swallow-70B-Instruct-v0.4'
  | 'Meta-Llama-3.3-70B-Instruct'
  | 'Meta-Llama-3.1-8B-Instruct'
  | 'Qwen3-32B'
  | (string & {});
