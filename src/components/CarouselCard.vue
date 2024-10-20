<template>
  <div class="carousel-container" ref="container">
    <div>
      <div
        class="carousel"
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
      >
        <div
          v-for="index in visibleIndexes"
          :key="index"
          class="carousel-item"
          :class="{ active: index === currentIndex }"
          :style="getItemStyle(index)"
          @click="$emit('cardClick', items[index].videoUrl)"
        >
          <div class="card">
            <img class="card-cover-address" :src="items[index].coverAddress" alt="Cover" />
            <div v-if="items[index].videoPlatform" class="card-platform-icon" :class="items[index].videoPlatform"></div>
            <div>
              <p class="card-duration">{{ items[index].duration }}</p>
              <h3 class="card-title">{{ items[index].title }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  name: "CarouselCard",
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  emits: ['cardClick'],
  setup(props) {
    const currentIndex = ref(0);
    const container = ref(null);
    let startX = 0;
    let currentX = 0;

    const visibleIndexes = computed(() => {
      const totalItems = props.items.length;
      const visibleCount = 5; // 同时显示的卡片数量
      const halfVisible = Math.floor(visibleCount / 2);
      
      let indexes = [];
      for (let i = -halfVisible; i <= halfVisible; i++) {
        let index = (currentIndex.value + i + totalItems) % totalItems;
        indexes.push(index);
      }
      return indexes;
    });

    const getItemStyle = (index) => {
      const totalItems = props.items.length;
      const diff = (index - currentIndex.value + totalItems) % totalItems;
      const adjustedDiff = diff > totalItems / 2 ? diff - totalItems : diff;
      const xOffset = adjustedDiff * 30;
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
      visibleIndexes,
      touchStart,
      touchMove,
      touchEnd,
      getItemStyle,
    };
  },
};
</script>

<style scoped lang="scss">
.carousel-container {
  width: 100%;
  overflow: hidden;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
}

.carousel {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  min-height: 210px;
}

.carousel-item {
  position: absolute;
  transition: all 0.3s ease;
}

.card {
  width: 260px;
  height: 190px;
  background-color: #fff;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.card-platform-icon {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  // background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  background-size: contain;
  background-repeat: no-repeat;
  align-items: center;
  justify-content: center;

  &.youtube {
    background-image: url('../assets/images/logo_youtube.png');
  }

  &.bilibili::before {
    content: "B";
    color: #00a1d6;
    font-size: 14px;
    font-weight: bold;
  }
}


.card-title {
  font-size: 14px;
  line-height: 1.2;
  font-weight: bold;
  text-align: left;
  padding-top: 4px;

  /* 超过两行打点 */
  max-height: 2.4em; /* 2 行的高度 (2 * 1.2) */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制在2行 */
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  margin: 0; /* 移除默认的 margin */
}

.card-duration {
  font-size: 12px;
  color: gray;
  font-weight: bold;
  text-align: left;
}

.card-cover-address {
  border-radius: 8px;
  width: 100%;
  height: 70%;
  object-fit: cover;
}

.active .card {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

h3 {
  margin-top: 0;
}
</style>
