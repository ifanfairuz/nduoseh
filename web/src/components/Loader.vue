<script lang="ts">
import { cva, type VariantProps } from "class-variance-authority";

export const loaderVariants = cva("loader", {
  variants: {
    size: {
      sm: "[--loader-size:16px] [--loader-width:3px]",
      md: "[--loader-size:20px] [--loader-width:3.5px]",
      lg: "[--loader-size:36px] [--loader-width:4px]",
      xl: "[--loader-size:48px] [--loader-width:6px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type LoaderSize = VariantProps<typeof loaderVariants>;
</script>

<script setup lang="ts">
const props = defineProps<{
  size?: LoaderSize["size"];
}>();
</script>

<template>
  <span :class="loaderVariants({ size: size })"></span>
</template>

<style scoped>
:root {
  --loader-size: 48px;
  --loader-width: 5px;
}
.loader {
  width: var(--loader-size);
  height: var(--loader-size);
  border-color: var(--ring);
  border-width: var(--loader-width);
  border-bottom-color: var(--primary);
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
