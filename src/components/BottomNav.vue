<template>
  <nav class="tabbar tab-style bottom-nav" :class="activeTabStyle">
    <ul class="flex-center">
      <li
        v-for="tab in tabs"
        :key="tab.name"
        :class="[tab.name, { active: activeTab === tab.name }]"
        :data-where="tab.name"
        @click="setActiveTab(tab.name)"
        :ref="el => { if (el) tabRefs[tab.name] = el }"
      >
        <router-link :to="tab.route">
          <span class="material-icons-outlined">{{ tab.icon }}</span>
        </router-link>
      </li>
      <li class="follow" ref="follow">&nbsp;</li>
    </ul>
  </nav>
</template>

<script>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

export default {
  name: "BottomNav",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const tabs = [
      { name: "video", icon: "play_circle", route: "/video" },
      { name: "words", icon: "book", route: "/words" },
      { name: "settings", icon: "settings", route: "/settings" },
    ];

    const activeTab = ref(tabs.find(tab => tab.route === route.path)?.name || "video");
    const follow = ref(null);
    const tabRefs = reactive({});

    const activeTabStyle = computed(() => `${activeTab.value}-style`);

    const setActiveTab = (tabName) => {
      activeTab.value = tabName;
      router.push(tabs.find((tab) => tab.name === tabName).route);
      updateFollowPosition();
    };

    const updateFollowPosition = () => {
      if (follow.value && tabRefs[activeTab.value]) {
        const activeTabElement = tabRefs[activeTab.value];
        const navElement = activeTabElement.closest('.bottom-nav');
        const leftOffset = activeTabElement.offsetLeft - navElement.offsetLeft;
        const FOLLOW_BORDER_WIDTH = 10; // px
        const adjustedLeftOffset = leftOffset - FOLLOW_BORDER_WIDTH;
        follow.value.style.left = `${adjustedLeftOffset}px`;
      }
    };

    onMounted(() => {
      updateFollowPosition();
      window.addEventListener('resize', updateFollowPosition);
    });

    // 监听路由变化
    // 以防出现使用浏览器的后退/前进按钮时，因为这些操作不会触发 Vue 组件的重新渲染。
    // 导致页面渲染了，但是底部导航没有更新的情况。
    watch(() => route.path, (newPath) => {
      const newActiveTab = tabs.find(tab => tab.route === newPath)?.name;
      if (newActiveTab && newActiveTab !== activeTab.value) {
        activeTab.value = newActiveTab;
        updateFollowPosition();
      }
    });

    return {
      tabs,
      activeTab,
      activeTabStyle,
      setActiveTab,
      follow,
      tabRefs,
    };
  },
};
</script>
<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");
@import url("https://fonts.googleapis.com/icon?family=Material+Icons+Outlined");

body {
  background-color: var(--backdrop-color);
  font-size: 10px;
  font-family: "Roboto", sans-serif;
}

.flex-center {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.video {
  &.active {
    color: var(--accent-color);
  }

  &-style {
    --app-content-background-color: #c0d8ec;
  }
}

.words {
  &.active {
    --outset-shadow: rgba(247, 167, 103, 0.45);
    --inset-shadow: rgba(149, 62, 8, 0.45);
    --clay-box-shadow: rgba(211, 69, 20, 0.4);
    --clay-background-color: #d34514;
    --clay-fg-color: #f1f2f3;

    color: #690c0c;
  }

  &-style {
    --app-content-background-color: #d36e5a;
  }
}

.settings {
  &.active {
    --outset-shadow: rgba(230, 230, 230, 0.45);
    --inset-shadow: rgba(81, 81, 81, 0.45);
    --clay-box-shadow: rgba(81, 81, 81, 0.4);
    --clay-background-color: #a3a3a3;
    --clay-fg-color: #f1f2f3;

    color: #783896;
  }

  &-style {
    --app-content-background-color: #a3a3a3;
  }
}

.tabbar {
  background-color: var(--app-content-background-color);
  // border-bottom-left-radius: 1rem;
  // border-bottom-right-radius: 1rem;
  // box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  // background-color: transparent;
  height: 100px;
  display: flex;
  flex-direction: column;
  box-sizing: content-box;
  overflow: hidden;
  transition: background-color 0.4s;

  ul,
  li {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  ul {
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: #f9f8fa;
    align-self: flex-end;
    justify-content: center;
    height: 50px;
  }
  li {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    margin-right: 5px;
    transition: all 0.4s;
    background-color: #f9f8fa;
    width: 60px;
    height: 60px;
    position: relative;
    color: #888;
    cursor: pointer;

    &:last-child {
      margin-right: 0;
    }
  }
}

.tab-style {
  ul {
    justify-content: space-around;
  }

  li {
    display: flex;
    justify-content: center;
    align-items: center;
    top: 1px;
    left: 0;
    width: 60px;
    height: 50px;
    transition: top 0.2s ease-out, width 0.4s, border-radius 0.4s,
      box-shadow 0.4s;

    &.follow {
      position: absolute;
      border-radius: 100%;
      content: " ";
      width: 60px;
      height: 60px;
      border: 10px solid var(--app-content-background-color);
      // background-color: var(--app-content-background-color);
      // border: 10px solid transparent;
      background-color: transparent;
      top: -3rem;
      transition: left 0.2s ease-in, background-color 0.4s, border-color 0.4s;

      &:before,
      &:after {
        content: " ";
        position: absolute;
        top: 27px;
        right: -27px;
        border-top: 11px solid var(--app-content-background-color);
        background-color: #f9f8fa;
        width: 20px;
        height: 20px;
        box-sizing: border-box;
        transition: border-color 0.4s;
      }

      &::after {
        border-top-left-radius: 100%;
      }

      &:before {
        left: -27px;
        right: unset;
        border-top-right-radius: 100%;
      }
    }
  }

  .active {
    z-index: 100;
    width: 60px;
    height: 60px;
    top: -2rem;
    border-radius: 100%;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  }
}

a {
  text-decoration: none;
  color: inherit;
}

.bottom-nav {
  // position: fixed;
  // bottom: 0;
  // left: 0;
  // right: 0;
  // z-index: 1000; /* 确保导航栏在其他内容之上 */
}
</style>
