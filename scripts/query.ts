import lancedb from '@lancedb/lancedb'
import { env } from '../src/env.ts'
import { getDatasetPath, getModelPath } from '../src/huggingface.ts'
import { getLlamaContext } from '../src/llama.ts'
import { createReranker, queryHybrid } from '../src/query.ts'
import { getTableName } from '../src/utils.ts'

const query = process.argv[2]

if (query == null || query.length === 0) {
  throw new Error('Query argument is required')
}

// const db = await lancedb.connect('hf://datasets/deepsweet/test/data?revision=v0.0.1')
const datasetPath = await getDatasetPath()
const db = await lancedb.connect(datasetPath)
const reranker = await createReranker()
const tableName = getTableName(env.MDN_DATASET_LOCALE)
const table = await db.openTable(tableName)
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
