<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="desktop-workspace-sidebar-identity">
    <strong class="desktop-workspace-sidebar-identity__label">{{ label }}</strong>
  </div>
</template>

<style scoped>
.desktop-workspace-sidebar-identity {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
}

.desktop-workspace-sidebar-identity__label {
  overflow: hidden;
  color: var(--buddy-nav-foreground);
  font-size: var(--buddy-sidebar-header-font-size);
  font-weight: var(--buddy-sidebar-header-font-weight);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
