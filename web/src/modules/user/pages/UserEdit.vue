<script setup lang="ts">
import { useRoute } from "vue-router";
import UserForm from "../components/UserForm.vue";
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
  <UserForm
    v-if="!isPending"
    type="update"
    :data="data ?? undefined"
    @updated="client.setQueryData(['users', $event.id], $event)"
  />
  <div v-else class="py-[100px] flex items-center justify-center">
    <Loader size="xl" />
  </div>
</template>
