import os from 'node:os'
import { getLlama, LlamaLogLevel } from 'node-llama-cpp'
import { MODEL_MAX_TOKENS } from './const.ts'
import type { LlamaEmbeddingContext } from 'node-llama-cpp'

// https://node-llama-cpp.withcat.ai/guide/embedding
export const getLlamaContext = async (modelPath: string): Promise<LlamaEmbeddingContext> => {
  const threads = Math.floor(os.availableParallelism() / 2)
  const llama = await getLlama({ logLevel: LlamaLogLevel.error })
  const model = await llama.loadModel({ modelPath })
  const context = await model.createEmbeddingContext({
    contextSize: MODEL_MAX_TOKENS,
    batchSize: MODEL_MAX_TOKENS,
    threads
  })

  context.onDispose.createOnceListener(() => {
    model.dispose()
      .then(() => llama.dispose())
      .catch(console.error)
  })

  return context
}
