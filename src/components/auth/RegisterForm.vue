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
        {{ isSubmitting ? submittingText : submitText }}
      </button>
    </template>
  </form>
</template>

<script>
import { ref, getCurrentInstance, computed } from "vue";
import axios from 'axios';
import { ERROR_KEYS, getErrorMessage, SUCCESS_KEYS, getSuccessMessage } from '@/constants';
import { API } from '@/constants';

export default {
  name: "RegisterForm",
  emits: ["register-success"],
  setup(props, { emit }) {
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
    const usernameRegex = /^[\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{1,15}$/;
    const { proxy } = getCurrentInstance();

    const submitText = computed(() => getSuccessMessage(SUCCESS_KEYS.COMPLETE_REGISTRATION));
    const submittingText = computed(() => getSuccessMessage(SUCCESS_KEYS.REGISTERING));

    const validateUsername = () => {
      if (!username.value) {
        usernameError.value = getErrorMessage(ERROR_KEYS.REQUIRED_FIELD_MISSING);
        isUsernameValid.value = false;
      } else if (!usernameRegex.test(username.value)) {
        usernameError.value = getErrorMessage(ERROR_KEYS.INVALID_USERNAME_FORMAT);
        isUsernameValid.value = false;
      } else {
        usernameError.value = "";
        isUsernameValid.value = true;
      }
    };

    const validateEmailOnInput = () => {
      isEmailValidForSubmit.value = emailRegex.test(email.value);
      emailError.value = "";
    };

    const validateEmailOnBlur = () => {
      if (email.value && !emailRegex.test(email.value)) {
        emailError.value = getErrorMessage(ERROR_KEYS.INVALID_EMAIL_FORMAT);
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
        await axios.post(`${API.BASE_URL}/auth/request-verification`, { email: email.value });
        step.value = 2;
        proxy.$message.success(getSuccessMessage(SUCCESS_KEYS.VERIFICATION_CODE_SENT));
      } catch (error) {
        console.error('请求验证码失败:', error);
        const errorKey = error.response?.data?.error || ERROR_KEYS.INTERNAL_SERVER_ERROR;
        backendError.value = getErrorMessage(errorKey);
        // proxy.$message.error(backendError.value);
      } finally {
        isSubmitting.value = false;
      }
    };

    const registerUser = async () => {
      if (password.value !== confirmPassword.value) {
        backendError.value = getErrorMessage(ERROR_KEYS.PASSWORDS_DO_NOT_MATCH);
        return;
      }
      if (!isUsernameValid.value) {
        backendError.value = getErrorMessage(ERROR_KEYS.INVALID_USERNAME_FORMAT);
        return;
      }
      isSubmitting.value = true;
      backendError.value = "";
      try {
        await axios.post(`${API.BASE_URL}/auth/register`, {
          email: email.value,
          username: username.value,
          password: password.value,
          verificationCode: verificationCode.value
        });
        emit('register-success');
      } catch (error) {
        console.error('注册失败:', error);
        const errorKey = error.response?.data?.error || ERROR_KEYS.REGISTRATION_FAILED;
        proxy.$message.error(getErrorMessage(errorKey));
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
      username, validateUsername, usernameError, isUsernameValid,
      submitText,
      submittingText
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