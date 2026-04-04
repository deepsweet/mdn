import path from 'node:path'
import lancedb from '@lancedb/lancedb'
import pAll from 'p-all'
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
], 'update <root> <locale>').parse(process.argv.slice(2))

const modelPath = await getModelPath()
const llamaContext = await getLlamaContext(modelPath)

const datasetPath = await getDatasetPath()
const cacheFileName = getCacheFileName(locale)
const cachePath = path.join(datasetPath, cacheFileName)
const cacheFile = Bun.file(cachePath)
const cache = await cacheFile.json() as Record<string, string>

const db = await lancedb.connect(datasetPath)
const tableName = getTableName(locale)
const table = await db.openTable(tableName)

// all actually existing files
const existingFiles: string[] = []

const glob = new Bun.Glob('**/*.md')
const files = glob.scan(rootDir)
let hasChanges = false

for await (const file of files) {
  const filePath = path.join(rootDir, file)
  const documentFile = Bun.file(filePath)

  if (documentFile.size < MIN_FILE_SIZE) {
    continue
  }

  existingFiles.push(file)

  const document = await documentFile.text()
  const hash = Bun.hash(document).toString(16)

  const isNewFile = !Reflect.has(cache, file)
  const isChangedFile = cache[file] !== hash

  if (isNewFile || isChangedFile) {
    console.log(`${isNewFile ? '+' : '*'} ${file}`)

    if (isChangedFile) {
      await table.delete(`file = '${file}'`)
    }

    hasChanges = true
    cache[file] = hash

    const chunks = chunkMarkdown(document)
    const actions = chunks.map((text) => async (): Promise<TIngestData> => {
      const vector = await vectorize(llamaContext, text)

      return { file, text, vector }
    })
    const data = await pAll(actions, { concurrency: CONCURRENCY })

    await table.add(data)
  }
}

await llamaContext.dispose()

// all files preingested previously
const preingestedFiles: string[] = []
const rowFiles = await table
  .query()
  .select('file')
  .toArray() as { file: string }[]

for (const rowFile of rowFiles) {
  if (!preingestedFiles.includes(rowFile.file)) {
    preingestedFiles.push(rowFile.file)
  }
}

// delete preingested files that no longer exist
for (const preingestedFile of preingestedFiles) {
  if (!existingFiles.includes(preingestedFile)) {
    hasChanges = true

    console.log(`- ${preingestedFile}`)

    Reflect.deleteProperty(cache, preingestedFile)

    await table.delete(`file = '${preingestedFile}'`)
  }
}

if (hasChanges) {
  const indexName = 'text_idx'
  const indexConfig = lancedb.Index.fts()

  await table.dropIndex(indexName)
  await table.optimize({ cleanupOlderThan: new Date() })
  await table.createIndex('text', { config: indexConfig })
  await table.waitForIndex([indexName], 60)

  const cacheData = JSON.stringify(cache)

  await cacheFile.write(cacheData)
}

const stats = await table.stats()

console.log('Total rows:', stats.numRows)

table.close()
db.close()
