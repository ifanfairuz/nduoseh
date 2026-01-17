<script setup lang="ts">
import { LayoutDashboard, Users } from "lucide-vue-next";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import PermissionScope from "./PermissionScope.vue";
</script>

<template>
  <SidebarGroup>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton as-child>
          <router-link :to="{ name: 'dashboard' }">
            <LayoutDashboard />
            <span>Dashboard</span>
          </router-link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
  <PermissionScope :if="['users.*', 'roles.*']">
    <SidebarGroup>
      <SidebarGroupLabel>Administrator</SidebarGroupLabel>
      <SidebarMenu>
        <PermissionScope if="users.list">
          <SidebarMenuItem>
            <SidebarMenuButton as-child>
              <router-link :to="{ name: 'users.list' }">
                <Users />
                <span>User</span>
              </router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </PermissionScope>
      </SidebarMenu>
    </SidebarGroup>
  </PermissionScope>
</template>
