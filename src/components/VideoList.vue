<template>
  <div class="list-view">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="list-item"
      @click="$emit('itemClick', item.videoUrl)"
    >
      <img class="list-item-cover" :src="item.coverAddress" alt="Cover" />
      <div class="list-item-info">
        <h3 class="list-item-title">{{ item.title }}</h3>
        <p class="list-item-duration">{{ item.duration }}</p>
        <div
          v-if="item.videoPlatform"
          class="list-item-platform"
          :class="item.videoPlatform"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VideoList",
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  emits: ["itemClick"],
};
</script>

<style scoped lang="scss">
.list-view {
  padding: 16px;
  flex-grow: 1;
  overflow-y: auto;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  & + .list-item {
    margin-top: 16px;
  }

  &:hover {
    background-color: #f5f5f5;
  }
}

.list-item-cover {
  width: 120px;
  height: 90px;
  object-fit: cover;
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
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-align: left;
}

.list-item-duration {
  font-size: 14px;
  color: #666;
  margin: 0;
  text-align: left;
}

.list-item-platform {
  width: 24px;
  height: 24px;
  background-size: contain;
  background-repeat: no-repeat;
  margin-top: 8px;

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
</style>
