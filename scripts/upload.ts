import path from 'path'
import { commit } from '@huggingface/hub'
import { z } from 'zod'
import { getDatasetPath } from '../src/huggingface.ts'
import { getTableFileName } from '../src/utils.ts'
import type { CommitOperation } from '@huggingface/hub'

const REPO_NAME = 'deepsweet/mdn'
const COMMIT_MESSAGE = '♻️ update'

const locale = z.string('Locale argument is required').parse(process.argv[2])

const tableFileName = getTableFileName(locale)
const datasetPath = await getDatasetPath()
const rootDir = path.join(datasetPath, tableFileName)

const glob = new Bun.Glob('**/*')
const files = glob.scan(rootDir)
const operations: CommitOperation[] = [{
  operation: 'delete',
  path: `data/${tableFileName}`
}]

for await (const file of files) {
  if (file.endsWith('.DS_Store')) {
    continue
  }

  const fileRelativePath = path.join('data', tableFileName, file)
  const fileAbsolutePath = path.resolve(datasetPath, tableFileName, file)
  const fileBlob = Bun.file(fileAbsolutePath)

  operations.push({
    operation: 'addOrUpdate',
    path: fileRelativePath,
    content: fileBlob
  })
}

const result = await commit({
  accessToken: process.env.HF_TOKEN,
  repo: `datasets/${REPO_NAME}`,
  title: COMMIT_MESSAGE,
  operations
})

console.log(result)
