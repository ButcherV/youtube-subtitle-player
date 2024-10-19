<template>
  <div id="app" class="app-container">
    <!-- <TopBar class="top-bar" /> -->
    <main class="main-content">
      <router-view></router-view>
    </main>
    <!-- <BottomNav class="bottom-nav" /> -->
    <NewBottomNav class="bottom-nav" />
  </div>
</template>

<script>
// import BottomNav from './components/BottomNav.vue'
import NewBottomNav from './components/NewBottomNav.vue'
// import TopBar from './components/TopBar.vue'

export default {
  name: 'App',
  components: {
    // BottomNav,
    NewBottomNav,
    // TopBar
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
  display: flex;
  height: 100%;
  overflow: hidden;
}

/* .top-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: #fff;
} */

.main-content {
  overflow-y: auto;
  /* background-color: var(--app-content-background-color); */
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}
</style>