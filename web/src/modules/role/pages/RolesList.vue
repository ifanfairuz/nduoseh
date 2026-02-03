<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-vue-next";

import PermissionScope from "@/components/PermissionScope.vue";
import RolesTable from "../components/RolesTable.vue";
</script>

<template>
  <div class="px-4">
    <PermissionScope if="roles.create">
      <router-link :to="{ name: 'roles.create' }">
        <Button size="sm" type="button">
          <span>Create Role</span>
          <Plus />
        </Button>
      </router-link>
    </PermissionScope>

    <RolesTable editable deletable />
  </div>
</template>
