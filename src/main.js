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
import { auth } from './composables/useAuth'
import axios from 'axios';

library.add(faArrowLeft, faPlus, faChevronUp, faChevronDown);

const app = createApp(App);
auth.setRouter(router);

// 设置 Axios 拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      auth.logout();
      auth.showAuthModal();
    }
    return Promise.reject(error);
  }
);

app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);

auth.checkAuth();
app.provide('auth', auth);
app.mount("#app");
