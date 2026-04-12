import path from 'path'
import { commit } from '@huggingface/hub'
import { z } from 'zod'
import { CACHE_FILENAME } from './const.ts'
import { getCacheFile } from './utils.ts'
import { DATASET_DIR, DATASET_REPO, TABLE_FILENAME } from '../src/const.ts'
import { env } from '../src/env.ts'
import { getDatasetPath } from '../src/huggingface.ts'
import type { CommitOperation } from '@huggingface/hub'

const accessToken = z.string().parse(env.HF_TOKEN)

const COMMIT_MESSAGE = '♻️ update'

const datasetPath = await getDatasetPath()
const rootDir = path.join(datasetPath, TABLE_FILENAME)
const cacheFile = getCacheFile(datasetPath)

const glob = new Bun.Glob('**/*')
const files = glob.scan(rootDir)
const operations: CommitOperation[] = [
  {
    operation: 'delete',
    path: CACHE_FILENAME
  },
  {
    operation: 'addOrUpdate',
    path: CACHE_FILENAME,
    content: cacheFile
  },
  {
    operation: 'delete',
    path: `data/${TABLE_FILENAME}`
  }
]

for await (const file of files) {
  if (file.endsWith('.DS_Store')) {
    continue
  }

  const hfPath = path.join(DATASET_DIR, TABLE_FILENAME, file)
  const fsPath = path.resolve(datasetPath, TABLE_FILENAME, file)
  const fileBlob = Bun.file(fsPath)

  operations.push({
    operation: 'addOrUpdate',
    path: hfPath,
    content: fileBlob
  })
}

const result = await commit({
  accessToken,
  repo: `datasets/${DATASET_REPO}`,
  title: COMMIT_MESSAGE,
  operations
})

console.log(result)
