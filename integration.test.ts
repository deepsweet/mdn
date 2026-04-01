import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { expect } from 'bun:test'
import { env } from './src/env.ts'

const client = new Client({
  name: 'test-client',
  version: '0.1.0'
})
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['.', 'server'],
  env: {
    NODE_LLAMA_CPP_NO_GPU: 'true',
    NODE_LLAMA_CPP_DEBUG: 'true'
  }
})

await client.connect(transport)

const tools = await client.listTools()

expect(tools.tools.length).toEqual(1)
expect(tools.tools[0]!.name).toEqual('MDN')
expect(tools.tools[0]!.description).toEqual('Reference documentation for Web API, JavaScript, HTML, CSS, SVG and HTTP')
expect(tools.tools[0]!.inputSchema).toEqual({
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: env.MDN_QUERY_DESCRIPTION
    }
  },
  required: ['query'],
  $schema: 'http://json-schema.org/draft-07/schema#'
})

type TResult = {
  content: {
    type: 'text',
    text: string
  }[]
}
const result = await client.callTool({
  name: 'MDN',
  arguments: {
    query: 'Promise.race() description'
  }
}) as TResult

expect(result.content.length).toBe(env.MDN_SEARCH_RESULTS_LIMIT)

const answer = 'The `Promise.race()` method is one of the promise concurrency methods'
const hasAnswer = result.content.some((item) => item.text.includes(answer))

expect(hasAnswer).toBeTrue()

await client.close()
await transport.close()

console.log('DONE')
process.exit(0)
