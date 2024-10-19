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
        :style="{ transform: `translateX(${(index - currentIndex) * 60}px) scale(${1 - Math.abs(index - currentIndex) * 0.1})`, zIndex: items.length - Math.abs(index - currentIndex) }"
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
import { ref, onMounted } from "vue";

export default {
  name: "CarouselCard",
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  setup(props) {  // 添加 props 参数
    const currentIndex = ref(0);
    const container = ref(null);
    let startX = 0;
    let currentX = 0;

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
        if (diff > 0 && currentIndex.value < props.items.length - 1) {  // 使用 props.items
          currentIndex.value++;
        } else if (diff < 0 && currentIndex.value > 0) {
          currentIndex.value--;
        }
      }
    };

    onMounted(() => {
      // 可以在这里添加初始化逻辑
    });

    return {
      currentIndex,
      container,
      touchStart,
      touchMove,
      touchEnd,
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
  height: 300px; /* 调整高度以适应您的设计 */
}

.carousel-item {
  position: absolute;
  transition: all 0.3s ease;
}

.card {
  width: 260px; /* 固定宽度 */
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