import { createApp } from "vue";
import App from "./App.vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import router from "./router";
import "./assets/styles/main.scss";

library.add(faArrowLeft, faPlus, faChevronUp, faChevronDown);

const app = createApp(App);
app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
