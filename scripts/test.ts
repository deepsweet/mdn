import { Client, StdioClientTransport } from '@modelcontextprotocol/client'
import { expect } from 'bun:test'
import { env } from '../src/env.ts'

const client = new Client({
  name: 'test-client',
  version: '0.1.0'
})
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['.', 'server']
})

await client.connect(transport)

const tools = await client.listTools()
const tool = tools.tools[0]!

expect(tools.tools.length).toEqual(1)
expect(tool.name).toEqual('MDN')
expect(tool.description).toEqual('Reference documentation for Web API, JavaScript, HTML, CSS, SVG and HTTP')
expect(tool.inputSchema).toEqual({
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: env.MDN_QUERY_DESCRIPTION
    }
  },
  required: ['query'],
  $schema: 'https://json-schema.org/draft/2020-12/schema'
})
expect(tool.outputSchema).toEqual({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  required: [
    'results'
  ],
  additionalProperties: false
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
