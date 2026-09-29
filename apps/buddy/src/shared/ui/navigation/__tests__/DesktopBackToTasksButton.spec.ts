// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import DesktopBackToTasksButton from '../DesktopBackToTasksButton.vue'

async function mountButton(language: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', name: 'desktop.tasks', component: { template: '<div />' } }],
  })
  await router.push('/')
  await router.isReady()

  const root = document.createElement('div')
  const app = createApp({
    render() {
      return h(DesktopBackToTasksButton, { language })
    },
  })
  app.use(router)
  app.mount(root)
  return { app, root }
}

describe('desktopBackToTasksButton', () => {
  it('links back to the tasks page and labels the action', async () => {
    const { app, root } = await mountButton('zh-CN')
    await nextTick()

    const link = root.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/')
    expect(link?.textContent?.trim()).toBe('返回')
    expect(link?.getAttribute('title')).toBe('返回任务')

    app.unmount()
  })

  it('uses the English label for the en-US locale', async () => {
    const { app, root } = await mountButton('en-US')
    await nextTick()

    expect(root.querySelector('a')?.textContent?.trim()).toBe('Back')

    app.unmount()
  })
})
