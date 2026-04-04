import { z } from 'zod'
import { downloadDatasetAndModel } from '../src/download.ts'
import { downloadCacheFile } from '../src/huggingface.ts'

const locale = z.string('Locale argument is required').parse(process.argv[2])

await downloadDatasetAndModel(locale)
await downloadCacheFile(locale)
