<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";
import NavMain from "@/components/NavMain.vue";
import NavUser from "@/components/NavUser.vue";
import BranchSwitcher from "@/components/BranchSwitcher.vue";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <BranchSwitcher />
    </SidebarHeader>
    <SidebarContent>
      <NavMain />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
