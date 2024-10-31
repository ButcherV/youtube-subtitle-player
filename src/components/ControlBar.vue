<template>
  <div class="control-bar-container">
    <div class="custom-controls">
      <div class="custom-controls-progress">
        <span>{{ formatTime(currentTime) }}</span>
        <input
          class="progress-bar"
          type="range"
          :value="currentTime"
          :max="duration"
          @input="$emit('seek', $event.target.value)"
        />
        <span>{{ formatTime(duration) }}</span>
      </div>
      <div class="custom-controls-buttons">
        <button @click="$emit('toggle-play')">
          <font-awesome-icon :icon="isPlaying ? 'pause' : 'play'" />
        </button>
        <button @click="$emit('toggle-loop')">
          <font-awesome-icon :icon="isLooping ? 'stop' : ['fas', 'rotate-right']" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { watch } from "vue";
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
  setup(props) {
    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // 添加这个 watch 来更新进度条颜色
    watch(
      () => props.currentTime,
      (newTime) => {
        const rangeInput = document.querySelector('.progress-bar');
        if (rangeInput) {
          rangeInput.style.setProperty('--value', newTime);
          rangeInput.style.setProperty('--max', props.duration);
        }
      },
      { immediate: true }
    );

    return {
      formatTime,
    };
  },
};
</script>

<style scoped lang="scss">
.control-bar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-controls {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.custom-controls-progress {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: gray;

  .progress-bar {
    -webkit-appearance: none;
    height: 4px;
    border-radius: 2px;
    background: #e0e0e0;
    outline: none;
    margin: 0 8px;
    width: 100%;

    // Webkit (Chrome, Safari, Edge)
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: $green;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: -6px;
    }

    // Firefox
    &::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border: none;
      border-radius: 50%;
      background: $green;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: -4px;
    }

    // 进度条已播放部分的颜色
    &::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      background: linear-gradient(
        to right,
        $green 0%,
        $green calc((var(--value) / var(--max) * 100%)),
        #e0e0e0 calc((var(--value) / var(--max) * 100%)),
        #e0e0e0 100%
      );
      border-radius: 2px;
    }

    &::-moz-range-track {
      width: 100%;
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
    }
  }
}

.custom-controls-buttons {
  margin-top: 16px;
  display: flex;
  justify-content: center;

  button {
    font-size: 24px;
    width: 32px;
    color: $green;
  }

  button + button {
    margin-left: 16px;
  }
}
</style>
