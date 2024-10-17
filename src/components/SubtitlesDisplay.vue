<template>
  <div class="subtitles-container" ref="subtitlesContainer">
    <div
      v-for="(subtitle, index) in subtitles"
      :key="index"
      :class="{ subtitle: true, active: isSubtitleActive(subtitle) }"
      @click="$emit('seek-to-subtitle', subtitle)"
    >
      <p>{{ subtitle.originText }}</p>
      <p>{{ subtitle.translatedText }}</p>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "SubtitlesDisplay",
  props: {
    subtitles: {
      type: Array,
      required: true,
    },
    currentTime: {
      type: Number,
      required: true,
    },
  },
  emits: ["seek-to-subtitle"],
  setup(props) {
    const subtitlesContainer = ref(null);

    const isSubtitleActive = (subtitle) => {
      return (
        props.currentTime >= subtitle.start && props.currentTime < subtitle.end
      );
    };

    watch(
      () => props.currentTime,
      () => {
        const activeSubtitle = props.subtitles.find(isSubtitleActive);
        if (activeSubtitle) {
          const subtitleElement =
            subtitlesContainer.value.children[
              props.subtitles.indexOf(activeSubtitle)
            ];
          subtitleElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    );

    return {
      subtitlesContainer,
      isSubtitleActive,
    };
  },
};
</script>

<style scoped>
.subtitles-container {
  height: 200px;
  width: 100%;
  overflow-y: auto;
  border: 1px solid #ccc;
  margin-top: 10px;
  text-align: left;
  padding: 10px;
  box-sizing: border-box;
}

.subtitle {
  padding: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.subtitle.active {
  background-color: #ffff00;
  font-weight: bold;
}

.subtitles-container::-webkit-scrollbar {
  width: 8px;
}

.subtitles-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.subtitles-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.subtitles-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
