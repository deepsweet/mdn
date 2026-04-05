import { describe, expect, test } from 'bun:test'
import dedent from 'dedent'
import { chunkMarkdown } from './markdown.ts'

describe('chunkMarkdown', () => {
  test('paragraph', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      Paragraph.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Paragraph.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('header', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      Paragraph 1.

      ## Header 1

      ### Header 1.1

      #### Header 1.1.1

      Paragraph 2.

      ## Header 2

      Paragraph 3.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Paragraph 1.
      `),
      dedent(`
        Title - Header 1 - Header 1.1 - Header 1.1.1:

        Paragraph 2.
      `),
      dedent(`
        Title - Header 2:

        Paragraph 3.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('strong', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      **strong** text **strong**
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        strong text strong
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('em', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      *em* text *em*
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        em text em
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('codespan', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      \`codespan\` text \`codespan\`
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        \`codespan\` text \`codespan\`
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('link', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      text [***link***](url) text
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        text link text
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('blockquote', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      > Blockquote.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Blockquote.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('code', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      \`\`\`ts
      Code line 1
      Code line 2
      \`\`\`
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Example:

        Code line 1
        Code line 2
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('list', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      - item 1
      - item 2
      - item 3
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        - item 1
        - item 2
        - item 3
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('nested list', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      - item 1
      - item 2
        - item 2.1
          - item 2.1.1
          - item 2.1.2
            - item 2.1.2.1
        - item 2.2
      - item 3
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        - item 1
        - item 2
          - item 2.1
            - item 2.1.1
            - item 2.1.2
              - item 2.1.2.1
          - item 2.2
        - item 3
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('definition list', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      - *item 1*
        - : item 1 **definition**.
          Paragraph 1.
          Paragraph 2.
          - \`item 1.1\` [link](url)
            - : \`item 1.1\` definition.
          - item 1.2
            - item 1.2.1
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        - item 1: item 1 definition. Paragraph 1. Paragraph 2.
          - \`item 1.1\` link: \`item 1.1\` definition.
          - item 1.2
            - item 1.2.1
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('definition list + paragraph + blockquote', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      - item 1
        - : item 1 definition.

          Paragraph 1.

          > Blockquote.

          Paragraph 2.

      - item 2
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        - item 1: item 1 definition. Paragraph 1. Blockquote. Paragraph 2.
        - item 2
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('ordered list', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      1. item 1
      2. item 2
      3. item 3
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        - item 1
        - item 2
        - item 3
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('paragraph + paragraph not merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      Paragraph 1.

      ## Header

      Paragraph 2.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Paragraph 1.
      `),
      dedent(`
        Title - Header:

        Paragraph 2.
     `)
    ]

    expect(result).toEqual(expected)
  })

  test('paragraph + paragraph merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      Paragraph 1.

      Paragraph 2.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Paragraph 1.

        Paragraph 2.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('blockquote + blockquote not merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      > Blockquote 1.

      ## Header

      > Blockquote 2.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Blockquote 1.
      `),
      dedent(`
        Title - Header:

        Blockquote 2.
     `)
    ]

    expect(result).toEqual(expected)
  })

  test('blockquote + blockquote merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      > Blockquote 1.

      > Blockquote 2.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Blockquote 1.

        Blockquote 2.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('paragraph + blockquote not merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      Paragraph.

      ## Header

      > Blockquote.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Paragraph.
      `),
      dedent(`
        Title - Header:

        Blockquote.
     `)
    ]

    expect(result).toEqual(expected)
  })

  test('paragraph + blockquote merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      Paragraph.

      > Blockquote.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Paragraph.

        Blockquote.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('blockquote + paragraph not merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      > Blockquote.

      ## Header

      Paragraph.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Blockquote.
      `),
      dedent(`
        Title - Header:

        Paragraph.
     `)
    ]

    expect(result).toEqual(expected)
  })

  test('blockquote + paragraph merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      > Blockquote.

      Paragraph.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Blockquote.

        Paragraph.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('paragraph + code not merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      Paragraph.

      ## Header

      \`\`\`ts
      Code line 1
      Code line 2
      \`\`\`
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Paragraph.
      `),
      dedent(`
        Title - Header:

        Example:

        Code line 1
        Code line 2
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('paragraph + code merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      Paragraph.

      \`\`\`ts
      Code line 1
      Code line 2
      \`\`\`
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Paragraph.

        Example:

        Code line 1
        Code line 2
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('code + code merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      \`\`\`ts
      Code 1 line 1
      Code 1 line 2
      \`\`\`

      \`\`\`ts
      Code 2 line 1
      Code 2 line 2
      \`\`\`
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Example:

        Code 1 line 1
        Code 1 line 2

        Example:

        Code 2 line 1
        Code 2 line 2
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('paragraph + list merging up', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      Paragraph:

      - item 1
      - item 2
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Paragraph:

        - item 1
        - item 2
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('table', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      | Header 1 | Header 2 | Header 3 |
      | -------- | -------- | -------- |
      | Cell 1   | Cell 2   | Cell 3   |
      | Cell 4   | Cell 5   | Cell 6   |
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        - Header 1: Cell 1, Header 2: Cell 2, Header 3: Cell 3
        - Header 1: Cell 4, Header 2: Cell 5, Header 3: Cell 6
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('table empty header', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      |          | Header 2 | Header 3 |
      | -------- | -------- | -------- |
      | Cell 1   | Cell 2   | Cell 3   |
      | Cell 4   | Cell 5   | Cell 6   |
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        - Cell 1, Header 2: Cell 2, Header 3: Cell 3
        - Cell 4, Header 2: Cell 5, Header 3: Cell 6
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('skip sections', () => {
    const input = dedent(`
      ---
      title: Title
      ---

      Paragraph 1.

      ## Browser compatibility

      Paragraph 2.

      ## Header

      Paragraph 3.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        Title:

        Paragraph 1.
      `),
      dedent(`
        Title - Header:

        Paragraph 3.
      `)
    ]

    expect(result).toEqual(expected)
  })
})
