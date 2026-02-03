<script setup lang="ts" generic="TData">
import type { HeaderContext } from "@tanstack/vue-table";
import { Button } from "../ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-vue-next";

const props = defineProps<{
  ctx: HeaderContext<TData, unknown>;
  sortable: boolean;
}>();

const toggleSort = (e: unknown) => {
  props.ctx.column.getToggleSortingHandler()?.(e);
};
</script>

<template>
  <Button
    v-if="sortable && ctx.column.getCanSort()"
    variant="ghost"
    @click="toggleSort"
  >
    <slot :ctx="ctx" />
    <arrow-down v-if="ctx.column.getIsSorted() === 'asc'" />
    <arrow-up v-else-if="ctx.column.getIsSorted() === 'desc'" />
    <arrow-up-down v-else />
  </Button>
  <slot v-else :ctx="ctx" />
</template>
