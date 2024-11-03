<template>
  <div class="list-view">
    <div
      v-for="item in items"
      :key="item.id"
      class="list-item"
      :class="{ 'loading': item.status !== 'ready' }"
      @click="handleItemClick(item)"
    >
      <div class="list-item-cover-wrapper">
        <img 
          class="list-item-cover" 
          :src="item.coverAddress" 
          alt="Cover" 
        />
      </div>
      <div class="list-item-info">
        <h3 class="list-item-title">{{ item.title }}</h3>
        <p class="list-item-duration">{{ formatDuration(item.duration) }}</p>
      </div>
      <div v-if="item.status !== 'ready'" class="status-indicator">
        <Loading />
      </div>
    </div>
  </div>
</template>

<script>
import Loading from './Loading.vue';

export default {
  name: "VideoList",
  components: {
    Loading
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  methods: {
    handleItemClick(item) {
      if (item.status !== 'ready') {
        return;
      }
      this.$emit('itemClick', item);
    },
    formatDuration(seconds) {
      if (!seconds) return '';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  }
};
</script>

<style scoped lang="scss">
.list-view {
  padding: 16px;
  padding-top: 0;
  flex-grow: 1;
  overflow-y: auto;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  & + .list-item {
    margin-top: 8px;
  }
}

.list-item-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
}

.list-item-cover-wrapper {
  width: 90px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 8px;
  margin-right: 16px;
}

.list-item-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.list-item-title {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 4px 0;
  text-align: left;
}

.list-item-duration {
  font-size: 12px;
  color: #666;
  margin: 0;
  text-align: left;
}

.list-item-platform {
  // width: 24px;
  // height: 24px;
  background-size: contain;
  background-repeat: no-repeat;
  // margin-top: 8px;

  &.youtube {
    background-image: url("../assets/images/logo_youtube.png");
  }

  &.bilibili::before {
    content: "B";
    color: #00a1d6;
    font-size: 14px;
    font-weight: bold;
  }
}

.loading {
  opacity: 0.7;
  pointer-events: none;
  position: relative;
}

.status-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
