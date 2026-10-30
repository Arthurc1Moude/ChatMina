import type { ModelInfo } from './types'

// IDs match the LoRA adapter names served by the FastAPI backend.
export const MODELS: ModelInfo[] = [
  {
    id: 'mina1-luna',
    name: 'Mina1 Luna',
    tagline: 'Natural conversation',
    description:
      'A casual, playful and slightly whimsical conversation partner. Best for everyday chat and open-ended ideas.',
    maxTokens: 256,
  },
  {
    id: 'mina1-numba',
    name: 'Mina1 Numba',
    tagline: 'Focused and precise',
    description:
      'A restrained, deterministic model tuned for concise answers and step-by-step reasoning. Best for factual questions.',
    maxTokens: 128,
  },
]

export const DEFAULT_MODEL_ID = MODELS[0].id

export function getModel(modelId: string): ModelInfo {
  return MODELS.find((m) => m.id === modelId) ?? MODELS[0]
}
