<script setup lang="ts">
defineProps<{ message?: string | null }>();
</script>

<template>
  <div class="text-sm text-destructive">
    <p v-if="message" class="mb-2">
      {{ message }}
    </p>
  </div>
</template>
