<template>
  <div class="app-container">
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
import { onMounted, onUnmounted } from 'vue'
import NewBottomNav from './components/NewBottomNav.vue'
// import TopBar from './components/TopBar.vue'

export default {
  name: 'App',
  components: {
    // BottomNav,
    NewBottomNav,
    // TopBar
  },
  setup() {
    const setViewportHeight = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    onMounted(() => {
      setViewportHeight()
      window.addEventListener('resize', setViewportHeight)
      window.addEventListener('orientationchange', setViewportHeight)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    })
  }
}
</script>

<style lang="scss" scoped>

.app-container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
}

.main-content {
  overflow-y: auto;
  flex: 1;
  padding-bottom: 50px; // 50px is the height of the bottom nav
  /* background-color: var(--app-content-background-color); */
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $zIndexBottomBar;
  box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.1);
}
</style>