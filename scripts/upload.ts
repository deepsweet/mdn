import path from 'path'
import { commit } from '@huggingface/hub'
import { CACHE_FILENAME, DATASET_REPO, TABLE_FILENAME } from '../src/const.ts'
import { getDatasetPath } from '../src/huggingface.ts'
import type { CommitOperation } from '@huggingface/hub'

const accessToken = process.env.HF_TOKEN

if (accessToken == null || accessToken.length === 0) {
  console.error('Access Token is required')
  process.exit(1)
}

const COMMIT_MESSAGE = '♻️ update'

const datasetPath = await getDatasetPath()
const rootDir = path.join(datasetPath, TABLE_FILENAME)

const cachePath = path.join(datasetPath, CACHE_FILENAME)
const cacheFile = Bun.file(cachePath)

const glob = new Bun.Glob('**/*')
const files = glob.scan(rootDir)
const operations: CommitOperation[] = [
  {
    operation: 'delete',
    path: `data/${CACHE_FILENAME}`
  },
  {
    operation: 'addOrUpdate',
    path: `data/${CACHE_FILENAME}`,
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

  const fileRelativePath = path.join('data', TABLE_FILENAME, file)
  const fileAbsolutePath = path.resolve(datasetPath, TABLE_FILENAME, file)
  const fileBlob = Bun.file(fileAbsolutePath)

  operations.push({
    operation: 'addOrUpdate',
    path: fileRelativePath,
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
