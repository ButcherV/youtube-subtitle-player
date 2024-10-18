<template>
  <div class="control-bar-container">
    <div class="custom-controls">
      <button @click="$emit('toggle-play')">
        {{ isPlaying ? "暂停" : "播放" }}
      </button>
      <input
        type="range"
        :value="currentTime"
        :max="duration"
        @input="$emit('seek', $event.target.value)"
      />
      <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      <button @click="$emit('toggle-loop')">
        {{ isLooping ? "停止循环" : "循环当前" }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ControlBar",
  props: {
    isPlaying: {
      type: Boolean,
      required: true,
    },
    currentTime: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isLooping: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["toggle-play", "seek", "toggle-loop"],
  setup() {
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return {
      formatTime,
    };
  },
};
</script>

<style scoped>
.control-bar-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-controls {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.custom-controls input[type="range"] {
  flex-grow: 1;
  margin: 0 10px;
}

.custom-controls button {
  margin-left: 10px;
}
</style>