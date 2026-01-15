<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "./stores/auth.store";
import LoaderScreen from "./components/LoaderScreen.vue";

const authStore = useAuthStore();
const loading = computed(() => !authStore.inited);
</script>

<template>
  <loader-screen v-if="loading" />
  <router-view v-else />
</template>
