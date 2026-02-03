import {
  createWebHistory,
  createRouter,
  type RouteRecordRaw,
} from "vue-router";

import Error from "./pages/Error.vue";
import { useAuthStore } from "./stores/auth.store";
import { useProgressBar } from "./composables/useProgressBar";
import DashboardLayout from "./layouts/DashboardLayout.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("./pages/login/Login.vue"),
    meta: { guest: true },
  },
  {
    path: "/",
    component: DashboardLayout,
    meta: { authed: true },
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("./pages/dashboard/Dashboard.vue"),
        meta: { breadcrumbs: [{ name: "Dashboard", target: "/" }] },
      },
      {
        path: "/users",
        name: "users.list",
        component: () => import("./modules/user/pages/UsersList.vue"),
        meta: {
          permissions: ["users.list"],
          breadcrumbs: [{ name: "Users", target: { name: "users.list" } }],
        },
      },
      {
        path: "/users/create",
        name: "users.create",
        component: () => import("./modules/user/pages/UserCreate.vue"),
        meta: {
          permissions: ["users.create"],
          breadcrumbs: [
            { name: "Users", target: { name: "users.list" } },
            { name: "Create", target: { name: "users.create" } },
          ],
        },
      },
      {
        path: "/users/edit/:id",
        name: "users.edit",
        component: () => import("./modules/user/pages/UserEdit.vue"),
        meta: {
          permissions: ["users.update"],
          breadcrumbs: [
            { name: "Users", target: { name: "users.list" } },
            { name: "Edit", target: { name: "users.edit" } },
          ],
        },
      },
      {
        path: "/profile/edit",
        name: "profile.edit",
        component: () => import("./pages/profile/ProfileEdit.vue"),
        meta: { breadcrumbs: [{ name: "Profile" }, { name: "Edit" }] },
      },
    ],
  },

  // error pages
  {
    path: "/error/:code",
    name: "error",
    component: Error,
    props: true,
  },
  // 404 page
  {
    path: "/:pathMatch(.*)*",
    component: Error,
    props: { code: 404 },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

const progressBar = useProgressBar();

router.beforeEach(async (to) => {
  progressBar.start();

  const store = useAuthStore();
  await store.init();

  if (to.meta.guest && store.isAuthed) {
    return { name: "dashboard" };
  }

  if (to.meta.authed && !store.isAuthed) {
    return { name: "login" };
  }

  if (
    to.meta.permissions &&
    !store.hasPermission(to.meta.permissions as string | string[])
  ) {
    return { name: "error", params: { code: 403 } };
  }
});

router.afterEach(() => {
  progressBar.finish();
});

router.onError(() => {
  progressBar.fail();
});
