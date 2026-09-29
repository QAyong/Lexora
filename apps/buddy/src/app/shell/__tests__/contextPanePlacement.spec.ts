import { describe, expect, it } from 'vitest'
import { resolveContextPanePlacementOnChange } from '../contextPanePlacement'

describe('context pane placement state', () => {
  it('restores the saved pane state when returning to a task', () => {
    expect(resolveContextPanePlacementOnChange({
      mode: 'task',
      previousMode: 'task',
      taskChanged: true,
      current: { contextOnLeft: false, chatPaneHidden: false },
      savedTaskState: { contextOnLeft: true, chatPaneHidden: true },
    })).toEqual({ contextOnLeft: true, chatPaneHidden: true })
  })

  it('defaults an unseen task to the standard pane layout', () => {
    expect(resolveContextPanePlacementOnChange({
      mode: 'task',
      previousMode: 'task',
      taskChanged: true,
      current: { contextOnLeft: true, chatPaneHidden: true },
    })).toEqual({ contextOnLeft: false, chatPaneHidden: false })
  })

  it('preserves the global pane state across tasks in independent browsing', () => {
    expect(resolveContextPanePlacementOnChange({
      mode: 'independent',
      previousMode: 'independent',
      taskChanged: true,
      current: { contextOnLeft: true, chatPaneHidden: true },
    })).toEqual({ contextOnLeft: true, chatPaneHidden: true })
  })

  it('restores the current task state when switching into task-linked mode', () => {
    expect(resolveContextPanePlacementOnChange({
      mode: 'task',
      previousMode: 'independent',
      taskChanged: false,
      current: { contextOnLeft: true, chatPaneHidden: false },
      savedTaskState: { contextOnLeft: false, chatPaneHidden: true },
    })).toEqual({ contextOnLeft: false, chatPaneHidden: true })
  })
})
