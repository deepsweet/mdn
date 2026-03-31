import { chunkMarkdown } from '../src/chunk.ts'

const filePath = process.argv[2]

if (filePath == null || filePath.length === 0) {
  throw new Error('File path argument is required')
}

const documentFile = Bun.file(filePath)
const document = await documentFile.text()
const chunks = chunkMarkdown(document)

const separator = '*'.repeat(process.stdout.columns)

for (let i = 0; i < chunks.length; i++) {
  if (i > 0) {
    console.log(separator)
  }

  console.log(chunks[i])
}
