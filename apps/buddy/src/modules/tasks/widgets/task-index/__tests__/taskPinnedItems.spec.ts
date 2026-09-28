import type { LocalConversationSummary } from '@buddy-shared/conversation/conversationApi'
import type { LocalSpace } from '@buddy-shared/spaces/spaceApi'
import { describe, expect, it } from 'vitest'
import { resolveTaskIndexProjection } from '../taskPinnedItems'

function createTask(id: string, spaceId: string | null): LocalConversationSummary {
  return {
    id,
    spaceId,
    title: id,
    updatedAt: '2026-09-29T00:00:00.000Z',
    activity: 'idle',
  } as LocalConversationSummary
}

function createSpace(id: string): LocalSpace {
  return {
    id,
    name: id,
    icon: null,
    iconColor: null,
    primaryDirectory: null,
    revokedAt: null,
  } as unknown as LocalSpace
}

describe('taskIndexProjection pinned conversations', () => {
  it('pins a conversation that belongs to a Space', () => {
    const projection = resolveTaskIndexProjection({
      expandedSpaceIds: new Set(['space-a']),
      pinnedItems: [{ kind: 'conversation', id: 'task-a1' }],
      spaces: [createSpace('space-a')],
      tasks: [createTask('task-a1', 'space-a'), createTask('task-a2', 'space-a')],
    })

    expect(projection.pinnedRows).toEqual([
      { task: expect.objectContaining({ id: 'task-a1' }), key: 'pinned:conversation:task-a1', kind: 'task', pinKey: 'conversation:task-a1', pinnedTopLevel: true },
    ])
    expect(projection.spaceRows.flatMap(row => row.kind === 'task' ? [row.task.id] : [])).toEqual(['task-a2'])
  })

  it('keeps a pinned Space conversation out of the pinned Space expansion', () => {
    const projection = resolveTaskIndexProjection({
      expandedSpaceIds: new Set(['space-a']),
      pinnedItems: [{ kind: 'space', id: 'space-a' }, { kind: 'conversation', id: 'task-a1' }],
      spaces: [createSpace('space-a')],
      tasks: [createTask('task-a1', 'space-a'), createTask('task-a2', 'space-a')],
    })

    expect(projection.pinnedRows.map(row => row.key)).toEqual([
      'pinned:space:space-a',
      'pinned:space:space-a:conversation:task-a2',
      'pinned:conversation:task-a1',
    ])
  })

  it('drops pinned conversations that no longer exist', () => {
    const projection = resolveTaskIndexProjection({
      expandedSpaceIds: new Set(['space-a']),
      pinnedItems: [{ kind: 'conversation', id: 'task-gone' }],
      spaces: [createSpace('space-a')],
      tasks: [createTask('task-a1', 'space-a')],
    })

    expect(projection.pinnedRows).toEqual([])
  })
})
