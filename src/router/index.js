import { createRouter, createWebHistory } from "vue-router";
import VideoView from "../views/VideoView.vue";
import WordsView from "../views/WordsView.vue";
import SettingsView from "../views/SettingsView.vue";

const routes = [
  { path: "/", redirect: "/video" },
  { path: "/video", component: VideoView },
  { path: "/words", component: WordsView },
  { path: "/settings", component: SettingsView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
