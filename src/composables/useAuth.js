// src/composables/useAuth.js
import { ref, readonly } from "vue";

export function useAuth() {
  const isAuthModalVisible = ref(false);
  const isLoggedIn = ref(false); // 简单示例，实际应从 cookie 或 API 获取

  const showAuthModal = () => {
    isAuthModalVisible.value = true;
  };

  const hideAuthModal = () => {
    isAuthModalVisible.value = false;
  };

  const login = (/* 登录逻辑 */) => {
    // 实现登录逻辑
    isLoggedIn.value = true;
    hideAuthModal();
  };

  const register = (/* 注册逻辑 */) => {
    // 实现注册逻辑
    isLoggedIn.value = true;
    hideAuthModal();
  };

  return {
    isAuthModalVisible: readonly(isAuthModalVisible),
    isLoggedIn: readonly(isLoggedIn),
    showAuthModal,
    hideAuthModal,
    login,
    register,
  };
}
