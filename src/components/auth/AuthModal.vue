<template>
  <div class="auth-modal">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">&times;</button>

      <div class="tabs">
        <button
          :class="{ 'tab-button': true, active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button
          :class="{ 'tab-button': true, active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          注册
        </button>
      </div>

      <LoginForm v-if="activeTab === 'login'" @login="handleLogin" />
      <RegisterForm v-else @register="handleRegister" />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import LoginForm from "./LoginForm.vue";
import RegisterForm from "./RegisterForm.vue";

export default {
  name: "AuthModal",
  components: { LoginForm, RegisterForm },
  emits: ["close", "login", "register"],
  setup(props, { emit }) {
    const activeTab = ref("login");

    const handleLogin = (loginData) => {
      emit("login", loginData);
    };

    const handleRegister = (registerData) => {
      emit("register", registerData);
    };

    return { activeTab, handleLogin, handleRegister };
  },
};
</script>

<style scoped>
.auth-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999999;
}

.modal-content {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 80%;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
}

.tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.tab-button {
  padding: 10px 20px;
  font-size: 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-button.active {
  border-bottom-color: #4CAF50;
  color: #4CAF50;
}
</style>
