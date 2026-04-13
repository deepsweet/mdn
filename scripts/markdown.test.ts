import { describe, expect, test } from 'bun:test'
import dedent from 'dedent'
import { chunkMarkdown } from './markdown.ts'

describe('chunkMarkdown', () => {
  test('paragraph', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      Paragraph.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        Paragraph.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('header', () => {
    const input = dedent(`
      ---
      title: Foo bar Baz_qux
      slug: Web/JavaScript/Reference/Foo_bar/Baz_qux
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
        JavaScript - Foo bar - Baz_qux:

        Paragraph 1.
      `),
      dedent(`
        JavaScript - Foo bar - Baz_qux - Header 1 - Header 1.1 - Header 1.1.1:

        Paragraph 2.
      `),
      dedent(`
        JavaScript - Foo bar - Baz_qux - Header 2:

        Paragraph 3.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('strong', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      **strong** text **strong**
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        strong text strong
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('em', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      *em* text *em*
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        em text em
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('codespan', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      \`codespan\` text \`codespan\`
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        \`codespan\` text \`codespan\`
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('link', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      text [***link***](url) text
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        text link text
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('blockquote', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      > Blockquote.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        Blockquote.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('code', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      \`\`\`ts
      Code line 1
      Code line 2
      \`\`\`
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
      ---

      - item 1
      - item 2
      - item 3
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
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
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
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
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
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
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
      ---

      1. item 1
      2. item 2
      3. item 3
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
      ---

      Paragraph 1.

      ## Header

      Paragraph 2.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        Paragraph 1.
      `),
      dedent(`
        JavaScript - Title - Header:

        Paragraph 2.
     `)
    ]

    expect(result).toEqual(expected)
  })

  test('paragraph + paragraph merging up', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      Paragraph 1.

      Paragraph 2.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
      ---

      > Blockquote 1.

      ## Header

      > Blockquote 2.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        Blockquote 1.
      `),
      dedent(`
        JavaScript - Title - Header:

        Blockquote 2.
     `)
    ]

    expect(result).toEqual(expected)
  })

  test('blockquote + blockquote merging up', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      > Blockquote 1.

      > Blockquote 2.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
      ---

      Paragraph.

      ## Header

      > Blockquote.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        Paragraph.
      `),
      dedent(`
        JavaScript - Title - Header:

        Blockquote.
     `)
    ]

    expect(result).toEqual(expected)
  })

  test('paragraph + blockquote merging up', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      Paragraph.

      > Blockquote.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
      ---

      > Blockquote.

      ## Header

      Paragraph.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        Blockquote.
      `),
      dedent(`
        JavaScript - Title - Header:

        Paragraph.
     `)
    ]

    expect(result).toEqual(expected)
  })

  test('blockquote + paragraph merging up', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      > Blockquote.

      Paragraph.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
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
        JavaScript - Title:

        Paragraph.
      `),
      dedent(`
        JavaScript - Title - Header:

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
      slug: Web/JavaScript/Reference/Title
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
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
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
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
      ---

      Paragraph:

      - item 1
      - item 2
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
      ---

      | Header 1 | Header 2 | Header 3 |
      | -------- | -------- | -------- |
      | Cell 1   | Cell 2   | Cell 3   |
      | Cell 4   | Cell 5   | Cell 6   |
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

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
      slug: Web/JavaScript/Reference/Title
      ---

      |          | Header 2 | Header 3 |
      | -------- | -------- | -------- |
      | Cell 1   | Cell 2   | Cell 3   |
      | Cell 4   | Cell 5   | Cell 6   |
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title:

        - Cell 1, Header 2: Cell 2, Header 3: Cell 3
        - Cell 4, Header 2: Cell 5, Header 3: Cell 6
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('replace &lt; and &gt;', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
      ---

      ## Header &lt;tag&gt;

      Paragraph \`test &lt;tag&gt; test\`.

      Paragraph \`&lt;\` and \`&gt;\`

      Paragraph &lt;tag&gt;.
    `)
    const result = chunkMarkdown(input)
    const expected = [
      dedent(`
        JavaScript - Title - Header <tag>:

        Paragraph \`test &lt;tag&gt; test\`.

        Paragraph \`&lt;\` and \`&gt;\`

        Paragraph <tag>.
      `)
    ]

    expect(result).toEqual(expected)
  })

  test('skip sections', () => {
    const input = dedent(`
      ---
      title: Title
      slug: Web/JavaScript/Reference/Title
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
        JavaScript - Title:

        Paragraph 1.
      `),
      dedent(`
        JavaScript - Title - Header:

        Paragraph 3.
      `)
    ]

    expect(result).toEqual(expected)
  })
})
