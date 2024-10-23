import { createRouter, createWebHistory } from "vue-router";
import VideoView from "../views/VideoView.vue";
import WordsView from "../views/WordsView.vue";
import SettingsView from "../views/SettingsView.vue";
// 导入 404 页面组件
import NotFoundView from "../views/NotFoundView.vue";  // 需要创建这个组件
import { auth } from "../composables/useAuth";

const routes = [
  { 
    path: "/", 
    redirect: "/video",
    // meta: { requiresAuth: true }
  },
  { 
    path: "/video", 
    component: VideoView,
    // meta: { requiresAuth: true }
  },
  { 
    path: "/words", 
    component: WordsView,
    meta: { requiresAuth: true }
  },
  { 
    path: "/settings", 
    component: SettingsView,
    meta: { requiresAuth: true }
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

router.beforeEach((to, from, next) => {  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!auth.isLoggedIn.value) {
      auth.showAuthModal();
      next(false); // 阻止导航
    } else {
      next(); // 用户已登录，允许导航
    }
  } else {
    next(); // 不需要认证的路由，直接允许导航
  }
});


export default router;