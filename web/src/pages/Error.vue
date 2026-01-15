<script setup lang="ts">
import { computed } from "vue";

interface Action {
  text: string;
  link: string;
}

const props = defineProps<{
  code: number;
  message: string;
  actions: Action[];
}>();

const message = computed(() => {
  if (props.message) {
    return props.message;
  }

  switch (props.code) {
    case 404:
      return "Page not found";
    case 500:
      return "Internal server error";
    case 403:
      return "Forbidden";
    case 401:
      return "Unauthorized";
    case 400:
      return "Bad request";
    default:
      return "An error occurred";
  }
});

const actions = computed(() => {
  if (props.actions) {
    return props.actions;
  }

  switch (props.code) {
    case 404:
      return [
        {
          text: "Go to Home",
          link: "/",
        },
      ];
    case 500:
      return [
        {
          text: "Go to Home",
          link: "/",
        },
      ];
    case 403:
      return [
        {
          text: "Login",
          link: "/login",
        },
      ];
    case 401:
      return [
        {
          text: "Login",
          link: "/login",
        },
      ];
    default:
      return [];
  }
});
</script>

<template>
  <div
    class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
  >
    <h1 class="text-5xl md:text-7xl lg:text-9xl font-bold text-primary/70">
      {{ code }}
    </h1>
    <p class="text-xl md:text-2xl lg:text-3xl">
      {{ message }}
    </p>
    <ul class="flex flex-row gap-4 mt-6">
      <li v-for="action in actions" :key="action.text">
        <a :href="action.link">{{ action.text }}</a>
      </li>
    </ul>
  </div>
</template>
