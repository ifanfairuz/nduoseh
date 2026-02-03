<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-vue-next";

import PermissionScope from "@/components/PermissionScope.vue";
import UsersTable from "../components/UsersTable.vue";
</script>

<template>
  <div class="px-4">
    <PermissionScope if="users.create">
      <router-link :to="{ name: 'users.create' }">
        <Button size="sm" type="button">
          <span>Create User</span>
          <Plus />
        </Button>
      </router-link>
    </PermissionScope>

    <UsersTable editable deletable />
  </div>
</template>
