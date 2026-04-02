import path from 'node:path'
import lancedb from '@lancedb/lancedb'
import pAll from 'p-all'
import { rimraf } from 'rimraf'
import { chunkMarkdown } from '../src/chunk.ts'
import { env } from '../src/env.ts'
import { getDatasetPath, getModelPath } from '../src/huggingface.ts'
import { getLlamaContext } from '../src/llama.ts'
import { getTableName } from '../src/utils.ts'
import { type TVector, vectorize } from '../src/vectorize.ts'

const MIN_FILE_SIZE = 512
const CONCURRENCY = 2

const rootDir = process.argv[2]

if (rootDir == null || rootDir.length === 0) {
  throw new Error('Root directory argument is required')
}

const datasetPath = await getDatasetPath()
const tableName = getTableName(env.MDN_DATASET_LOCALE)
const tablePath = path.join(datasetPath, `${tableName}.lance`)

await rimraf(tablePath)

type TData = {
  text: string,
  vector: TVector
}

const glob = new Bun.Glob('**/*.md')
const files = glob.scan(rootDir)
const modelPath = await getModelPath()
const llamaContext = await getLlamaContext(modelPath)
const data: TData[] = []

for await (const file of files) {
  const filePath = path.join(rootDir, file)
  const documentFile = Bun.file(filePath)

  if (documentFile.size < MIN_FILE_SIZE) {
    continue
  }

  const document = await documentFile.text()

  console.log(filePath)

  const chunks = chunkMarkdown(document)
  const actions = chunks.map((text) => async (): Promise<TData> => {
    const vector = await vectorize(llamaContext, text)

    return { text, vector }
  })
  const results = await pAll(actions, { concurrency: CONCURRENCY })

  data.push(...results)
}

await llamaContext.dispose()

const db = await lancedb.connect(datasetPath)
const table = await db.createTable(tableName, data)

await table.createIndex('text', { config: lancedb.Index.fts() })
await table.waitForIndex(['text_idx'], 60)

const stats = await table.stats()

console.log(stats)

table.close()
db.close()
