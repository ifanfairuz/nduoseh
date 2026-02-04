<script setup lang="ts">
import { computed, type Component } from "vue";
import * as icons from "lucide-vue-next";

const props = defineProps<{
  name: string;
}>();

const icon = computed(
  () =>
    (props.name in icons
      ? icons[props.name as keyof typeof icons]
      : icons.Box) as Component
);
</script>

<template>
  <component :is="icon" />
</template>
