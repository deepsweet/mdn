import matter from 'gray-matter'
import { marked } from 'marked'
import { cleanupText } from './cleanup.ts'
import type { Token, Tokens } from 'marked'

// disable GFM autolinks
// https://github.com/markedjs/marked/issues/882
marked.use({
  tokenizer: {
    url() {
      return
    }
  }
})

const SECTIONS_TO_SKIP = [
  'Guides',
  'Related concepts',
  'Glossary terms',
  'Formal syntax',
  'Result',
  'Results',
  'Tutorials',
  'Tutorials and guides',
  'Tutorials/guides',
  'Specifications',
  'Browser compatibility',
  'See also'
]

const mergeText = (chunks: string[]): string => {
  return cleanupText(chunks.join(''))
}

// https://github.com/markedjs/marked/issues/2938
const isHeadingToken = (token: Token): token is Tokens.Heading => token.type === 'heading'
const isParagraphToken = (token: Token): token is Tokens.Paragraph => token.type === 'paragraph'
const isBlockquoteToken = (token: Token): token is Tokens.Blockquote => token.type === 'blockquote'
const isListToken = (token: Token): token is Tokens.List => token.type === 'list'
const isListItemToken = (token: Token): token is Tokens.ListItem => token.type === 'list_item'
const isTableToken = (token: Token): token is Tokens.Table => token.type === 'table'
const isCodeToken = (token: Token): token is Tokens.Code => token.type === 'code'
const isCodespanToken = (token: Token): token is Tokens.Codespan => token.type === 'codespan'
const isLinkToken = (token: Token): token is Tokens.Link => token.type === 'link'
const isTextToken = (token: Token): token is Tokens.Text => token.type === 'text'
const isEmToken = (token: Token): token is Tokens.Em => token.type === 'em'
const isStrongToken = (token: Token): token is Tokens.Strong => token.type === 'strong'
const isSpaceToken = (token: Token): token is Tokens.Space => token.type === 'space'
const isHtmlToken = (token: Token): token is Tokens.HTML => token.type === 'html'

