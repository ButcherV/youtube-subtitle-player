<template>
  <div class="video-player">
    <div class="video-container">
      <iframe
        width="560"
        height="315"
        :src="embedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        ref="videoFrame"
      ></iframe>
    </div>
    <div class="custom-controls">
      <button @click="togglePlay">{{ isPlaying ? "暂停" : "播放" }}</button>
      <input type="range" v-model="currentTime" :max="duration" @input="seek" />
      <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
    </div>
    <div class="subtitles-container" ref="subtitlesContainer">
      <div
        v-for="(subtitle, index) in subtitles"
        :key="index"
        :class="{ subtitle: true, active: isSubtitleActive(subtitle) }"
        @click="seekToSubtitle(subtitle)"
      >
        {{ subtitle.text }}
      </div>
    </div>
  </div>
</template>

<script>
/* global YT */
import { ref, computed, onMounted, watch } from "vue";
import { parseSRT } from "../utils/srtParser";

// 导入 SRT 文件
import subtitlesFile from "!raw-loader!../assets/scripts/subtitles.srt";

export default {
  name: "VideoPlayer",
  props: {
    videoUrl: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const videoFrame = ref(null);
    const subtitlesContainer = ref(null);
    const player = ref(null);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const subtitles = ref([]);
    const isPlayerReady = ref(false); // 新增：用于跟踪播放器是否准备就绪

    const embedUrl = computed(() => {
      const videoId = props.videoUrl.split("v=")[1];
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&showinfo=0&rel=0&cc_load_policy=0&disablekb=1&hl=en&cc_lang_pref=en`;
    });

    const isSubtitleActive = (subtitle) => {
      return (
        currentTime.value >= subtitle.start && currentTime.value < subtitle.end
      );
    };

    const seekToSubtitle = (subtitle) => {
      if (isPlayerReady.value && player.value) {
        player.value.seekTo(subtitle.start);
      }
    };

    const togglePlay = () => {
      if (isPlayerReady.value && player.value) {
        if (isPlaying.value) {
          player.value.pauseVideo();
        } else {
          player.value.playVideo();
        }
      }
    };

    const seek = () => {
      if (isPlayerReady.value && player.value) {
        player.value.seekTo(currentTime.value);
      }
    };

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    onMounted(() => {
      // 解析 SRT 文件
      subtitles.value = parseSRT(subtitlesFile);

      // 加载 YouTube IFrame API
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        player.value = new YT.Player(videoFrame.value, {
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
          playerVars: {
            controls: 0,
            showinfo: 0,
            rel: 0,
            cc_load_policy: 0,
            disablekb: 1,
            hl: "en",
            cc_lang_pref: "en",
            iv_load_policy: 3,
          },
        });
      };
    });

    const onPlayerReady = (event) => {
      duration.value = event.target.getDuration();
      event.target.unloadModule("captions");
      event.target.unloadModule("cc");
      isPlayerReady.value = true; // 标记播放器已准备就绪
    };

    const onPlayerStateChange = (event) => {
      isPlaying.value = event.data === YT.PlayerState.PLAYING;
    };

    watch(isPlaying, (newValue) => {
      if (newValue) {
        const interval = setInterval(() => {
          if (isPlayerReady.value && player.value) {
            currentTime.value = player.value.getCurrentTime();
          }
        }, 1000);
        return () => clearInterval(interval);
      }
    });

    watch(currentTime, () => {
      const activeSubtitle = subtitles.value.find(isSubtitleActive);
      if (activeSubtitle) {
        const subtitleElement =
          subtitlesContainer.value.children[
            subtitles.value.indexOf(activeSubtitle)
          ];
        subtitleElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    });

    return {
      videoFrame,
      subtitlesContainer,
      embedUrl,
      isPlaying,
      currentTime,
      duration,
      subtitles,
      isSubtitleActive,
      seekToSubtitle,
      togglePlay,
      seek,
      formatTime,
    };
  },
};
</script>
<style scoped>
.video-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.video-container {
  width: 100%;
  position: relative;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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

.subtitles-container {
  height: 200px; /* 固定高度 */
  width: 100%;
  overflow-y: auto; /* 垂直滚动 */
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
  background-color: #ffff00; /* 高亮颜色 */
  font-weight: bold;
}

/* 自定义滚动条样式 */
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
