<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" placeholder="邮箱" required />
    <input v-model="password" type="password" placeholder="密码" required />
    <input
      v-model="confirmPassword"
      type="password"
      placeholder="确认密码"
      required
    />
    <button type="submit">注册</button>
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
