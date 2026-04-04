import path from 'node:path'
import lancedb from '@lancedb/lancedb'
import pAll from 'p-all'
import { rimraf } from 'rimraf'
import { z } from 'zod'
import { chunkMarkdown } from '../src/chunk.ts'
import { getDatasetPath, getModelPath } from '../src/huggingface.ts'
import { getLlamaContext } from '../src/llama.ts'
import { getCacheFileName, getTableName } from '../src/utils.ts'
import { vectorize } from '../src/vectorize.ts'
import type { TIngestData } from '../src/types.ts'

const MIN_FILE_SIZE = 512
const CONCURRENCY = 2

const [rootDir, locale] = z.tuple([
  z.string('Root directory argument is required'),
  z.string('Locale argument is required')
], 'ingest <root> <locale>').parse(process.argv.slice(2))

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
const tableFileName = getTableName(locale)
const tablePath = path.join(datasetPath, tableFileName)

await rimraf(tablePath)

const tableName = getTableName(locale)
const db = await lancedb.connect(datasetPath)
const table = await db.createTable(tableName, data)

await table.createIndex('text', { config: lancedb.Index.fts() })
await table.waitForIndex(['text_idx'], 60)

const stats = await table.stats()

console.log('Total rows:', stats.numRows)

table.close()
db.close()

const cacheFileName = getCacheFileName(locale)
const cachePath = path.join(datasetPath, cacheFileName)
const cacheFile = Bun.file(cachePath)
const cacheData = JSON.stringify(cache)

await cacheFile.write(cacheData)
