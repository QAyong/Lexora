import type { AgentChatApiClient } from '../../clients/chat'
import type { AgentChatModel } from '../../integrations/model-providers/chat-model'
import { AIMessageChunk } from '@langchain/core/messages'
import { describe, expect, it, vi } from 'vitest'
import { createSessionAskToolDescriptor } from './sessionAsk'

describe('session_ask runtime tool', () => {
  it('asks an isolated model using the referenced session transcript', async () => {
    const getReferencedChatSession = vi.fn().mockResolvedValue({
      sessionId: 'past-session',
      title: 'Earlier decision',
      messages: [{
        index: 0,
        messageId: 'message-1',
        role: 'user',
        createdAt: '2026-01-01T00:00:00.000Z',
        content: 'We chose PostgreSQL for persistence.',
      }],
    })
    const stream = vi.fn(async () => (async function* () {
      yield new AIMessageChunk({ content: 'The earlier decision was PostgreSQL.' })
    })())
    const descriptor = createSessionAskToolDescriptor({
      chatApi: { getReferencedChatSession } as unknown as AgentChatApiClient,
      model: { stream } as unknown as AgentChatModel,
    })

    const result = await descriptor.execute({
      context: {
        generationId: 'generation-1',
        sessionReferences: [{ id: 'past-session', title: 'Earlier decision' }],
      },
      sessionId: 'current-session',
      toolCalls: [{
        id: 'tool-call-1',
        name: 'session_ask',
        args: { question: 'Which database did we choose?' },
        type: 'tool_call',
      }],
      loadedSkills: [],
    })

    expect(getReferencedChatSession).toHaveBeenCalledWith({
      generationId: 'generation-1',
      sessionId: 'past-session',
    })
    expect(stream).toHaveBeenCalledOnce()
    expect(JSON.stringify(stream.mock.calls[0]?.[0])).toContain('We chose PostgreSQL for persistence.')
    expect(JSON.stringify(stream.mock.calls[0]?.[0])).toContain('Which database did we choose?')
    expect(result.toolMessages[0]?.content).toBe('The earlier decision was PostgreSQL.')
  })

  it('returns an error tool result when the reference is no longer readable', async () => {
    const descriptor = createSessionAskToolDescriptor({
      chatApi: {
        getReferencedChatSession: vi.fn().mockRejectedValue(new Error('not found')),
      } as unknown as AgentChatApiClient,
      model: { stream: vi.fn() } as unknown as AgentChatModel,
    })

    const result = await descriptor.execute({
      context: {
        generationId: 'generation-1',
        sessionReferences: [{ id: 'removed-session', title: 'Removed' }],
      },
      sessionId: 'current-session',
      toolCalls: [{
        id: 'tool-call-2',
        name: 'session_ask',
        args: { question: 'What happened?' },
        type: 'tool_call',
      }],
      loadedSkills: [],
    })

    expect(result.toolMessages[0]?.status).toBe('error')
    expect(result.toolMessages[0]?.content).toContain('no longer available')
  })
})
