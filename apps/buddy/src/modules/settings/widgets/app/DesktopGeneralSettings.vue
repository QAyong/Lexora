<script setup lang="ts">
import type { LexoraConfigPatch } from '@buddy-electron/shared/desktopApi'
import type { BuddyPermissionMode } from '@buddy-shared/permissions/permissionMode'
import type { ApplicationSettingsProps } from './typing'
import { BUDDY_PERMISSION_MODES } from '@buddy-shared/permissions/permissionMode'
import { NSelect, NSpin, NSwitch, useMessage } from 'naive-ui'
import { computed, shallowRef, useId } from 'vue'
import { useBuddyI18n } from '@/i18n/buddyI18n'
import { DesktopFullAccessConfirmationDialog } from '@/modules/prompt-input'

type GeneralSettingField = 'language' | 'contextPanelMode' | 'contextPanelGlobal' | 'minimizeToTrayOnClose' | 'permissionMode'

const props = defineProps<ApplicationSettingsProps>()
const { languageOptions, t } = useBuddyI18n(() => props.language)
const fullAccessConfirmationText = computed(() => ({
  acknowledgement: t('desktop.settings.runtime.fullAccessDefaultAcknowledgement'),
  cancelLabel: t('common.cancel'),
  confirmLabel: t('desktop.settings.runtime.fullAccessDefaultConfirm'),
  description: t('desktop.settings.runtime.fullAccessDefaultDescription'),
  title: t('desktop.settings.runtime.fullAccessDefaultTitle'),
}))
const message = useMessage()
const pendingFields = shallowRef<ReadonlySet<GeneralSettingField>>(new Set())
const globalPanelLabelId = useId()
const minimizeToTrayLabelId = useId()
const permissionModeLabelId = useId()
const fullAccessConfirmationOpen = shallowRef(false)
const contextPanelModes = computed(() => [
  { label: t('desktop.settings.contextPanelTask'), value: 'task' },
  { label: t('desktop.settings.contextPanelIndependent'), value: 'independent' },
])
const permissionModeLabelKeys: Record<BuddyPermissionMode, 'desktop.chat.executionProfileReadOnly' | 'desktop.chat.permissionModeManual' | 'desktop.chat.permissionModePolicy' | 'desktop.chat.executionProfileFull'> = {
  full_access: 'desktop.chat.executionProfileFull',
  manual_approval: 'desktop.chat.permissionModeManual',
  policy_approval: 'desktop.chat.permissionModePolicy',
  read_only: 'desktop.chat.executionProfileReadOnly',
}
const permissionModeOptions = computed(() => BUDDY_PERMISSION_MODES.map(value => ({
  label: t(permissionModeLabelKeys[value]),
  value,
})))

function selectPermissionMode(value: string) {
  if (!BUDDY_PERMISSION_MODES.includes(value as BuddyPermissionMode) || !props.config)
    return
  if (value === 'full_access') {
    fullAccessConfirmationOpen.value = true
    return
  }
  void updateSetting('permissionMode', { desktop: { chat: { permissionMode: value as BuddyPermissionMode } } })
}

function confirmFullAccess() {
  fullAccessConfirmationOpen.value = false
  void updateSetting('permissionMode', { desktop: { chat: { permissionMode: 'full_access' } } })
}

async function updateSetting(field: GeneralSettingField, patch: LexoraConfigPatch) {
  if (pendingFields.value.has(field))
    return
  pendingFields.value = new Set([...pendingFields.value, field])
  try {
    if (!await props.updateSettings(patch))
      message.error(t('desktop.settings.saveFailed'))
  }
  finally {
    pendingFields.value = new Set([...pendingFields.value].filter(item => item !== field))
  }
}
</script>

