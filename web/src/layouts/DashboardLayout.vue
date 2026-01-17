<script setup lang="ts">
import AppSidebar from "@/components/AppSidebar.vue";
import LoaderScreen from "@/components/LoaderScreen.vue";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useBranchStore } from "@/stores/branch.store";
import { nextTick, onBeforeMount, ref } from "vue";
import {
  useRouter,
  type RouteLocationAsPathGeneric,
  type RouteLocationAsRelativeGeneric,
  type RouteLocationNormalizedGeneric,
} from "vue-router";

interface Breadcrumb {
  name: string;
  target?: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric;
}

const getBreadcrumbs = (to: RouteLocationNormalizedGeneric) => {
  return to.matched.reduce((list, item) => {
    if (item.meta.breadcrumbs) {
      return [...list, ...(item.meta.breadcrumbs as Breadcrumb[])];
    }

    return list;
  }, [] as Breadcrumb[]);
};

const router = useRouter();
const breadcrumbs = ref<Breadcrumb[]>(
  getBreadcrumbs(router.currentRoute.value),
);
router.afterEach((to) => {
  breadcrumbs.value = getBreadcrumbs(to);
});

const branchStore = useBranchStore();
const loading = ref(true);
onBeforeMount(async () => {
  try {
    await branchStore.fetchBranches();
  } catch (error) {
    console.error(error);
  } finally {
    nextTick(() => {
      loading.value = false;
    });
  }
});
</script>

<template>
  <LoaderScreen v-if="loading" />
  <SidebarProvider v-else>
    <AppSidebar />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator
            orientation="vertical"
            class="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <template v-for="(item, index) in breadcrumbs" :key="index">
                <BreadcrumbItem class="hidden md:block">
                  <BreadcrumbLink
                    v-if="index < breadcrumbs.length - 1 && item.target"
                    as-child
                  >
                    <router-link :to="item.target">
                      {{ item.name }}
                    </router-link>
                  </BreadcrumbLink>
                  <BreadcrumbPage v-else>{{ item.name }}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator
                  v-if="index < breadcrumbs.length - 1"
                  class="hidden md:block"
                />
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <router-view />
    </SidebarInset>
  </SidebarProvider>
</template>
