import type { DesktopAppInfo, LexoraDesktopApi } from '@buddy-electron/shared/desktopApi'
import { computed, onScopeDispose, readonly, shallowRef } from 'vue'
import { requireDesktopApi } from '@/platform/desktop/desktopApi'
import { loadDesktopAppInfo } from '@/platform/desktop/desktopCapabilities'

export function useDesktopShellState(api: LexoraDesktopApi = requireDesktopApi()) {
  let disposed = false
  onScopeDispose(() => {
    disposed = true
  })
  const appInfo = shallowRef<DesktopAppInfo | null>(null)

  async function initialize() {
    const info = await loadDesktopAppInfo(api)
    if (!disposed)
      appInfo.value = info
  }

  return {
    appInfo: readonly(appInfo),
    platformCapabilities: computed(() => appInfo.value?.capabilities ?? null),
    initialize,
  }
}
