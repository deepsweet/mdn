import { chunkMarkdown } from './markdown.ts'

const filePath = process.argv[2]

if (filePath == null || filePath.length === 0) {
  console.error('File path is required')
  process.exit(1)
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
