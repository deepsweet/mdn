#!/usr/bin/env node
import { env } from './env.ts'
import { downloadDataset, downloadModel } from './huggingface.ts'
import { startMcpServer } from './server.ts'

switch (process.argv[2]) {
  case 'download': {
    const locale = process.argv[3] ?? env.MDN_DATASET_LOCALE

    await downloadDataset(locale)
    await downloadModel()
    break
  }
  case 'server': {
    await startMcpServer()
    break
  }
  default: {
    console.error('Unknown or missing command, use "download" or "server"')
    process.exit(1)
  }
}
