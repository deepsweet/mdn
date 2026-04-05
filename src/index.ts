#!/usr/bin/env node
import { downloadDataset, downloadModel } from './huggingface.ts'
import { startMcpServer } from './server.ts'

switch (process.argv[2]) {
  case 'download': {
    await downloadDataset()
    await downloadModel()
    break
  }
  case 'server': {
    await startMcpServer()
    break
  }
  default: {
    console.error('Unknown command, use "download" or "server"')
    process.exit(1)
  }
}
