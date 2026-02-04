<script setup lang="ts">
import { GalleryVerticalEnd } from "lucide-vue-next";
</script>

<template>
  <router-link to="/">
    <a class="flex flex-row items-center gap-2 font-medium">
      <div class="flex size-8 items-center justify-center rounded-md">
        <GalleryVerticalEnd class="size-6" />
      </div>
      <span class="sr-only">Acme Inc.</span>
      <h1 class="text-xl font-bold">Acme Inc.</h1>
    </a>
  </router-link>
</template>
