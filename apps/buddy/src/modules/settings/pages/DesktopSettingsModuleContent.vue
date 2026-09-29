<script setup lang="ts">
import type { SettingsModuleNode } from '../model/settingsRegistry'
import { computed, toRef } from 'vue'
import DesktopSettingsModuleLayout from '../layouts/DesktopSettingsModuleLayout.vue'
import { useSettingsContext } from '../settingsContext'
import { useProvideSettingsModule } from '../state/settingsModuleContext'
import DesktopAccountSettings from '../widgets/account/DesktopAccountSettings.vue'
import { settingsPageRenderers } from './settingsPageRenderers'

const props = defineProps<{ module: SettingsModuleNode }>()
useProvideSettingsModule(toRef(() => props.module))
const { appInfo, applicationSettings, profile } = useSettingsContext()
const language = applicationSettings.language
const profileConfig = computed(() => profile.config.value)
const renderer = computed(() => props.module.page ? settingsPageRenderers[props.module.page] : DesktopSettingsModuleLayout)
</script>

<template>
  <component :is="renderer">
    <DesktopAccountSettings
      v-if="module.id === 'settings.general'"
      :app-info="appInfo"
      :language="language"
      :profile-config="profileConfig"
      :update-profile="profile.update"
    />
  </component>
</template>
