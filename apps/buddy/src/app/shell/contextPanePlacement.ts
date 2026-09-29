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
  savedTaskState?: ContextPanePlacementState | null
}): ContextPanePlacementState {
  if (input.mode === 'task' && (input.mode !== input.previousMode || input.taskChanged)) {
    return input.savedTaskState ?? { contextOnLeft: false, chatPaneHidden: false }
  }
  return input.current
}
