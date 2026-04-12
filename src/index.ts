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
    console.log('Usage:')
    console.log('  npx -y @deepsweet/mdn@latest <command>\n')
    console.log('Available commands:')
    console.log('  download  Download dataset and embedding model')
    console.log('  server    Start MCP server')
    process.exit(1)
  }
}
