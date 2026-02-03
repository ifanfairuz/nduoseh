<script setup lang="ts">
import { useRoute } from "vue-router";
import RoleForm from "../components/RoleForm.vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { getRole } from "../role.api";
import { computed } from "vue";
import Loader from "@/components/Loader.vue";

const route = useRoute();

const id = computed(() => route.params["id"] as string);
const client = useQueryClient();
const { data, isPending } = useQuery(
  {
    queryKey: ["roles", id],
    queryFn: () => (id.value ? getRole(id.value) : Promise.resolve(null)),
  },
  client,
);
</script>

<template>
  <RoleForm
    v-if="!isPending"
    type="update"
    :data="data ?? undefined"
    @updated="client.setQueryData(['roles', $event.id], $event)"
  />
  <div v-else class="py-[100px] flex items-center justify-center">
    <Loader size="xl" />
  </div>
</template>
