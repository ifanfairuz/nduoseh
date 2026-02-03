<script
  setup
  lang="ts"
  generic="TData, TValue, R extends QueryTableFetchResponse<TData>"
>
import type { ColumnDef, SortingState } from "@tanstack/vue-table";
import DataTable from "@/components/datatable/DataTable.vue";
import { computed } from "vue";
import type {
  DataTablePagination,
  QueryTableFetchResponse,
  QueryTableQuery,
  QueryTableState,
} from ".";

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<TData, TValue>[];
    query: QueryTableQuery<R>;
    pagination?: boolean;
    sort?: boolean;
    state?: QueryTableState;
  }>(),
  {
    pagination: true,
    sort: true,
  },
);

const emits = defineEmits<{
  pageChange: [DataTablePagination];
  sortChange: [SortingState];
  search: [string];
}>();

const data = computed(() => props.query.data.value?.data ?? []);
const pagination = computed(() => {
  if (!props.pagination) return undefined;

  if (props.query.data.value?.pagination) {
    return props.query.data.value?.pagination;
  }

  if (props.state) {
    return {
      totalPages: props.state.page,
      total: props.state.limit * props.state.page,
      limit: props.state.limit,
      page: props.state.page,
    };
  }

  return undefined;
});
const sort = computed(() => (props.sort ? props.state?.sort : undefined));
const keyword = computed(() => props.state?.keyword);
const status = computed(() => ({
  isPending: props.query.isPending.value,
  isFetching: props.query.isFetching.value,
  isError: props.query.isError.value,
  error: props.query.error.value,
}));

const onPageChange = (query: DataTablePagination) => {
  emits("pageChange", query);
};

const onSortChange = (sort: SortingState) => {
  emits("sortChange", sort);
};

const onSearchChange = (keyword: string) => {
  emits("search", keyword);
};
</script>

<template>
  <DataTable
    :columns="columns"
    :data="data"
    :manual-pagination="!!pagination"
    :pagination="pagination"
    :sort="sort"
    :search="keyword"
    :pending="status.isPending"
    :fetching="status.isFetching"
    :is-error="status.isError"
    :error="status.error?.message"
    @on-pagination-change="onPageChange"
    @on-sort-change="onSortChange"
    @on-search-change="onSearchChange"
  />
</template>
