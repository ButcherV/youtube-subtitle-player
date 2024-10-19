<template>
  <nav>
    <a
      v-for="option in navigationOptions"
      :key="option.name"
      :class="{ active: activeOption === option.name }"
      href="#"
      @click.prevent="handleClick(option)"
      :style="{ '--hover-bg': `${option.color}20`, '--hover-c': option.color }"
    >
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
    </a>
  </nav>
</template>

<script setup>
import { ref } from "vue";

const navigationOptions = [
  {
    name: "home",
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
  },
  {
    name: "likes",
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
  },
];

const activeOption = ref("home");

const handleClick = (option) => {
  activeOption.value = option.name;
  document.body.style.background = option.color;
};
</script>


<style scoped>
@import url("https://fonts.googleapis.com/css?family=Open+Sans:700");

nav {
  display: flex;
  background: #fff;
  padding: 1rem;
  justify-content: space-between;
}

a {
  color: inherit;
  text-decoration: none;
  margin: 0 0.2rem;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 30px;
  position: relative;
}

a svg {
  margin-right: -2.5rem;
  width: 22px;
  height: 22px;
  pointer-events: none;
  transition: margin 0.2s ease-out;
}

a span {
  opacity: 0;
  visibility: hidden;
  font-size: 0.9rem;
  margin-left: 0.9rem;
}

a:before {
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

a.active {
  background: var(--hover-bg);
  color: var(--hover-c);
}

a.active:before {
  background: var(--hover-c);
  opacity: 0;
  visibility: hidden;
  transform: translate(0%, -50%) scale(2);
  transition: all 0.4s ease-out;
}

a.active svg {
  margin-right: 0;
}

a.active span {
  visibility: visible;
  opacity: 1;
  transition: all 0.2s ease-out;
}
</style>
