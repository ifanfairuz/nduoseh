<script setup lang="ts">
import ProfileEditForm from "./ProfileEditForm.vue";
import ProfileImageUpload from "./ProfileImageUpload.vue";
</script>

<template>
  <dashboard-content
    class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-start"
  >
    <ProfileImageUpload class="col-span-1" />
    <ProfileEditForm class="col-span-2" />
  </dashboard-content>
</template>
