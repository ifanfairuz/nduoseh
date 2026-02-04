<script setup lang="ts">
import { useHasPermission } from "@/stores/auth.store";

const props = defineProps<{ if: string | string[] }>();
const authorized = useHasPermission(props.if);
</script>

<template>
  <slot v-if="authorized" />
</template>
