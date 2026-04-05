import lancedb from '@lancedb/lancedb'
import { TABLE_NAME } from '../src/const.ts'
import { getDatasetPath, getModelPath } from '../src/huggingface.ts'
import { getLlamaContext } from '../src/llama.ts'
import { createReranker, queryHybrid } from '../src/query.ts'

const query = process.argv[2]

if (query == null || query.length === 0) {
  console.error('Query is required')
  process.exit(1)
}

const datasetPath = await getDatasetPath()
const db = await lancedb.connect(datasetPath)
const reranker = await createReranker()
const table = await db.openTable(TABLE_NAME)
const modelPath = await getModelPath()
const llamaContext = await getLlamaContext(modelPath)
const results = await queryHybrid(llamaContext, table, reranker, query)

const separator = '*'.repeat(process.stdout.columns)

for (let i = 0; i < results.length; i++) {
  if (i > 0) {
    console.log(separator)
  }

  console.log(results[i]!.text)
}

table.close()
db.close()

await llamaContext.dispose()
