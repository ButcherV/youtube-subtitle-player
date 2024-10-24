<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <template v-if="step === 1">
      <input 
        v-model="email" 
        type="email" 
        placeholder="邮箱" 
        required 
        class="auth-input" 
        @input="validateEmailOnInput"
        @blur="validateEmailOnBlur"
      />
      <button 
        type="submit" 
        class="auth-button" 
        :disabled="isSubmitting || !isEmailValidForSubmit"
      >
        {{ isSubmitting ? '发送中...' : '获取验证码' }}
      </button>
      <p v-if="emailError" class="error-message">{{ emailError }}</p>
      <p v-if="backendError" class="error-message">{{ backendError }}</p>
    </template>

    <template v-else>
      <div class="email-display">注册邮箱：{{ email }}</div>
      <input v-model="username" type="text" placeholder="用户名" required class="auth-input" @input="validateUsername" @blur="validateUsername" />
      <p v-if="usernameError" class="error-message">{{ usernameError }}</p>
      <input v-model="verificationCode" type="text" placeholder="验证码" required class="auth-input" />
      <input v-model="password" type="password" placeholder="密码" required class="auth-input" />
      <input v-model="confirmPassword" type="password" placeholder="确认密码" required class="auth-input" />
      <p v-if="backendError" class="error-message">{{ backendError }}</p>
      <button type="submit" class="auth-button" :disabled="isSubmitting || !isUsernameValid">
        {{ isSubmitting ? '注册中...' : '完成注册' }}
      </button>
    </template>
  </form>
</template>

<script>
import { ref } from "vue";
import axios from 'axios';
const API_BASE_URL = "http://192.168.128.179:3000";

export default {
  name: "RegisterForm",
  emits: ["register-success"],
  setup(props, { emit }) {
    // const auth = inject('auth');
    const email = ref("");
    const verificationCode = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const step = ref(1);
    const isSubmitting = ref(false);
    const isEmailValidForSubmit = ref(false);
    const emailError = ref("");
    const backendError = ref("");
    const username = ref("");
    const usernameError = ref("");
    const isUsernameValid = ref(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateUsername = () => {
      const usernameRegex = /^[a-zA-Z]{1,15}$/;
      if (!username.value) {
        usernameError.value = "用户名不能为空";
        isUsernameValid.value = false;
      } else if (!usernameRegex.test(username.value)) {
        usernameError.value = "用户名必须是1-15个英文字符";
        isUsernameValid.value = false;
      } else {
        usernameError.value = "";
        isUsernameValid.value = true;
      }
    };

    const validateEmailOnInput = () => {
      isEmailValidForSubmit.value = emailRegex.test(email.value);
      emailError.value = ""; // 清除任何现有的错误消息
    };

    const validateEmailOnBlur = () => {
      if (email.value && !emailRegex.test(email.value)) {
        emailError.value = "请输入有效的邮箱地址";
        isEmailValidForSubmit.value = false;
      } else {
        emailError.value = "";
        isEmailValidForSubmit.value = emailRegex.test(email.value);
      }
    };

    const requestVerificationCode = async () => {
      if (isSubmitting.value || !isEmailValidForSubmit.value) return;
      isSubmitting.value = true;
      backendError.value = "";
      try {
        await axios.post(`${API_BASE_URL}/auth/request-verification`, { email: email.value });
        step.value = 2;
      } catch (error) {
        console.error('请求验证码失败:', error);
        backendError.value = error.response?.data?.message || "发送验证码失败，请稍后重试";
      } finally {
        isSubmitting.value = false;
      }
    };

    const registerUser = async () => {
      if (password.value !== confirmPassword.value) {
        backendError.value = "密码不匹配";
        return;
      }
      if (!isUsernameValid.value) {
        backendError.value = "请输入有效的用户名";
        return;
      }
      isSubmitting.value = true;
      backendError.value = "";
      try {
        await axios.post(`${API_BASE_URL}/auth/register`, {
          email: email.value,
          username: username.value,
          password: password.value,
          verificationCode: verificationCode.value
        });
        // 注册成功，发出事件
        emit('register-success', { email: email.value, username: username.value });
      } catch (error) {
        console.error('注册失败:', error);
        backendError.value = error.response?.data?.message || "注册失败，请检查您的信息并重试";
      } finally {
        isSubmitting.value = false;
      }
    };

    const handleSubmit = async () => {
      if (step.value === 1) {
        await requestVerificationCode();
      } else {
        await registerUser();
      }
    };

    return { 
      email, verificationCode, password, confirmPassword, 
      step, isSubmitting, handleSubmit, validateEmailOnInput,
      validateEmailOnBlur, isEmailValidForSubmit, emailError, backendError,
      username, validateUsername, usernameError, isUsernameValid
    };
  },
};
</script>

<style scoped>
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
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-button:hover:not(:disabled) {
  background-color: #1976d2;
}

.auth-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.email-display {
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}
</style>