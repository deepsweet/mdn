import lancedb from '@lancedb/lancedb'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { env } from './env.ts'
import { getDatasetPath, getModelPath } from './huggingface.ts'
import { getLlamaContext } from './llama.ts'
import { createReranker, queryHybrid } from './query.ts'
import { getTableName } from './utils.ts'
import { name as pkgName, version as pkgVersion } from '../package.json'
import type { LlamaEmbeddingContext } from 'node-llama-cpp'

export const startMcpServer = async (): Promise<void> => {
  const datasetPath = await getDatasetPath()
  const db = await lancedb.connect(datasetPath)
  const reranker = await createReranker()
  const server = new McpServer({ name: pkgName, version: pkgVersion })
  const tableName = getTableName(env.MDN_DATASET_LOCALE)
  const table = await db.openTable(tableName)
  const modelPath = await getModelPath()
  const llamaTtl = env.MDN_MODEL_TTL * 1000
  let llamaContext: LlamaEmbeddingContext | null = null
  let llamaTimeout: NodeJS.Timeout | null = null

  server.registerTool(
    'MDN',
    {
      description: 'Reference documentation for Web API, JavaScript, HTML, CSS, SVG and HTTP',
      inputSchema: z.object({
        query: z.string().describe(env.MDN_QUERY_DESCRIPTION)
      })
    },
    async ({ query }) => {
      llamaContext ??= await getLlamaContext(modelPath)

      if (env.MDN_MODEL_TTL > 0) {
        if (llamaTimeout !== null) {
          clearTimeout(llamaTimeout)
        }

        llamaTimeout = setTimeout(() => {
          llamaTimeout = null
          llamaContext?.dispose().catch(console.error)
          llamaContext = null
        }, llamaTtl)
      }

      const results = await queryHybrid(llamaContext, table, reranker, query)

      return {
        content: results.map((result) => ({
          type: 'text',
          text: result.text
        }))
      }
    }
  )

  const transport = new StdioServerTransport()

  await server.connect(transport)
}
