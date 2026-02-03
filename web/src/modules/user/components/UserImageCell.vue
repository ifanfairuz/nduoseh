<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@panah/contract";
const props = defineProps<{
  data: User;
}>();
</script>

<template>
  <Avatar>
    <AvatarImage
      :src="data.image ?? ''"
      alt="user image"
      class="object-cover w-full h-full"
    />
    <AvatarFallback>
      {{ data.callname?.substring(0, 2).toUpperCase() }}
    </AvatarFallback>
  </Avatar>
</template>
