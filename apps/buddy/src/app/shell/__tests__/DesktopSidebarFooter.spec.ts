// @vitest-environment jsdom
import type { DesktopNavigationEntry } from '@/shared/navigation/desktopPages'
import { VehicleShip20Regular } from '@vicons/fluent'
import { describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import DesktopSidebarFooter from '../DesktopSidebarFooter.vue'

function createNavigation(activeId = 'lexora.tasks'): DesktopNavigationEntry[] {
  return [
    { active: activeId === 'lexora.tasks', id: 'lexora.tasks', icon: { kind: 'component', component: VehicleShip20Regular }, location: { name: 'desktop.tasks' }, title: '任务' },
    { active: activeId === 'lexora.automations', id: 'lexora.automations', icon: { kind: 'component', component: VehicleShip20Regular }, location: { name: 'desktop.automations' }, title: '自动化' },
    { active: activeId === 'lexora.settings', id: 'lexora.settings', icon: { kind: 'named', name: 'navigationSettings' }, location: { name: 'desktop.settings' }, title: '设置' },
    { active: activeId === 'lexora.extensions', id: 'lexora.extensions', icon: { kind: 'component', component: VehicleShip20Regular }, location: { name: 'desktop.extensions' }, title: '插件' },
  ]
}

function mountFooter(options: { activeId?: string, notificationUnseenCount?: number } = {}) {
  const onNavigate = vi.fn()
  const onRefreshNotifications = vi.fn()
  const root = document.createElement('div')
  const app = createApp({
    render() {
      return h(DesktopSidebarFooter, {
        language: 'zh-CN',
        navigation: createNavigation(options.activeId),
        notificationItems: [],
        notificationLoading: false,
        notificationUnseenCount: options.notificationUnseenCount ?? 0,
        onNavigate,
        onRefreshNotifications,
      })
    },
  })
  app.mount(root)
  return { app, onNavigate, onRefreshNotifications, root }
}

describe('desktopSidebarFooter', () => {
  it('renders the module entries in the spec order, then the notification entry', async () => {
    const { app, root } = mountFooter()
    await nextTick()

    const entries = [...root.querySelectorAll('.desktop-sidebar-footer__entry')]
    expect(entries.map(entry => entry.getAttribute('aria-label'))).toEqual(['设置', '插件', '自动化', '打开通知'])

    app.unmount()
  })

  it('marks the entry of the current page as active', async () => {
    const { app, root } = mountFooter({ activeId: 'lexora.settings' })
    await nextTick()

    const entries = [...root.querySelectorAll('.desktop-sidebar-footer__entry')]
    expect(entries.map(entry => entry.classList.contains('is-active'))).toEqual([true, false, false, false])
    expect(entries[0]!.getAttribute('aria-current')).toBe('page')

    app.unmount()
  })

  it('navigates to the module page when an entry is clicked', async () => {
    const { app, onNavigate, root } = mountFooter()
    await nextTick()

    const entries = [...root.querySelectorAll<HTMLElement>('.desktop-sidebar-footer__entry')]
    entries[2]!.click()
    await nextTick()

    expect(onNavigate).toHaveBeenCalledWith('lexora.automations')

    app.unmount()
  })

  it('shows the unseen notification count on the notification entry', async () => {
    const { app, root } = mountFooter({ notificationUnseenCount: 7 })
    await nextTick()

    expect(root.querySelector('.n-badge')?.textContent?.trim()).toContain('7')

    app.unmount()
  })

  it('hides the notification badge when nothing is unseen', async () => {
    const { app, root } = mountFooter({ notificationUnseenCount: 0 })
    await nextTick()

    expect(root.querySelector('.n-badge-sup')).toBeNull()

    app.unmount()
  })
})
