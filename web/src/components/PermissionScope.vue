<script setup lang="ts">
import { useAuthStore } from "@/stores/auth.store";
import { computed } from "vue";

const props = defineProps<{ if: string | string[] }>();
const store = useAuthStore();

const authorized = computed(() => {
  if (!store.permissions) return false;
  return store.hasPermission(props.if);
});
</script>

<template>
  <slot v-if="authorized" />
</template>
