<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <input v-model="email" type="email" placeholder="邮箱" required class="auth-input" />
    <input v-model="password" type="password" placeholder="密码" required class="auth-input" />
    <p v-if="error" class="error-message">{{ error }}</p>
    <button type="submit" class="auth-button" :disabled="isLoading">
      {{ isLoading ? '登录中...' : '登录' }}
    </button>
  </form>
</template>

<script>
import { ref, inject } from "vue";
import axios from 'axios';

const API_BASE_URL = "http://192.168.128.179:3000"; // 请确保这是正确的后端 URL

export default {
  name: "LoginForm",
  setup() {
    const auth = inject('auth');
    const email = ref("");
    const password = ref("");
    const error = ref("");
    const isLoading = ref(false);

    const handleSubmit = async () => {
      error.value = "";
      isLoading.value = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { 
          email: email.value, 
          password: password.value 
        });
        const { token, userId, email: userEmail } = response.data;
        
        auth.handleLoginSuccess({ id: userId, email: userEmail }, token);
      } catch (err) {
        error.value = err.response?.data?.message || "登录失败，请稍后重试";
      } finally {
        isLoading.value = false;
      }
    };

    return { email, password, handleSubmit, error, isLoading };
  },
};
</script>

<style scoped lang="scss">
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 300px;
}

.auth-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.auth-button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-button:hover {
  background-color: #45a049;
}
</style>
