export type SambaNovaEmbeddingModelId =
  | 'E5-Mistral-7B-Instruct'
  | (string & {});

export interface SambaNovaEmbeddingSettings {
  maxEmbeddingsPerCall?: number;
  truncate?: boolean;
}
