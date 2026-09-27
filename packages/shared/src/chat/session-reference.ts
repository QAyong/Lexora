import type { ChatSessionReference } from '@haohaoxue/lexora-contracts'

export type { ChatSessionReference } from '@haohaoxue/lexora-contracts'
export { ChatSessionReferenceSchema, ChatSessionReferencesSchema } from '@haohaoxue/lexora-contracts'

const OPEN_MARKER = '[lexora-session-reference]'
const CLOSE_MARKER = '[/lexora-session-reference]'

/** Serialize one or more session references into a recognizable clipboard block. */
export function formatChatSessionReferenceClipboard(references: ChatSessionReference | ChatSessionReference[]): string {
  const items = Array.isArray(references) ? references : [references]
  return items.map((reference) => {
    const title = reference.title.replace(/[\r\n]+/g, ' ').trim()
    return [OPEN_MARKER, `id: ${reference.id.trim()}`, `title: ${title}`, CLOSE_MARKER].join('\n')
  }).join('\n\n')
}

/** Return null for ordinary text or malformed clipboard data. */
export function parseChatSessionReferenceClipboard(text: string): ChatSessionReference[] | null {
  const input = text.trim()
  if (!input.startsWith(OPEN_MARKER) || !input.endsWith(CLOSE_MARKER)) {
    return null
  }

  const references: ChatSessionReference[] = []
  let cursor = 0

  while (cursor < input.length) {
    const openIndex = input.indexOf(OPEN_MARKER, cursor)
    if (openIndex < 0) {
      break
    }

    const contentStart = openIndex + OPEN_MARKER.length
    const closeIndex = input.indexOf(CLOSE_MARKER, contentStart)
    if (closeIndex < 0) {
      return null
    }

    const fields = new Map<string, string>()
    for (const line of input.slice(contentStart, closeIndex).split(/\r?\n/)) {
      const separator = line.indexOf(':')
      if (separator < 0) {
        continue
      }
      const key = line.slice(0, separator).trim().toLowerCase()
      if (key) {
        fields.set(key, line.slice(separator + 1).trim())
      }
    }

    const id = fields.get('id')?.trim()
    const title = fields.get('title')?.replace(/[\r\n]+/g, ' ').trim()
    if (!id || !title) {
      return null
    }

    references.push({ id, title })
    cursor = closeIndex + CLOSE_MARKER.length
    const trailing = input.slice(cursor).trim()
    if (trailing && !trailing.startsWith(OPEN_MARKER)) {
      return null
    }
  }

  return references.length ? references : null
}
