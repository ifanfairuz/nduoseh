<script setup lang="ts">
import { computed } from "vue";
import type { Role } from "@nduoseh/contract";
import type { ColumnDef } from "@tanstack/vue-table";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import QueryTable from "@/components/datatable/QueryTable.vue";
import { getRoles } from "../role.api";
import { h } from "vue";
import RolesRowAction from "./RolesRowAction.vue";
import { useHasPermission } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";

const props = withDefaults(
  defineProps<{
    editable?: boolean;
    deletable?: boolean;
  }>(),
  {
    editable: false,
    deletable: false,
  },
);

const _columns: ColumnDef<Role, Role>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
  },
  {
    id: "slug",
    accessorKey: "slug",
    header: "Slug",
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description || "-",
  },
  {
    id: "permissions",
    accessorKey: "permissions",
    header: "Permissions",
    sortingFn: (a, b, _) => {
      return a.original.permissions.length - b.original.permissions.length;
    },
    cell: ({ row }) =>
      h(Badge, { variant: "secondary" }, () => row.original.permissions.length),
  },
  {
    id: "is_system",
    accessorKey: "is_system",
    header: "System",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.is_system
        ? h(Badge, { variant: "default" }, () => "System")
        : "-",
  },
];

const canEdit = useHasPermission("roles.update");
const canDelete = useHasPermission("roles.delete");

const columns = computed(() => {
  if (!props.editable && !props.deletable) {
    return _columns;
  }

  return [
    ..._columns,
    {
      header: "#",
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        return h(RolesRowAction, {
          data: row.original,
          editable: canEdit.value,
          deletable: canDelete.value && !row.original.is_system,
          onInvalidateData: () => {
            client.invalidateQueries();
          },
        });
      },
    },
  ];
});

const client = useQueryClient();
const query = useQuery(
  {
    queryKey: ["roles"],
    placeholderData: keepPreviousData,
    queryFn: getRoles,
  },
  client,
);
</script>

<template>
  <div class="container py-4 mx-auto">
    <QueryTable
      client-process
      query-key="roles"
      :columns="columns"
      :query="query"
    />
  </div>
</template>
