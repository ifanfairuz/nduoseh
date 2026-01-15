<script setup lang="ts">
import { ChevronsUpDown, Plus } from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useBranchStore } from "@/stores/branch.store";
import { computed } from "vue";
import IconByName from "./IconByName.vue";

const { isMobile } = useSidebar();
const store = useBranchStore();
const branch = computed(() => store.branch);
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <p v-if="!branch" class="font-medium">Select a branch</p>
            <div
              v-else
              class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <IconByName :name="branch.logo" class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">
                {{ branch?.name }}
              </span>
              <span class="truncate text-xs">{{ branch?.address }}</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground">
            Branches
          </DropdownMenuLabel>
          <DropdownMenuItem
            v-for="branch in store.branches"
            :key="branch.id"
            class="gap-2 p-2"
            @click="() => store.setBranch(branch)"
          >
            <div
              class="flex size-6 items-center justify-center rounded-sm border"
            >
              <IconByName :name="branch.logo" class="size-3.5 shrink-0" />
            </div>
            {{ branch.name }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 p-2">
            <div
              class="flex size-6 items-center justify-center rounded-md border bg-transparent"
            >
              <Plus class="size-4" />
            </div>
            <div class="font-medium text-muted-foreground">Add branch</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
