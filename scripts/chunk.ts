import { z } from 'zod'
import { chunkMarkdown } from '../src/chunk.ts'

const filePath = z.string('File path argument is required').parse(process.argv[2])

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
