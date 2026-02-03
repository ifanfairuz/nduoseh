<script setup lang="ts">
import { ref } from "vue";
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
import { formatDate } from "date-fns";
import { useDebounceFn } from "@vueuse/core";

const columns: ColumnDef<User>[] = [
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
  {
    id: "updated_at",
    accessorKey: "updated_at",
    header: "Last Update",
    cell: ({ getValue }) => formatDate(getValue<string>(), "dd/MM/yyyy HH:mm"),
  },
];

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
      updateQueryParam({
        ...route.query,
        users_limit: state.value.limit.toString(),
        users_page: state.value.page.toString(),
        users_keyword: state.value.keyword?.toString(),
      });

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
  <div class="container py-10 mx-auto">
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