<template>
  <section v-if="config" class="desktop-general-settings">
    <section class="desktop-general-settings__section">
      <h2 class="desktop-general-settings__title">
        {{ t('desktop.settings.category.general') }}
      </h2>
      <div class="desktop-general-settings__group">
        <div class="desktop-settings-row" data-testid="default-permission-mode-setting">
          <div class="desktop-settings-row__copy">
            <strong :id="permissionModeLabelId">{{ t('desktop.settings.defaultPermissionMode') }}</strong>
            <small>{{ t('desktop.settings.defaultPermissionModeDescription') }}</small>
          </div>
          <div class="desktop-settings-row__control">
            <NSelect
              :aria-labelledby="permissionModeLabelId"
              :options="permissionModeOptions"
              :value="config.desktop.chat.permissionMode"
              :disabled="pendingFields.has('permissionMode')"
              @update:value="selectPermissionMode"
            />
            <NSpin v-if="pendingFields.has('permissionMode')" size="small" />
          </div>
        </div>
        <div class="desktop-settings-row">
          <strong>{{ t('settings.language') }}</strong>
          <div class="desktop-settings-row__control">
            <NSelect
              :options="languageOptions"
              :value="config.desktop.language"
              :disabled="pendingFields.has('language')"
              @update:value="updateSetting('language', { desktop: { language: $event } })"
            />
            <NSpin v-if="pendingFields.has('language')" size="small" />
          </div>
        </div>
      </div>
    </section>
    <section class="desktop-general-settings__section">
      <h2 class="desktop-general-settings__title">
        {{ t('desktop.settings.windowBehavior') }}
      </h2>
      <div class="desktop-general-settings__group">
        <div class="desktop-settings-row" data-testid="minimize-to-tray-setting">
          <div class="desktop-settings-row__copy">
            <strong :id="minimizeToTrayLabelId">{{ t('desktop.settings.minimizeToTrayOnClose') }}</strong>
            <small>{{ t('desktop.settings.minimizeToTrayOnCloseDescription') }}</small>
          </div>
          <div class="desktop-settings-row__control desktop-settings-row__control--toggle">
            <NSwitch
              :aria-labelledby="minimizeToTrayLabelId"
              :round="false"
              :value="config.desktop.minimizeToTrayOnClose"
              :loading="pendingFields.has('minimizeToTrayOnClose')"
              :disabled="pendingFields.has('minimizeToTrayOnClose')"
              @update:value="updateSetting('minimizeToTrayOnClose', { desktop: { minimizeToTrayOnClose: $event } })"
            />
          </div>
        </div>
      </div>
    </section>
    <section class="desktop-general-settings__section">
      <h2 class="desktop-general-settings__title">
        {{ t('desktop.settings.contextPanel') }}
      </h2>
      <div class="desktop-general-settings__group">
        <div class="desktop-settings-row" data-testid="context-panel-mode-setting">
          <div class="desktop-settings-row__copy">
            <strong>{{ t('desktop.settings.contextPanelMode') }}</strong>
            <small>{{ t('desktop.settings.contextPanelModeDescription') }}</small>
          </div>
          <div class="desktop-settings-row__control">
            <NSelect
              :options="contextPanelModes"
              :value="config.desktop.contextPanelMode"
              :disabled="pendingFields.has('contextPanelMode')"
              @update:value="updateSetting('contextPanelMode', { desktop: { contextPanelMode: $event } })"
            />
            <NSpin v-if="pendingFields.has('contextPanelMode')" size="small" />
          </div>
        </div>
        <div class="desktop-settings-row" data-testid="context-panel-global-setting">
          <div class="desktop-settings-row__copy">
            <strong :id="globalPanelLabelId">{{ t('desktop.settings.contextPanelGlobal') }}</strong>
            <small>{{ t('desktop.settings.contextPanelGlobalDescription') }}</small>
          </div>
          <div class="desktop-settings-row__control desktop-settings-row__control--toggle">
            <NSwitch
              :aria-labelledby="globalPanelLabelId"
              :round="false"
              :value="config.desktop.contextPanelGlobal"
              :loading="pendingFields.has('contextPanelGlobal')"
              :disabled="pendingFields.has('contextPanelGlobal')"
              @update:value="updateSetting('contextPanelGlobal', { desktop: { contextPanelGlobal: $event } })"
            />
          </div>
        </div>
      </div>
    </section>
    <DesktopFullAccessConfirmationDialog
      v-model:show="fullAccessConfirmationOpen"
      :text="fullAccessConfirmationText"
      @confirm="confirmFullAccess"
    />
  </section>
</template>

<style scoped>
.desktop-general-settings {
  display: grid;
  gap: 1.8rem;
  container-type: inline-size;
}

.desktop-general-settings__section {
  display: grid;
  gap: 0.8rem;
}

.desktop-general-settings__title {
  margin: 0;
  font-size: 0.92rem;
}

.desktop-general-settings__group {
  overflow: hidden;
  border: 1px solid var(--buddy-border-subtle);
  border-radius: 0.65rem;
  background: var(--buddy-surface-base);
}

.desktop-settings-row {
  display: grid;
  min-height: 4rem;
  grid-template-columns: minmax(0, 1fr) minmax(10rem, 19rem);
  align-items: center;
  gap: 2rem;
  border-bottom: 1px solid var(--buddy-border-subtle);
  padding: 0.75rem 0.9rem;
}

.desktop-settings-row:last-child {
  border-bottom: 0;
}

.desktop-settings-row__copy {
  display: grid;
  gap: 0.25rem;
}

.desktop-settings-row strong {
  color: var(--buddy-text-primary);
  font-size: 0.8rem;
  font-weight: 600;
}

.desktop-settings-row small {
  color: var(--buddy-text-secondary);
  font-size: 0.7rem;
  line-height: 1.5;
}

.desktop-settings-row__control {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
}

.desktop-settings-row__control--toggle {
  grid-template-columns: auto;
  justify-items: end;
}

@container (max-width: 560px) {
  .desktop-settings-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.7rem;
  }
}
</style>
