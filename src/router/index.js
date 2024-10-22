import { createRouter, createWebHistory } from "vue-router";
import VideoView from "../views/VideoView.vue";
import WordsView from "../views/WordsView.vue";
import SettingsView from "../views/SettingsView.vue";
// 导入 404 页面组件
import NotFoundView from "../views/NotFoundView.vue";  // 需要创建这个组件

const routes = [
  { 
    path: "/", 
    redirect: "/video" 
  },
  { 
    path: "/video", 
    component: VideoView 
  },
  { 
    path: "/words", 
    component: WordsView 
  },
  { 
    path: "/settings", 
    component: SettingsView 
  },
  // 添加 404 路由，必须放在最后
  { 
    path: "/:pathMatch(.*)*", 
    name: "NotFound",
    component: NotFoundView 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;