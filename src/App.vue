<template>
  <div id="app" class="app-container">
    <TopBar class="top-bar" />
    <main class="main-content">
      <router-view></router-view>
      <BottomNav class="bottom-nav" />
    </main>
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.top-bar {
  flex-shrink: 0;
}

.main-content {
  flex-grow: 1;
  overflow-y: auto;
  background-color: var(--app-content-background-color);
}

.bottom-nav {
  position: fixed;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 100000;
}
</style>