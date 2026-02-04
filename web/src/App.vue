<script setup lang="ts">
import "vue-sonner/style.css";
import { computed } from "vue";
import { useAuthStore } from "./stores/auth.store";
import LoaderScreen from "./components/LoaderScreen.vue";
import ProgressBar from "./components/ProgressBar.vue";
import { Toaster } from "@/components/ui/sonner";

const authStore = useAuthStore();
const loading = computed(() => !authStore.inited);
</script>

<template>
  <ProgressBar />
  <loader-screen v-if="loading" />
  <router-view />
  <Toaster />
</template>
