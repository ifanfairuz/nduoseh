<template>
  <Transition name="fade">
    <div
      v-if="isLoading"
      class="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent"
    >
      <div
        class="h-full bg-primary transition-all duration-200 ease-in-out shadow-lg shadow-primary/50"
        :style="{ width: `${progress}%` }"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useProgressBar } from "../composables/useProgressBar";

const { isLoading, progress } = useProgressBar();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
