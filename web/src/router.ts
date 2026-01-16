import {
  createWebHistory,
  createRouter,
  type RouteRecordRaw,
} from "vue-router";

import Error from "./pages/Error.vue";
import { useAuthStore } from "./stores/auth.store";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("./pages/login/Login.vue"),
    meta: { guest: true },
  },
  {
    path: "/",
    component: () => import("./layouts/DashboardLayout.vue"),
    meta: { authed: true },
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("./pages/dashboard/Dashboard.vue"),
        meta: { breadcrumbs: [{ name: "Dashboard", target: "/" }] },
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

router.beforeEach(async (to) => {
  const store = useAuthStore();
  await store.init();

  if (to.meta.guest && store.isAuthed) {
    return { name: "dashboard" };
  }

  if (to.meta.authed && !store.isAuthed) {
    return { name: "login" };
  }
});
