<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useSettingsContext } from '@/modules/settings/settingsContext'
import DesktopSettingsSidebar from '@/modules/settings/widgets/navigation/DesktopSettingsSidebar.vue'
import { useDesktopUi } from '@/shared/ui/desktopUiContext'
import WorkbenchLayout from '@/workbench/browser/layout/WorkbenchLayout.vue'

const { platformCapabilities } = useSettingsContext()
const { language } = useDesktopUi()
</script>

<template>
  <WorkbenchLayout :language="language">
    <template #sidebar>
      <DesktopSettingsSidebar
        :language="language"
        :capabilities="platformCapabilities"
      />
    </template>
    <RouterView />
  </WorkbenchLayout>
</template>
