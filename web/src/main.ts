import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { App as MyApp } from "./app";

createApp(App).use(new MyApp()).mount("#app");
