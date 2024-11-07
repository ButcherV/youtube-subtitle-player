<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div>
      <input v-model="email" type="email" placeholder="邮箱" required class="auth-input" />
      <input v-model="password" type="password" placeholder="密码" required class="auth-input" />
    </div>
    <div>
      <p v-if="error" class="error-message">{{ error }}</p>
      <button type="submit" class="auth-button" :disabled="isLoading">
        {{ isLoading ? getSuccessMessage(SUCCESS_KEYS.LOGGING) : '登录' }}
      </button>
    </div>
  </form>
</template>

<script>
import { ref, inject, getCurrentInstance } from "vue";
import axios from 'axios';
import { ERROR_KEYS, getErrorMessage, SUCCESS_KEYS, getSuccessMessage } from '@/constants';

import { API } from '@/constants';

export default {
  name: "LoginForm",
  emits: ['login-success'],
  setup(props, { emit }) {
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
        const response = await axios.post(`${API.BASE_URL}/auth/login`, { 
          email: email.value, 
          password: password.value 
        });
        
        const { token, userId, email: userEmail, isFirstLogin } = response.data;
        
        auth.handleLoginSuccess(
          { id: userId, email: userEmail }, 
          token,
          isFirstLogin
        );
        emit('login-success', { isFirstLogin });
        if (!isFirstLogin) {
          proxy.$message.success(getSuccessMessage(SUCCESS_KEYS.LOGIN_SUCCESS));
        }
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
  justify-content: space-between;
  width: 100%;
  height: 160px;
}

.auth-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;

  & + .auth-input {
    margin-top: 8px;
  }
}

.auth-button {
  padding: 10px;
  background-color: $green;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-bottom: 8px;
  text-align: center;
}
</style>