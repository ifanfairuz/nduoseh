import { createApp } from "vue";
import { createPinia, MutationType } from "pinia";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";
import { useAuthStore } from "./stores/auth.store";

const app = createApp(App);
app.use(createPinia());
app.use(router);

// listen auth
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

app.mount("#app");
