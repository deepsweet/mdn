import type { LlamaEmbeddingContext } from 'node-llama-cpp'
import type { TVector } from './types.ts'

export const vectorize = async (context: LlamaEmbeddingContext, text: string): Promise<TVector> => {
  const embedding = await context.getEmbeddingFor(text)
  const vector = embedding.vector as TVector

  return vector
}
