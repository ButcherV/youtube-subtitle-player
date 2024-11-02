import { createApp } from "vue";
import App from "./App.vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faChevronUp,
  faChevronDown,
  faRightFromBracket,
  faRightToBracket,
  faPlay,
  faPause,
  faRepeat,
  faStop,
  faRotateRight,
  faXmark,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import router from "./router";
import "./assets/styles/main.scss";
import { auth } from './composables/useAuth'
import axios from 'axios';
import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'

library.add(
  faArrowLeft, 
  faPlus, 
  faChevronUp, 
  faChevronDown,
  faRightFromBracket,
  faRightToBracket,
  faPlay,
  faPause,
  faRepeat,
  faStop,
  faRotateRight,
  faXmark,
  faMagnifyingGlass,
  faStarRegular
);

const app = createApp(App);
app.config.globalProperties.$message = ElMessage
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

// 移动端调试
import VConsole from 'vconsole';
if (process.env.NODE_ENV !== 'production') {
  new VConsole();
}

app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);

auth.checkAuth();
app.provide('auth', auth);
app.use(ElementPlus)

app.mount("#app");
