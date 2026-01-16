<script setup lang="ts">
import "vue-sonner/style.css";
import { computed } from "vue";
import { useAuthStore } from "./stores/auth.store";
import LoaderScreen from "./components/LoaderScreen.vue";
import { Toaster } from "@/components/ui/sonner";

const authStore = useAuthStore();
const loading = computed(() => !authStore.inited);
</script>

<template>
  <loader-screen v-if="loading" />
  <Suspense v-else>
    <div>
      <router-view />
      <Toaster />
    </div>
    <template #fallback>
      <loader-screen />
    </template>
  </Suspense>
</template>
