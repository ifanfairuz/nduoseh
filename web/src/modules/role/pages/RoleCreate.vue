<script setup lang="ts">
import RoleForm from "../components/RoleForm.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const onCreated = () => {
  router.push({ name: "roles.list" });
};
</script>

<template>
  <RoleForm type="create" @updated="onCreated" />
</template>
