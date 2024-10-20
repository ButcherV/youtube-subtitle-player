<template>
  <nav>
    <a
      v-for="option in navigationOptions"
      :key="option.name"
      :class="{ active: activeOption === option.name, 'bottom-nav-item': true }"
      href="#"
      @click.prevent="handleClick(option)"
      :style="{ '--hover-bg': `${option.color}20`, '--hover-c': option.color }"
    >
      <router-link :to="option.route" class="bottom-nav-router">
        <svg viewBox="0 0 100 100">
          <g :transform="option.svgTransform">
            <component :is="option.svgComponent" v-bind="option.svgProps" />
            <component
              v-for="(child, index) in option.children"
              :key="index"
              :is="child.component"
              v-bind="child.props"
            />
          </g>
        </svg>
        <span>
          {{ option.name.charAt(0).toUpperCase() + option.name.slice(1) }}
        </span>
      </router-link>
    </a>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const navigationOptions = [
  {
    name: "video",
    color: "#5B37B7",
    svgTransform: "translate(10 5) scale(0.8 0.9)",
    svgComponent: "path",
    svgProps: {
      d: "M 0 30 v 70 h 100 v -70 l -50 -30 z",
      stroke: "currentColor",
      "stroke-width": "10",
      fill: "none",
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
    },
    route: "/video",
  },
  {
    name: "words",
    color: "#C9379D",
    svgTransform: "translate(5 5) scale(0.9 0.9)",
    svgComponent: "path",
    svgProps: {
      d: "M 50 35 a 20 20 0 0 1 50 0 q 0 25 -50 60 q -50 -35 -50 -60 a 25 25 0 0 1 50 0",
      stroke: "currentColor",
      "stroke-width": "10",
      fill: "none",
      "stroke-linejoin": "round",
      "stroke-linecap": "round",
    },
    route: "/words",
  },
  {
    name: "profile",
    color: "#1892A6",
    svgTransform: "translate(5 5) scale(0.9 0.9)",
    svgComponent: "g",
    svgProps: {},
    children: [
      {
        component: "circle",
        props: {
          cx: "50",
          cy: "35",
          r: "18",
          stroke: "currentColor",
          "stroke-width": "10",
          fill: "none",
        },
      },
      {
        component: "rect",
        props: {
          x: "15",
          y: "75",
          width: "70",
          height: "50",
          rx: "25",
          stroke: "currentColor",
          "stroke-width": "10",
          fill: "none",
        },
      },
    ],
    route: "/settings",
  },
];

const activeOption = ref(
  navigationOptions.find((option) => option.route === route.path)?.name ||
    "Video"
);

const handleClick = (option) => {
  activeOption.value = option.name;
  router.push(option.route);
  document.body.style.background = option.color;
};

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    const newActiveOption = navigationOptions.find(
      (option) => option.route === newPath
    )?.name;
    if (newActiveOption && newActiveOption !== activeOption.value) {
      activeOption.value = newActiveOption;
      document.body.style.background = navigationOptions.find(
        (option) => option.name === newActiveOption
      ).color;
    }
  }
);


// 初始化背景颜色
// 为什么要用 nextTick?
// 因为初始化中 body 的背景颜色的更新会导致 CarouselCard 渲染出问题，其宽度计算不准确
// 非常奇葩的 bug。
onMounted(() => {
  nextTick(() => {
    document.body.style.background = navigationOptions.find(
      (option) => option.name === activeOption.value
    ).color;
  });
});
// onMounted(() => {
//   document.body.style.background = navigationOptions.find(
//     (option) => option.name === activeOption.value
//   ).color;
// });
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Open+Sans:700");

nav {
  display: flex;
  background: white;
  padding: 8px 16px;
  justify-content: space-between;
}

.bottom-nav-item {
  color: inherit;
  text-decoration: none;
  margin: 0 0.2rem;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 30px;
  position: relative;
}

.bottom-nav-router {
  display: flex;
  align-items: center;
}

.bottom-nav-item svg {
  margin-right: -2.5rem;
  width: 22px;
  height: 22px;
  pointer-events: none;
  transition: margin 0.2s ease-out;
}

.bottom-nav-item span {
  opacity: 0;
  visibility: hidden;
  font-size: 1rem;
  font-weight: 900;
  margin-left: 0.6rem;
}

.bottom-nav-item:before {
  position: absolute;
  content: "";
  top: 50%;
  left: 0;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  transform: translate(0%, -50%) scale(0);
  visibility: visible;
  opacity: 1;
}

.bottom-nav-item.active {
  background: var(--hover-bg);
  color: var(--hover-c);
}

.bottom-nav-item.active:before {
  background: var(--hover-c);
  opacity: 0;
  visibility: hidden;
  transform: translate(0%, -50%) scale(2);
  transition: all 0.4s ease-out;
}

.bottom-nav-item.active svg {
  margin-right: 0;
}

.bottom-nav-item.active span {
  visibility: visible;
  opacity: 1;
  transition: all 0.2s ease-out;
}

.bottom-nav-router {
  text-decoration: none;
  color: inherit;
}
</style>
