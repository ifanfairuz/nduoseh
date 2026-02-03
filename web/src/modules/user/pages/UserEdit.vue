<script setup lang="ts">
import { useRoute } from "vue-router";
import UserForm from "../components/UserForm.vue";
import UserRolesManager from "../components/UserRolesManager.vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { getUser } from "../user.api";
import { computed } from "vue";
import Loader from "@/components/Loader.vue";

const route = useRoute();

const id = computed(() => route.params["id"] as string);
const client = useQueryClient();
const { data, isPending } = useQuery(
  {
    queryKey: ["users", id],
    queryFn: () => (id.value ? getUser(id.value) : Promise.resolve(null)),
  },
  client,
);
</script>

<template>
  <div v-if="!isPending" class="space-y-6 px-4 pt-4 pb-10">
    <UserForm
      type="update"
      :data="data ?? undefined"
      @updated="client.setQueryData(['users', $event.id], $event)"
    />
    <UserRolesManager :user-id="id" />
  </div>
  <div v-else class="py-[100px] flex items-center justify-center">
    <Loader size="xl" />
  </div>
</template>
