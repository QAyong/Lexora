<script setup lang="ts">
import type { LocalNotification } from '@buddy-shared/notifications/notificationApi'
import type { BuddyLocale } from '@/i18n/buddyI18n'
import type { DesktopNavigationEntry } from '@/shared/navigation/desktopPages'
import { Alert20Regular } from '@vicons/fluent'
import { NBadge, NPopover } from 'naive-ui'
import { computed, shallowRef } from 'vue'
import { useBuddyI18n } from '@/i18n/buddyI18n'
import { DesktopNotificationCenter } from '@/modules/notifications/ui'
import DesktopIcon from '@/shared/ui/icon/DesktopIcon.vue'
import DesktopPluginIcon from '@/shared/ui/icon/DesktopPluginIcon.vue'

const props = defineProps<{
  appVersion?: string | null
  language: BuddyLocale
  navigation: readonly DesktopNavigationEntry[]
  notificationItems: ReadonlyArray<LocalNotification>
  notificationLoading: boolean
  notificationUnseenCount: number
}>()
const emit = defineEmits<{
  markAllNotificationsSeen: []
  navigate: [id: string]
  openNotification: [notification: LocalNotification]
  refreshNotifications: []
}>()

const { t } = useBuddyI18n(() => props.language)
const showNotifications = shallowRef(false)
const notificationPopoverThemeOverrides = { padding: '0' } as const
const versionLabel = computed(() => props.appVersion ? `v${props.appVersion}` : '')
const FOOTER_ENTRY_IDS = ['lexora.settings', 'lexora.extensions', 'lexora.automations'] as const
const entries = computed(() => FOOTER_ENTRY_IDS
  .map(id => props.navigation.find(entry => entry.id === id))
  .filter((entry): entry is DesktopNavigationEntry => entry !== undefined))

function updateNotificationVisibility(show: boolean) {
  showNotifications.value = show
  if (show)
    emit('refreshNotifications')
}

function openNotification(notification: LocalNotification) {
  showNotifications.value = false
  emit('openNotification', notification)
}
</script>

<template>
  <footer class="desktop-sidebar-footer">
    <button
      v-for="entry in entries"
      :key="entry.id"
      class="desktop-sidebar-footer__entry"
      :class="{ 'is-active': entry.active }"
      type="button"
      :aria-current="entry.active ? 'page' : undefined"
      :aria-label="entry.title"
      :title="entry.title"
      :data-extension-navigation="entry.extensionId"
      @click="emit('navigate', entry.id)"
    >
      <DesktopPluginIcon v-if="entry.icon.kind === 'plugin'" :src="entry.icon.url" />
      <DesktopIcon v-else-if="entry.icon.kind === 'named'" :name="entry.icon.name" />
      <DesktopIcon v-else :component="entry.icon.component" />
    </button>

    <NPopover
      class="desktop-notification-popover"
      content-class="desktop-notification-popover__content"
      content-style="padding: 0"
      :show="showNotifications"
      trigger="click"
      placement="top-end"
      to=".buddy-app"
      :theme-overrides="notificationPopoverThemeOverrides"
      :width="320"
      @update:show="updateNotificationVisibility"
    >
      <template #trigger>
        <NBadge
          :show="notificationUnseenCount > 0"
          :value="notificationUnseenCount"
          :max="99"
          :offset="[-3, 3]"
          type="info"
        >
          <button
            class="desktop-sidebar-footer__entry desktop-sidebar-footer__notification"
            :class="{ 'is-open': showNotifications }"
            type="button"
            :aria-label="t('desktop.notifications.open')"
            :aria-expanded="showNotifications"
          >
            <DesktopIcon :component="Alert20Regular" />
          </button>
        </NBadge>
      </template>
      <DesktopNotificationCenter
        v-if="showNotifications"
        :items="notificationItems"
        :language="language"
        :loading="notificationLoading"
        :unseen-count="notificationUnseenCount"
        @mark-all-seen="emit('markAllNotificationsSeen')"
        @open="openNotification"
      />
    </NPopover>

    <span
      v-if="versionLabel"
      class="desktop-sidebar-footer__version"
      :title="`${t('desktop.navigation.workspace')} ${versionLabel}`"
    >
      {{ versionLabel }}
    </span>
  </footer>
</template>

<style scoped>
.desktop-sidebar-footer {
  display: flex;
  height: 3rem;
  flex: none;
  align-items: center;
  gap: 0.25rem;
  border-top: 1px solid var(--buddy-border-subtle);
  padding: 0 0.5rem;
}

.desktop-sidebar-footer__entry {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: none;
  place-items: center;
  border: 1px solid transparent;
  border-radius: var(--buddy-icon-button-radius);
  background: transparent;
  color: var(--buddy-text-secondary);
  cursor: pointer;
  padding: 0;
  transition:
    background-color var(--buddy-motion-state-duration) var(--buddy-motion-state-easing),
    border-color var(--buddy-motion-state-duration) var(--buddy-motion-state-easing),
    color var(--buddy-motion-state-duration) var(--buddy-motion-state-easing);
}

.desktop-sidebar-footer__entry:hover {
  border-color: var(--buddy-border-strong);
  background: var(--buddy-state-hover);
  color: var(--buddy-text-strong);
}

.desktop-sidebar-footer__entry:focus-visible {
  outline: 2px solid var(--buddy-focus-ring);
  outline-offset: -2px;
}

.desktop-sidebar-footer__entry.is-active,
.desktop-sidebar-footer__entry.is-open {
  border-color: var(--buddy-accent-border);
  background: var(--buddy-accent-surface-subtle);
  color: var(--buddy-nav-foreground);
}

.desktop-sidebar-footer__version {
  overflow: hidden;
  min-width: 0;
  flex: 0 1 auto;
  margin-left: auto;
  padding-left: 0.35rem;
  color: var(--buddy-text-muted);
  font-size: 11px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desktop-sidebar-footer__notification :deep(.desktop-icon) {
  width: 1rem;
  height: 1rem;
}

.desktop-sidebar-footer :deep(.n-badge-sup) {
  min-width: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 500;
}

:global(.desktop-notification-popover.n-popover) {
  border: 1px solid var(--buddy-border-subtle);
  border-radius: 8px;
  box-shadow: var(--buddy-shadow-raised);
}

:global(.desktop-notification-popover__content.n-popover__content) {
  overflow: hidden;
  border-radius: 7px;
  padding: 0;
}
</style>
