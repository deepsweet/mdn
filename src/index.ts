#!/usr/bin/env node
import { downloadDatasetAndModel } from './download.ts'
import { startMcpServer } from './server.ts'

switch (process.argv[2]) {
  case 'download': {
    await downloadDatasetAndModel(process.argv[3])
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
