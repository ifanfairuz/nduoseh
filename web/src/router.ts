import {
  createWebHistory,
  createRouter,
  type RouteRecordRaw,
} from "vue-router";

import DashboardLayout from "./layouts/DashboardLayout.vue";
import Dashboard from "./pages/Dashboard.vue";
import Login from "./pages/login/Login.vue";
import Error from "./pages/Error.vue";
import { useAuthStore } from "./stores/auth.store";

const routes: RouteRecordRaw[] = [
  { path: "/login", name: "login", component: Login, meta: { guest: true } },
  {
    path: "/",
    component: DashboardLayout,
    meta: { authed: true, breadcrumbs: [{ name: "Dashboard", path: "/" }] },
    children: [
      {
        path: "",
        name: "dashboard",
        component: Dashboard,
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
