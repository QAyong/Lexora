<script setup lang="ts">
import { computed } from 'vue'
import { useBuddyI18n } from '@/i18n/buddyI18n'
import DesktopSettingsPageLayout from '@/modules/settings/layouts/DesktopSettingsPageLayout.vue'
import { useSettingsContext } from '@/modules/settings/settingsContext'
import DesktopAccountSettings from '@/modules/settings/widgets/account/DesktopAccountSettings.vue'
import DesktopGeneralSettings from '@/modules/settings/widgets/app/DesktopGeneralSettings.vue'

const { appInfo, applicationSettings, profile } = useSettingsContext()
const { t } = useBuddyI18n(applicationSettings.language)
const { config, settingsError, language, updateSettings } = applicationSettings
const profileConfig = computed(() => profile.config.value)
</script>

<template>
  <DesktopSettingsPageLayout :requires-runtime="false">
    <template #title>
      {{ t('desktop.settings.category.general') }}
    </template>
    <template #description>
      {{ t('desktop.settings.categoryDescription.general') }}
    </template>
    <DesktopAccountSettings
      :app-info="appInfo"
      :language="language"
      :profile-config="profileConfig"
      :update-profile="profile.update"
    />
    <DesktopGeneralSettings
      :config="config"
      :error="settingsError"
      :language="language"
      :update-settings="updateSettings"
    />
  </DesktopSettingsPageLayout>
</template>
