import path from 'node:path'
import lancedb from '@lancedb/lancedb'
import pAll from 'p-all'
import { rimraf } from 'rimraf'
import { chunkMarkdown } from './markdown.ts'
import { CACHE_FILENAME, TABLE_FILENAME, TABLE_NAME } from '../src/const.ts'
import { getDatasetPath, getModelPath } from '../src/huggingface.ts'
import { getLlamaContext } from '../src/llama.ts'
import { vectorize } from '../src/vectorize.ts'
import type { TIngestData } from './types.ts'

const rootDir = process.argv[2]

if (rootDir == null || rootDir.length === 0) {
  console.error('Root directory is required')
  process.exit(1)
}

const MIN_FILE_SIZE = 512
const CONCURRENCY = 2

const glob = new Bun.Glob('**/*.md')
const files = glob.scan(rootDir)
const modelPath = await getModelPath()
const llamaContext = await getLlamaContext(modelPath)
const data: TIngestData[] = []
const cache: Record<string, string> = {}

for await (const file of files) {
  const filePath = path.join(rootDir, file)
  const documentFile = Bun.file(filePath)

  if (documentFile.size < MIN_FILE_SIZE) {
    continue
  }

  console.log(file)

  const document = await documentFile.text()
  const hash = Bun.hash(document).toString(16)

  cache[file] = hash

  const chunks = chunkMarkdown(document)
  const actions = chunks.map((text) => async (): Promise<TIngestData> => {
    const vector = await vectorize(llamaContext, text)

    return { file, text, vector }
  })
  const results = await pAll(actions, { concurrency: CONCURRENCY })

  data.push(...results)
}

await llamaContext.dispose()

const datasetPath = await getDatasetPath()
const tablePath = path.join(datasetPath, TABLE_FILENAME)

await rimraf(tablePath)

const db = await lancedb.connect(datasetPath)
const table = await db.createTable(TABLE_NAME, data)

await table.createIndex('text', { config: lancedb.Index.fts() })
await table.waitForIndex(['text_idx'], 60)

const stats = await table.stats()

console.log('Total rows:', stats.numRows)

table.close()
db.close()

const cachePath = path.join(datasetPath, CACHE_FILENAME)
const cacheFile = Bun.file(cachePath)
const cacheData = JSON.stringify(cache)

await cacheFile.write(cacheData)
