<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <input v-model="email" type="email" placeholder="邮箱" required class="auth-input" />
    <input v-model="password" type="password" placeholder="密码" required class="auth-input" />
    <p v-if="error" class="error-message">{{ error }}</p>
    <button type="submit" class="auth-button" :disabled="isLoading">
      {{ isLoading ? getSuccessMessage(SUCCESS_KEYS.REGISTERING) : '登录' }}
    </button>
  </form>
</template>

<script>
import { ref, inject, getCurrentInstance } from "vue";
import axios from 'axios';
import { ERROR_KEYS, getErrorMessage, SUCCESS_KEYS, getSuccessMessage } from '@/constants/errorKeys';

const API_BASE_URL = "http://192.168.128.179:3000";

export default {
  name: "LoginForm",
  setup() {
    const auth = inject('auth');
    const email = ref("");
    const password = ref("");
    const error = ref("");
    const isLoading = ref(false);
    const { proxy } = getCurrentInstance();

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
        proxy.$message.success(getSuccessMessage(SUCCESS_KEYS.LOGIN_SUCCESS));
      } catch (err) {
        const errorKey = err.response?.data?.error;
        if (errorKey) {
          error.value = getErrorMessage(errorKey);
        } else {
          error.value = getErrorMessage(ERROR_KEYS.LOGIN_FAILED);
        }
        proxy.$message.error(error.value);
      } finally {
        isLoading.value = false;
      }
    };

    return { 
      email, 
      password, 
      handleSubmit, 
      error, 
      isLoading,
      getSuccessMessage,
      SUCCESS_KEYS
    };
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

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 5px;
  text-align: center;
}
</style>