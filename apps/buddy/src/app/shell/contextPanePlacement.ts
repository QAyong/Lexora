import type { DesktopContextPanelMode } from '@buddy-electron/shared/desktopApi'

export interface ContextPanePlacementState {
  contextOnLeft: boolean
  chatPaneHidden: boolean
}

export function resolveContextPanePlacementOnChange(input: {
  mode: DesktopContextPanelMode
  previousMode: DesktopContextPanelMode
  taskChanged: boolean
  current: ContextPanePlacementState
}): ContextPanePlacementState {
  return {
    contextOnLeft: input.mode === 'task' && (input.mode !== input.previousMode || input.taskChanged)
      ? false
      : input.current.contextOnLeft,
    chatPaneHidden: input.taskChanged ? false : input.current.chatPaneHidden,
  }
}
