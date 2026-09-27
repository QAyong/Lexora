<script setup lang="ts">
import type { ChatSessionReference } from '@haohaoxue/lexora-shared/chat'
import type { BuddyLocale } from '@/i18n/buddyI18n'
import { ChatMultiple20Regular, Dismiss16Regular } from '@vicons/fluent'
import { NButton } from 'naive-ui'
import { useBuddyI18n } from '@/i18n/buddyI18n'
import DesktopIcon from '@/shared/ui/icon/DesktopIcon.vue'

const props = defineProps<{
  language: BuddyLocale
  references: readonly ChatSessionReference[]
  removable?: boolean
  disabled?: boolean
}>()
const emit = defineEmits<{ remove: [id: string] }>()
const { t } = useBuddyI18n(() => props.language)
</script>

<template>
  <div v-if="references.length" class="chat-session-reference-strip" data-session-reference-strip>
    <div
      v-for="reference in references"
      :key="reference.id"
      class="chat-session-reference-card"
      :title="reference.title"
    >
      <DesktopIcon :component="ChatMultiple20Regular" class="chat-session-reference-card__icon" />
      <span class="chat-session-reference-card__title">{{ reference.title }}</span>
      <NButton
        v-if="removable"
        class="buddy-icon-button chat-session-reference-card__remove"
        quaternary
        size="tiny"
        :disabled="disabled"
        :aria-label="t('desktop.chat.removeSessionReference', { title: reference.title })"
        @click="emit('remove', reference.id)"
      >
        <template #icon>
          <DesktopIcon :component="Dismiss16Regular" />
        </template>
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.chat-session-reference-strip { display: flex; min-width: 0; max-width: 100%; flex-wrap: wrap; gap: 8px; padding-bottom: 6px; }
.chat-session-reference-card { display: flex; flex: 0 1 auto; min-width: 0; max-width: min(18rem, 100%); align-items: center; gap: 6px; border: 1px solid var(--buddy-border-subtle); border-radius: var(--buddy-radius-micro); background: var(--buddy-surface-raised); padding: 6px 8px; color: var(--buddy-text-primary); font-size: 12px; }
.chat-session-reference-card__icon { flex: none; color: var(--buddy-accent-text); }
.chat-session-reference-card__title { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-session-reference-card__remove { flex: none; margin: -3px -4px -3px 0; }
</style>
