import os from 'node:os'
import { getLlama, LlamaLogLevel } from 'node-llama-cpp'
import type { LlamaEmbeddingContext } from 'node-llama-cpp'

const MAX_TOKENS = 8192

// https://node-llama-cpp.withcat.ai/guide/embedding
export const getLlamaContext = async (modelPath: string): Promise<LlamaEmbeddingContext> => {
  const threads = Math.floor(os.availableParallelism() / 2)
  const llama = await getLlama({ logLevel: LlamaLogLevel.error })
  const model = await llama.loadModel({ modelPath })
  const context = await model.createEmbeddingContext({
    contextSize: MAX_TOKENS,
    batchSize: MAX_TOKENS,
    threads
  })

  context.onDispose.createOnceListener(() => {
    model.dispose()
      .then(() => llama.dispose())
      .catch(console.error)
  })

  return context
}
