<script setup lang="ts" generic="TData, TValue">
import { computed, ref } from "vue";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { ChevronDown, ColumnsIcon } from "lucide-vue-next";

import { Skeleton } from "../ui/skeleton";
import Loader from "../Loader.vue";
import type { DataTablePagination } from ".";
import Th from "./Th.vue";
import { Input } from "../ui/input";

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    search?: string;
    pagination?: DataTablePagination;
    sort?: SortingState;
    pending?: boolean;
    fetching?: boolean;
    isError?: boolean;
    error?: string;
    limitOptions?: number[];
    manualPagination?: boolean;
    manualSorting?: boolean;
    manualFiltering?: boolean;
  }>(),
  {
    pending: false,
    fetching: false,
    isError: false,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
    limitOptions: () => [10, 20, 50, 100],
  },
);

const emits = defineEmits<{
  onPaginationChange: [DataTablePagination];
  onSortChange: [SortingState];
  onSearchChange: [string];
}>();

const colVisibility = ref<VisibilityState>({});
const sorting = ref<SortingState>([]);
const sortable = computed(() => (props.manualSorting ? !!props.sort : true));
const filtering = ref<string>("");
const paginationState = ref<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});
const pagination = computed(() => {
  if (props.manualPagination) {
    return props.pagination;
  }

  return {
    totalPages: Math.ceil(props.data.length / paginationState.value.pageSize),
    total: props.data.length,
    limit: paginationState.value.pageSize,
    page: paginationState.value.pageIndex + 1,
  };
});
const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  state: {
    get columnVisibility() {
      return colVisibility.value;
    },
    get sorting() {
      return props.manualSorting ? props.sort : sorting.value;
    },
    get globalFilter() {
      return props.manualFiltering ? props.search : filtering.value;
    },
    get pagination() {
      return props.manualPagination ? undefined : paginationState.value;
    },
  },
  get manualPagination() {
    return props.manualPagination;
  },
  get manualSorting() {
    return props.manualSorting;
  },
  get manualFiltering() {
    return props.manualFiltering;
  },
  enableGlobalFilter: true,
  enableMultiSort: true,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onColumnVisibilityChange: (v) => {
    colVisibility.value = typeof v === "function" ? v(colVisibility.value) : v;
  },
  onSortingChange: (v) => {
    if (props.manualSorting) {
      const state = typeof v === "function" ? v(props.sort ?? []) : v;
      emits("onSortChange", state);
      return;
    }

    sorting.value = typeof v === "function" ? v(sorting.value) : v;
  },
  onGlobalFilterChange: (v) => {
    if (props.manualFiltering) {
      const state = typeof v === "function" ? v(props.search ?? "") : v;
      emits("onSearchChange", state);
      return;
    }

    filtering.value = typeof v === "function" ? v(filtering.value) : v;
  },
});

const setPage = (page: number) => {
  if (props.manualPagination) {
    emits("onPaginationChange", {
      totalPages: props.pagination?.totalPages ?? 1,
      total: props.pagination?.total ?? 0,
      limit: props.pagination?.limit ?? 10,
      page: page,
    });
    return;
  }

  paginationState.value = {
    ...paginationState.value,
    pageIndex: page - 1,
  };
};

const setLimit = (limit: number) => {
  if (props.manualPagination) {
    emits("onPaginationChange", {
      totalPages: props.pagination?.totalPages ?? 1,
      total: props.pagination?.total ?? 0,
      limit: limit,
      page: props.pagination?.page ?? 1,
    });
    return;
  }

  paginationState.value = {
    ...paginationState.value,
    pageSize: limit,
  };
};

const formatter = new Intl.NumberFormat();
const info = computed(() => {
  let _pagination: DataTablePagination | undefined;
  let _showedRows = 0;
  if (props.manualPagination) {
    _pagination = props.pagination;
    _showedRows = props.data.length;
  } else {
    _pagination = pagination.value;
    _showedRows = table.getSortedRowModel().rows.length;
  }
  if (!_pagination) return null;

  const end = _pagination.page * _showedRows;
  const start = _showedRows == 0 ? 0 : end - _showedRows + 1;
  return {
    start: formatter.format(start),
    end: formatter.format(end),
    total: formatter.format(_pagination.total),
  };
});
</script>

<template>
  <div class="space-y-4">
    <div
      class="flex sm:flex-row flex-col gap-4 justify-between items-start sm:items-center"
    >
      <div class="flex flex-row gap-4 items-center sm:order-last">
        <Select
          v-if="!!pagination"
          :model-value="pagination.limit"
          @update:model-value="setLimit($event as number)"
        >
          <SelectTrigger class="w-[100px]">
            <SelectValue placeholder="Show" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Number of Rows</SelectLabel>
              <SelectItem
                v-for="option in limitOptions"
                :key="`${option}`"
                :value="option"
              >
                {{ option }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              <ColumnsIcon />
              <span class="hidden lg:inline">Columns</span>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-56">
            <template
              v-for="column in table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide(),
                )"
              :key="column.id"
            >
              <DropdownMenuCheckboxItem
                class="capitalize"
                :model-value="column.getIsVisible()"
                @update:model-value="
                  (value) => {
                    column.toggleVisibility(!!value);
                  }
                "
              >
                {{ column.id.replace(/_/g, " ") }}
              </DropdownMenuCheckboxItem>
            </template>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Input
        class="sm:max-w-sm"
        placeholder="Search..."
        type="search"
        @update:model-value="table.setGlobalFilter($event)"
        :model-value="props.search"
      />
    </div>
    <div class="border rounded-md relative">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :col-span="header.colSpan"
            >
              <Th
                v-if="!header.isPlaceholder"
                :ctx="header.getContext()"
                :sortable="sortable"
                v-slot="{ ctx }"
              >
                <FlexRender
                  :render="header.column.columnDef.header"
                  :props="ctx"
                />
              </Th>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="pending">
            <TableRow v-for="row in 10" :key="row">
              <TableCell v-for="cell in columns" :key="cell.id">
                <Skeleton class="h-4 w-[150px]" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="columns.length" class="h-14 text-center">
                No results.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
      <template v-if="(fetching && !pending) || isError">
        <div
          class="absolute inset-0 size-full flex items-center justify-center bg-black/10"
        >
          <template v-if="isError">
            <slot name="error">
              {{ error ?? "Something went wrong" }}
            </slot>
          </template>
          <Loader v-if="!isError" size="md" />
        </div>
      </template>
    </div>
    <div
      class="flex md:flex-row flex-col items-center md:justify-between"
      v-if="!!pagination"
    >
      <p class="text-sm text-muted-foreground">
        Show ({{ info!.start }}-{{ info!.end }}) of {{ info!.total }} rows
        filtered.
      </p>
      <Pagination
        v-slot="{ page, pageCount }"
        :page="pagination.page"
        :items-per-page="pagination.limit"
        :total="pagination.total"
        class="justify-start mx-0 w-auto"
        @update:page="setPage($event)"
      >
        <PaginationContent v-slot="{ items }">
          <PaginationPrevious size="lg" />
          <template v-for="(item, index) in items" :key="index">
            <PaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              :is-active="item.value === page"
              size="lg"
            >
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else />
          </template>
          <template>
            <PaginationEllipsis />
            <PaginationItem :value="pageCount">
              {{ pageCount }}
            </PaginationItem>
          </template>
          <PaginationNext size="lg" />
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>
