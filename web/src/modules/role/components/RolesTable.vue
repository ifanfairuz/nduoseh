<script setup lang="ts">
import { computed, ref } from "vue";
import type { Role } from "@panah/contract";
import type { ColumnDef, SortingState } from "@tanstack/vue-table";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import QueryTable from "@/components/datatable/QueryTable.vue";
import {
  toSortQueries,
  type DataTablePagination,
  type QueryTableState,
} from "@/components/datatable";
import { getRoles } from "../role.api";
import { useRoute } from "vue-router";
import { updateQueryParam } from "@/lib/utils";
import { useDebounceFn } from "@vueuse/core";
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
    enableSorting: false,
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

const route = useRoute();
const q_keyword = route.query.roles_keyword
  ? `${route.query.roles_keyword}`
  : undefined;

const state = ref<QueryTableState>({
  limit: 10,
  page: 1,
  keyword: q_keyword,
  sort: [{ id: "name", desc: false }],
});

const client = useQueryClient();
const query = useQuery(
  {
    queryKey: ["roles", state],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      updateQueryParam(
        {
          ...route.query,
          roles_keyword: state.value.keyword?.toString(),
        },
        true,
      );

      return await getRoles({
        sort: toSortQueries(state.value.sort),
        keyword: state.value.keyword,
      });
    },
  },
  client,
);

const onPageChange = (query: DataTablePagination) => {
  state.value = {
    ...state.value,
    ...query,
  };
};

const onSortChange = (sort: SortingState) => {
  state.value = {
    ...state.value,
    sort,
  };
};

const onSearch = useDebounceFn((keyword: string) => {
  state.value = {
    ...state.value,
    keyword,
    page: 1,
  };
}, 400);
</script>

<template>
  <div class="container py-4 mx-auto">
    <QueryTable
      query-key="roles"
      :columns="columns"
      :query="query"
      :state="state"
      @page-change="onPageChange"
      @sort-change="onSortChange"
      @search="onSearch"
    />
  </div>
</template>
