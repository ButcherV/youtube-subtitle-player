<!-- views/NotFoundView.vue -->
<template>
  <div class="not-found">
    <h1>404</h1>
    <p>抱歉，页面不存在</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.not-found {
  background-color: white;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $zIndex404;
  text-align: center;
  padding: 50px;
}

.not-found h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.not-found a {
  color: #42b983;
  text-decoration: none;
}
</style>
