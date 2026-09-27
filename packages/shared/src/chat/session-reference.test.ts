import type { ChatSessionReference } from '@haohaoxue/lexora-contracts'
import { describe, expect, it } from 'vitest'
import {
  formatChatSessionReferenceClipboard,
  parseChatSessionReferenceClipboard,
} from './session-reference'

describe('chat session reference clipboard', () => {
  it('round-trips one and multiple references', () => {
    const references: ChatSessionReference[] = [
      { id: 'session-1', title: 'Earlier design' },
      { id: 'session-2', title: 'API decisions' },
    ]

    expect(parseChatSessionReferenceClipboard(formatChatSessionReferenceClipboard(references))).toEqual(references)
  })

  it('sanitizes line breaks in copied titles', () => {
    const clipboard = formatChatSessionReferenceClipboard({ id: 'session-1', title: 'Earlier\ndesign' })

    expect(parseChatSessionReferenceClipboard(clipboard)).toEqual([
      { id: 'session-1', title: 'Earlier design' },
    ])
  })

  it('leaves ordinary or malformed text alone', () => {
    expect(parseChatSessionReferenceClipboard('ordinary paste')).toBeNull()
    expect(parseChatSessionReferenceClipboard('[lexora-session-reference]\ntitle: Missing id\n[/lexora-session-reference]')).toBeNull()
    expect(parseChatSessionReferenceClipboard('[lexora-session-reference]\nid: a\ntitle: A\n[/lexora-session-reference]\nextra')).toBeNull()
  })
})
