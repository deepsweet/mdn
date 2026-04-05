import { downloadCacheFile, downloadDataset, downloadModel } from '../src/huggingface.ts'

await downloadDataset()
await downloadModel()
await downloadCacheFile()
