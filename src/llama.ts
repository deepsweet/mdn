import { getLlama } from 'node-llama-cpp'
import type { LlamaEmbeddingContext } from 'node-llama-cpp'

const MAX_TOKENS = 8192

// https://node-llama-cpp.withcat.ai/guide/embedding
export const getLlamaContext = async (modelPath: string): Promise<LlamaEmbeddingContext> => {
  const llama = await getLlama()
  const model = await llama.loadModel({ modelPath })
  const context = await model.createEmbeddingContext({
    contextSize: MAX_TOKENS,
    batchSize: MAX_TOKENS,
    threads: 0
  })

  return context
}
