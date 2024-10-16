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
      <button @click="toggleLoopAndShowText">
        {{ isLooping ? "停止循环" : "循环当前" }}
      </button>
    </div>
    <transition name="fade">
      <div v-if="showLoopText" class="loop-text-container">
        <p>{{ currentLoopText }}</p>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref } from 'vue';

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
    currentSubtitleText: {
      type: String,
      default: '',
    },
  },
  emits: ["toggle-play", "seek", "toggle-loop"],
  setup(props, { emit }) {
    const showLoopText = ref(false);
    const currentLoopText = ref('');

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const toggleLoopAndShowText = () => {
      emit('toggle-loop');
      if (!props.isLooping) {
        currentLoopText.value = props.currentSubtitleText;
        showLoopText.value = true;
      } else {
        showLoopText.value = false;
      }
    };

    return {
      formatTime,
      showLoopText,
      currentLoopText,
      toggleLoopAndShowText,
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

.loop-text-container {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  text-align: center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 