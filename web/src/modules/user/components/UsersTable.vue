<script setup lang="ts">
import { computed, ref } from "vue";
import type { User } from "@panah/contract";
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
import { getUsers } from "../user.api";
import { useRoute } from "vue-router";
import { updateQueryParam } from "@/lib/utils";
import { useDebounceFn } from "@vueuse/core";
import { h } from "vue";
import UsersRowAction from "./UsersRowAction.vue";
import { useHasPermission } from "@/stores/auth.store";
import UserImageCell from "./UserImageCell.vue";

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

const _columns: ColumnDef<User, User>[] = [
  {
    id: "image",
    accessorKey: "image",
    header: "Image",
    enableSorting: false,
    cell: ({ row }) => h(UserImageCell, { data: row.original }),
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "callname",
    accessorKey: "callname",
    header: "Callname",
  },
];

const canEdit = useHasPermission("users.update");
const canDelete = useHasPermission("users.delete");

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
        return h(UsersRowAction, {
          data: row.original,
          editable: canEdit.value,
          deletable: canDelete.value,
          onInvalidateData: () => {
            client.invalidateQueries();
          },
        });
      },
    },
  ];
});

const route = useRoute();
const q_limit = parseInt(`${route.query.users_limit}`);
const q_page = parseInt(`${route.query.users_page}`);
const q_keyword = route.query.users_keyword
  ? `${route.query.users_keyword}`
  : undefined;

const state = ref<QueryTableState>({
  limit: isNaN(q_limit) ? 10 : q_limit,
  page: isNaN(q_page) ? 1 : q_page,
  keyword: q_keyword,
  sort: [{ id: "name", desc: false }],
});

const client = useQueryClient();
const query = useQuery(
  {
    queryKey: ["users", state],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      updateQueryParam(
        {
          ...route.query,
          users_limit: state.value.limit.toString(),
          users_page: state.value.page.toString(),
          users_keyword: state.value.keyword?.toString(),
        },
        true,
      );

      return await getUsers({
        pagination: {
          limit: state.value.limit,
          page: state.value.page,
        },
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
      query-key="users"
      :columns="columns"
      :query="query"
      :state="state"
      @page-change="onPageChange"
      @sort-change="onSortChange"
      @search="onSearch"
    />
  </div>
</template>
