<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <input
      v-model="email"
      type="email"
      placeholder="邮箱"
      required
      class="auth-input"
    />
    <input
      v-model="password"
      type="password"
      placeholder="密码"
      required
      class="auth-input"
    />
    <input
      v-model="confirmPassword"
      type="password"
      placeholder="确认密码"
      required
      class="auth-input"
    />
    <button type="submit" class="auth-button">注册</button>
  </form>
</template>

<script>
import { ref } from "vue";

export default {
  name: "RegisterForm",
  emits: ["register"],
  setup(props, { emit }) {
    const email = ref("");
    const password = ref("");
    const confirmPassword = ref("");

    const handleSubmit = () => {
      if (password.value !== confirmPassword.value) {
        alert("密码不匹配");
        return;
      }
      emit("register", { email: email.value, password: password.value });
    };

    return { email, password, confirmPassword, handleSubmit };
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
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.auth-button:hover {
  background-color: #1976d2;
}
</style>
