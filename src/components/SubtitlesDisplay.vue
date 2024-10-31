<template>
  <div class="subtitles-container" ref="subtitlesContainer">
    <div
      v-for="(subtitle, index) in subtitles"
      :key="index"
      :class="{ subtitle: true, active: isSubtitleActive(subtitle) }"
      @click="$emit('seek-to-subtitle', subtitle)"
    >
      <p class="origin-text">{{ subtitle.originText }}</p>
      <p class="translated-text">{{ subtitle.translatedText }}</p>
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
          const container = subtitlesContainer.value;
          const subtitleElement = container.children[props.subtitles.indexOf(activeSubtitle)];
          
          // 获取容器和元素的位置信息
          const containerHeight = container.clientHeight;
          const elementTop = subtitleElement.offsetTop;
          const totalHeight = container.scrollHeight;
          
          // 判断是否有足够空间进行居中
          // 90 是播放栏的高度
          if (elementTop > (containerHeight - 90) / 2 && 
              totalHeight - elementTop > (containerHeight - 90) / 2) {
            // 有足够空间时居中显示
            subtitleElement.scrollIntoView({
              behavior: "auto",
              block: "center"
            });
          } else {
            // 靠近开头或结尾时，使用 nearest
            subtitleElement.scrollIntoView({
              behavior: "auto",
              block: "nearest"
            });
          }
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

<style scoped lang="scss">
.subtitles-container {
  width: 100%;
  overflow-y: auto;
  margin-top: 8px;
  text-align: left;
  padding: 8px 16px;
  box-sizing: border-box;
  /* 自定义滚动动画 */
  scroll-behavior: smooth; 
  @media (prefers-reduced-motion: no-preference) {
    scroll-behavior: smooth;
    scroll-timeline: 0.01s;  // 缩短默认的滚动时间
  }
}

.subtitle {
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.18s ease;

  & + .subtitle {
    margin-top: 8px;
  }

  &.active {
    background-color: $green;

    .origin-text,
    .translated-text {
      color: white;
    }
  }
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

.origin-text {
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
}

.translated-text {
  padding-top: 8px;
  font-size: 14px;
  color: #666;
  line-height: 1.2;
}
</style>