const processTokens = (tokens: Token[], parent: string | null, nestedListLevel: number): string[] => {
  const result: string[] = []
  let isSkippingSection = false
  let isLastChunkHeader = false
  let headers: string[] = []

  const mergeOrAddResult = (text: string): void => {
    if (text.length === 0) {
      return
    }

    if (parent === null) {
      result[result.length - 1] += `\n\n${text}`
      isLastChunkHeader = false
    } else {
      result.push(text)
    }
  }

  for (const token of tokens) {
    if (parent === null && isSkippingSection && !isHeadingToken(token)) {
      continue
    }

    if (isHeadingToken(token)) {
      if (SECTIONS_TO_SKIP.includes(token.text)) {
        isSkippingSection = true

        continue
      }

      isSkippingSection = false

      const chunks = processTokens(token.tokens, 'heading', nestedListLevel)

      if (chunks.length > 0) {
        const text = mergeText(chunks)

        headers[token.depth - 1] = text
        headers.length = token.depth

        const header = `${headers.join(' - ')}:`

        if (isLastChunkHeader) {
          result[result.length - 1] = header
        } else {
          result.push(header)

          isLastChunkHeader = true
        }
      }

      continue
    }

    if (isParagraphToken(token)) {
      const chunks = processTokens(token.tokens, 'paragraph', nestedListLevel)

      if (chunks.length > 0) {
        const text = mergeText(chunks)

        mergeOrAddResult(text)
      }

      continue
    }

    if (isBlockquoteToken(token)) {
      const chunks = processTokens(token.tokens, 'blockquote', nestedListLevel)

      if (chunks.length > 0) {
        const text = mergeText(chunks)

        mergeOrAddResult(text)
      }

      continue
    }

    if (isCodeToken(token)) {
      const text = `Example:\n\n${token.text}`

      mergeOrAddResult(text)

      continue
    }

    if (isListToken(token)) {
      for (const item of token.items) {
        // definition list
        if (
          item.tokens.length === 2 &&
          (isParagraphToken(item.tokens[0]!) || isTextToken(item.tokens[0]!)) &&
          item.tokens[0].tokens != null &&
          isListToken(item.tokens[1]!) &&
          isListItemToken(item.tokens[1].items[0]!) &&
          (isParagraphToken(item.tokens[1].items[0].tokens[0]!) || isTextToken(item.tokens[1].items[0].tokens[0]!)) &&
          item.tokens[1].items[0].tokens[0].text.startsWith(': ')
        ) {
          const firstToken = item.tokens[1].items[0].tokens[0]

          if (isTextToken(firstToken)) {
            item.tokens[0].tokens.push(
              ...item.tokens[1].items[0].tokens[0].tokens!
            )

            if (item.tokens[1].items[0].tokens.length === 2 && isListToken(item.tokens[1].items[0].tokens[1]!)) {
              item.tokens[1].items = item.tokens[1].items[0].tokens[1].items
            } else {
              item.tokens.splice(1, 1)
            }
          } else if (isParagraphToken(firstToken)) {
            item.tokens[0].tokens.push(
              ...item.tokens[1].items[0].tokens
            )

            item.tokens.splice(1)
          }
        }
      }

      const items = processTokens(token.items, 'list', nestedListLevel + 1)

      if (items.length > 0) {
        const text = items.join('\n')

        mergeOrAddResult(text)
      }

      continue
    }

    if (isListItemToken(token)) {
      const chunks = processTokens(token.tokens, 'list-item', nestedListLevel)

      if (chunks.length > 0) {
        const indent = '  '.repeat(nestedListLevel - 1)
        const text = chunks.join('\n')

        result.push(`${indent}- ${text}`)
      }

      continue
    }

    if (isTableToken(token)) {
      const list: string[] = []
      const ths = token.header.map((header) => {
        const chunks = processTokens(header.tokens, 'table', nestedListLevel)
        const text = mergeText(chunks)

        return text
      })

      for (const row of token.rows) {
        let text = '- '

        for (let i = 0; i < row.length; i++) {
          if (ths[i]!.length > 0) {
            text += `${ths[i]}: `
          }

          const chunks = processTokens(row[i]!.tokens, 'table', nestedListLevel)

          text += mergeText(chunks)

          if (i < row.length - 1) {
            text += ', '
          }
        }

        list.push(text)
      }

      if (list.length > 0) {
        const text = list.join('\n')

        mergeOrAddResult(text)
      }

      continue
    }

    if (isEmToken(token) || isStrongToken(token) || isLinkToken(token)) {
      const chunks = processTokens(token.tokens, 'text', nestedListLevel)

      if (chunks.length > 0) {
        const text = mergeText(chunks)

        result.push(text)
      }

      continue
    }

    if (isTextToken(token)) {
      if (token.tokens != null) {
        const chunks = processTokens(token.tokens, 'text', nestedListLevel)

        if (chunks.length > 0) {
          const text = mergeText(chunks)

          result.push(text)
        }
      } else {
        result.push(token.text)
      }

      continue
    }

    if (isCodespanToken(token)) {
      const text = `\`${token.text}\``

      result.push(text)

      continue
    }

    if (isSpaceToken(token) && parent !== null) {
      result.push(' ')

      continue
    }

    if (isHtmlToken(token) && parent === 'heading') {
      result.push(token.text)

      continue
    }
  }

  if (isLastChunkHeader) {
    result.pop()
  }

  return result
}

type TMatter = {
  content: string,
  data: {
    title: string
  }
}

export const chunkMarkdown = (document: string): string[] => {
  const { content, data } = matter(document) as unknown as TMatter
  const tokens = marked.lexer(`# ${data.title}\n\n${content}`)
  const chunks = processTokens(tokens, null, 0)

  return chunks
}
