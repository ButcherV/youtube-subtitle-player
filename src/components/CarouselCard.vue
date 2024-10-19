<template>
  <div class="carousel-container" ref="container">
    <div
      class="carousel"
      @touchstart="touchStart"
      @touchmove="touchMove"
      @touchend="touchEnd"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="carousel-item"
        :class="{ active: index === currentIndex }"
        :style="getItemStyle(index)"
      >
        <div class="card">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "CarouselCard",
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const currentIndex = ref(0);
    const container = ref(null);
    let startX = 0;
    let currentX = 0;

    const getItemStyle = (index) => {
      const totalItems = props.items.length;
      const diff = (index - currentIndex.value + totalItems) % totalItems;
      const adjustedDiff = diff > totalItems / 2 ? diff - totalItems : diff;
      const xOffset = adjustedDiff * 30; // 控制 card 横向展示疏密的代码。
      const scale = 1 - Math.abs(adjustedDiff) * 0.1;
      return {
        transform: `translateX(${xOffset}px) scale(${scale})`,
        zIndex: totalItems - Math.abs(adjustedDiff),
      };
    };

    const touchStart = (e) => {
      startX = e.touches[0].clientX;
      currentX = startX;
    };

    const touchMove = (e) => {
      currentX = e.touches[0].clientX;
    };

    const touchEnd = () => {
      const diff = startX - currentX;
      const threshold = container.value.offsetWidth / 4;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          currentIndex.value = (currentIndex.value + 1) % props.items.length;
        } else {
          currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length;
        }
      }
    };

    return {
      currentIndex,
      container,
      touchStart,
      touchMove,
      touchEnd,
      getItemStyle,
    };
  },
};
</script>

<style scoped>
.carousel-container {
  width: 100%;
  overflow: hidden;
  padding: 20px 0;
}

.carousel {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 300px;
}

.carousel-item {
  position: absolute;
  transition: all 0.3s ease;
}

.card {
  width: 260px;
  height: 160px;
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.active .card {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

h3 {
  margin-top: 0;
}
</style>