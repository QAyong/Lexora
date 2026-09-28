<script setup lang="ts">
import type { DesktopAppInfo, DesktopUserProfileConfig } from '@buddy-electron/shared/desktopApi'
import type { BuddyLocale } from '@/i18n/buddyI18n'
import { NButton } from 'naive-ui'
import { computed, shallowRef } from 'vue'
import { useBuddyI18n } from '@/i18n/buddyI18n'
import DesktopAccountAvatar from './DesktopAccountAvatar.vue'
import DesktopAccountDialog from './DesktopAccountDialog.vue'
import { resolveUserProfile } from './userProfile'

const props = defineProps<{
  appInfo?: DesktopAppInfo | null
  language: BuddyLocale
  profileConfig?: DesktopUserProfileConfig | null
  updateProfile: (patch: Partial<DesktopUserProfileConfig>) => Promise<boolean>
}>()

const { t } = useBuddyI18n(() => props.language)
const dialogOpen = shallowRef(false)
const resolvedProfile = computed(() => resolveUserProfile(props.profileConfig, props.appInfo))
</script>

<template>
  <section class="desktop-account-settings">
    <h2 class="desktop-account-settings__title">
      {{ t('desktop.account.dialogTitle') }}
    </h2>
    <div class="desktop-account-settings__group">
      <div class="desktop-account-settings__row" data-testid="desktop-account-setting">
        <div class="desktop-account-settings__copy">
          <strong>{{ resolvedProfile.userName }}</strong>
          <small>{{ t('desktop.account.deviceName') }}：{{ resolvedProfile.deviceName }}</small>
        </div>
        <div class="desktop-account-settings__control">
          <DesktopAccountAvatar
            size="medium"
            :avatar-url="resolvedProfile.avatarUrl"
            :background-color="resolvedProfile.avatarColor"
            :initials="resolvedProfile.initials"
            :name="resolvedProfile.userName"
          />
          <NButton size="small" secondary @click="dialogOpen = true">
            {{ t('desktop.account.editProfile') }}
          </NButton>
        </div>
      </div>
    </div>

    <DesktopAccountDialog
      v-model:show="dialogOpen"
      :custom-profile="profileConfig"
      :language="language"
      :resolved-profile="resolvedProfile"
      :update-profile="updateProfile"
    />
  </section>
</template>

<style scoped>
.desktop-account-settings {
  display: grid;
  gap: 0.8rem;
}

.desktop-account-settings__title {
  margin: 0;
  font-size: 0.92rem;
}

.desktop-account-settings__group {
  overflow: hidden;
  border: 1px solid var(--buddy-border-subtle);
  border-radius: 0.65rem;
  background: var(--buddy-surface-base);
}

.desktop-account-settings__row {
  display: grid;
  min-height: 4rem;
  grid-template-columns: minmax(0, 1fr) minmax(10rem, 19rem);
  align-items: center;
  gap: 2rem;
  padding: 0.75rem 0.9rem;
}

.desktop-account-settings__copy {
  display: grid;
  min-width: 0;
  gap: 0.25rem;
}

.desktop-account-settings__copy strong {
  overflow: hidden;
  color: var(--buddy-text-primary);
  font-size: 0.8rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desktop-account-settings__copy small {
  color: var(--buddy-text-secondary);
  font-size: 0.7rem;
  line-height: 1.5;
}

.desktop-account-settings__control {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.55rem;
}

@container (max-width: 560px) {
  .desktop-account-settings__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.7rem;
  }

  .desktop-account-settings__control {
    justify-content: flex-start;
  }
}
</style>
