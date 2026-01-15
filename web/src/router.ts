import {
  createWebHistory,
  createRouter,
  type RouteRecordRaw,
  type NavigationGuardWithThis,
} from "vue-router";

import DashboardLayout from "./layouts/DashboardLayout.vue";
import Dashboard from "./pages/Dashboard.vue";
import Login from "./pages/login/Login.vue";
import Error from "./pages/Error.vue";
import { useAuthStore } from "./stores/auth.store";

const isAuthed: NavigationGuardWithThis<unknown> = (_, __, next) => {
  const store = useAuthStore();

  if (store.isAuthed) {
    return next();
  }

  next({ path: "/login" });
};

const isNotAuthed: NavigationGuardWithThis<unknown> = (_, __, next) => {
  const store = useAuthStore();

  if (!store.isAuthed) {
    return next();
  }

  next({ path: "/" });
};

const routes: RouteRecordRaw[] = [
  { path: "/login", name: "login", component: Login, beforeEnter: isNotAuthed },
  {
    path: "/",
    component: DashboardLayout,
    beforeEnter: isAuthed,
    children: [
      {
        path: "",
        name: "dashboard",
        component: Dashboard,
        meta: { breadcrumbs: [{ name: "Dashboard", path: "/" }] },
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
