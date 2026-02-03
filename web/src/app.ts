import { type ObjectPlugin, type App as VueApp } from "vue";
import { createPinia, MutationType } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { router } from "./router";
import DashboardContent from "./components/DashboardContent.vue";
import { useAuthStore } from "./stores/auth.store";

export class App implements ObjectPlugin {
  install(app: VueApp) {
    app.use(createPinia());
    app.use(router);
    app.use(VueQueryPlugin);
    app.component("dashboard-content", DashboardContent);

    // listen auth
    this.listenToRouter();
  }

  private listenToRouter() {
    const auth = useAuthStore();

    auth.$subscribe((mutation, state) => {
      if (
        mutation.type == MutationType.direct ||
        (mutation.type == MutationType.patchObject &&
          mutation.payload &&
          "user" in mutation.payload)
      ) {
        const route = router.currentRoute.value;
        if (!state.user && route.meta.authed) {
          router.replace({ name: "login" });
          return;
        }

        if (!!state.user && route.meta.guest) {
          router.replace({ name: "dashboard" });
          return;
        }
      }
    });
  }
}
