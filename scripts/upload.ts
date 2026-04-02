import path from 'path'
import { commit } from '@huggingface/hub'
import type { CommitOperation } from '@huggingface/hub'

const REPO_NAME = 'deepsweet/mdn'
const COMMIT_MESSAGE = '♻️ update'

const rootDir = process.argv[2]

if (rootDir == null || rootDir.length === 0) {
  throw new Error('Root directory argument is required')
}

const glob = new Bun.Glob('**/*')
const files = glob.scan(rootDir)
const operations: CommitOperation[] = [{
  operation: 'delete',
  path: 'data/mdn-en-us.lance'
}]

for await (const fileRelativePath of files) {
  const fileAbsolutePath = path.resolve(rootDir, fileRelativePath)
  const fileBlob = Bun.file(fileAbsolutePath)

  operations.push({
    operation: 'addOrUpdate',
    path: fileRelativePath,
    content: fileBlob
  })
}

const result = await commit({
  accessToken: process.env.HF_TOKEN,
  repo: {
    name: REPO_NAME,
    type: 'dataset'
  },
  title: COMMIT_MESSAGE,
  operations
})

console.log(result)
