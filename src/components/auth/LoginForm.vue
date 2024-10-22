<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="email" type="email" placeholder="邮箱" required />
    <input v-model="password" type="password" placeholder="密码" required />
    <button type="submit">登录</button>
  </form>
</template>

<script>
import { ref } from "vue";

export default {
  name: "LoginForm",
  emits: ["login"],
  setup(props, { emit }) {
    const email = ref("");
    const password = ref("");

    const handleSubmit = () => {
      emit("login", { email: email.value, password: password.value });
    };

    return { email, password, handleSubmit };
  },
};
</script>
