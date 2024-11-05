<template>
  <div class="video-player">
    <div class="video-title-wrapper">
      <button class="back-button" @click="closePlayer">
        <font-awesome-icon icon="arrow-left" />
      </button>
      <h2 class="video-title">{{ meta.videoTitle }}</h2>
    </div>
    <VideoContainer
      :video-url="videoUrl"
      @player-ready="onPlayerReady"
      @player-state-change="onPlayerStateChange"
    />
    <SubtitlesDisplay
      class="subtitles-wrapper"
      :subtitles="parsedSubtitles"
      :current-time="currentTime"
      @seek-to-subtitle="seekToSubtitle"
    />
    <ControlBar
      class="control-bar"
      :is-playing="isPlaying"
      :current-time="currentTime"
      :duration="duration"
      :is-looping="isLooping"
      @toggle-play="togglePlay"
      @seek="seek"
      @toggle-loop="toggleLoop"
    />
    <SubtitleAnalysisPopup
      :is-active="isLooping"
      :subtitle="currentSubtitle"
      @close="stopLooping"
    />
  </div>
</template>

<script>
/* global YT */
import { ref, watch, computed } from "vue";
import VideoContainer from "./VideoContainer.vue";
import ControlBar from "./ControlBar.vue";
import SubtitlesDisplay from "./SubtitlesDisplay.vue";
import SubtitleAnalysisPopup from './SubtitleAnalysisPopup.vue';

export default {
  name: "VideoPlayer",
  components: {
    VideoContainer,
    ControlBar,
    SubtitlesDisplay,
    SubtitleAnalysisPopup,
  },
  props: {
    videoUrl: {
      type: String,
      required: true,
    },
    subtitles: {
      type: Array,
      required: true,
    },
    meta: {
      type: Object,
      required: true,
    },
    videoId: {
      type: String,
      required: true,
    },
    onClose: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    console.log('Received subtitles:', props.subtitles);
    const player = ref(null);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(props.meta.videoDuration);
    const isLooping = ref(false);
    const loopStart = ref(0);
    const loopEnd = ref(0);

    const closePlayer = () => {
      props.onClose();
    };
    // 解析字幕
    const parsedSubtitles = computed(() => props.subtitles);

    const onPlayerReady = (playerInstance) => {
      console.log('Player ready:', playerInstance);
      player.value = playerInstance;
    };

    const onPlayerStateChange = (event) => {
      isPlaying.value = event.data === YT.PlayerState.PLAYING;
      if (isPlaying.value && isLooping.value) {
        checkAndResetLoop();
      }
    };

    const togglePlay = () => {
      if (player.value) {
        if (isPlaying.value) {
          console.log('Attempting to pause video');
          player.value.pauseVideo();
        } else {
          console.log('Attempting to play video');
          player.value.playVideo();
        }
      } else {
        console.warn('Player not initialized!');
      }
    };

    const seek = (time) => {
      if (player.value) {
        player.value.seekTo(time);
      }
    };

    const seekToSubtitle = (subtitle) => {
      if (player.value) {
        player.value.seekTo(subtitle.start);
      }
    };

    const toggleLoop = () => {
      if (isLooping.value) {
        stopLooping();
      } else {
        startLooping();
      }
    };

    const startLooping = () => {
      const currentSubtitle = parsedSubtitles.value.find(
        (subtitle) =>
          currentTime.value >= subtitle.start &&
          currentTime.value < subtitle.end
      );
      if (currentSubtitle) {
        loopStart.value = currentSubtitle.start;
        loopEnd.value = currentSubtitle.end;
        isLooping.value = true;
        if (player.value) {
          player.value.seekTo(loopStart.value);
          player.value.playVideo();
        }
      }
    };

    const stopLooping = () => {
      isLooping.value = false;
      loopStart.value = 0;
      loopEnd.value = 0;
    };

    const checkAndResetLoop = () => {
      if (isLooping.value && currentTime.value >= loopEnd.value) {
        if (player.value) {
          player.value.seekTo(loopStart.value);
        }
      }
    };

    const currentSubtitle = computed(() => {
      const current = parsedSubtitles.value.find(
        subtitle => currentTime.value >= subtitle.start && currentTime.value < subtitle.end
      );
      
      if (!current) return null;
      
      const index = parsedSubtitles.value.indexOf(current);
      return {
        ...current,
        videoId: props.videoId,
        title: props.meta.videoTitle,
        // description: props.meta.videoDescription,
        previous: index > 0 ? parsedSubtitles.value[index - 1].originText : '',
        next: index < parsedSubtitles.value.length - 1 ? parsedSubtitles.value[index + 1].originText : ''
      };
    });

    watch(isPlaying, (newValue) => {
      if (newValue) {
        const interval = setInterval(() => {
          if (player.value) {
            currentTime.value = player.value.getCurrentTime();
            if (isLooping.value) {
              checkAndResetLoop();
            }
          }
        }, 100);
        return () => clearInterval(interval);
      }
    });

    return {
      isPlaying,
      currentTime,
      duration,
      parsedSubtitles,
      isLooping,
      onPlayerReady,
      onPlayerStateChange,
      togglePlay,
      seek,
      seekToSubtitle,
      toggleLoop,
      currentSubtitle,
      stopLooping,
      closePlayer,
    };
  },
};
</script>

<style scoped lang="scss">
.video-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: $zIndexVideoPlayer;
  background-color: $gray;
}

.video-title-wrapper {
  display: flex;
  align-items: center;
  min-height: 48px; // 定高
  width: 100%;
  padding: 8px 16px;
  background-color: $purple;
}

.back-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  margin-right: 16px;
  color: white;
}

.video-title {
  flex: 1;
  font-size: 16px;
  color: white;
  font-weight: bold;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.2;
  max-height: 2.4em; // 2 行的高度
}

.control-bar {
  position: fixed;
  width: 90%;
  bottom: 8px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba($purple, 0.2);
}

// 90 是播放控制栏的高度
.subtitles-wrapper {
  height: calc(100% - 170px - 64px);
  padding-bottom: 90px;
  margin-bottom: 8px;
}

</style>
