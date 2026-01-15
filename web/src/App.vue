<script setup lang="ts">
import { nextTick, ref } from "vue";
import { useAuthStore } from "./stores/auth.store";
import { onBeforeMount } from "vue";
import LoaderScreen from "./components/LoaderScreen.vue";

const authStore = useAuthStore();
const loading = ref(true);
onBeforeMount(async () => {
  await authStore.init();
  nextTick(() => {
    loading.value = false;
  });
});
</script>

<template>
  <loader-screen v-if="loading" />
  <router-view v-else />
</template>
