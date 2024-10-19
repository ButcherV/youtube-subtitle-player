<template>
  <div id="app" class="app-container">
    <TopBar class="top-bar" />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <BottomNav class="bottom-nav" />
  </div>
</template>

<script>
import BottomNav from './components/BottomNav.vue'
import TopBar from './components/TopBar.vue'

export default {
  name: 'App',
  components: {
    BottomNav,
    TopBar
  }
}
</script>

<style>
/* 全局样式 */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}

.app-container {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  overflow: hidden;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #fff; /* 确保内容不会透过去 */
}

.main-content {
  overflow-y: auto;
  background-color: var(--app-content-background-color);
}

.bottom-nav {
  position: sticky;
  bottom: 0;
  z-index: 1000;
  background-color: #fff; /* 确保内容不会透过去 */
}
</style>