<template>
  <div class="video-player">
    <div class="video-title">{{ meta.videoTitle }}</div>
    <VideoContainer
      :video-url="videoUrl"
      @player-ready="onPlayerReady"
      @player-state-change="onPlayerStateChange"
      @duration-change="duration = $event"
    />
    <SubtitlesDisplay
      :subtitles="parsedSubtitles"
      :current-time="currentTime"
      @seek-to-subtitle="seekToSubtitle"
    />
    <ControlBar
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
      :video-id="videoId"
      :current-subtitle-id="currentSubtitleId"
      :current-subtitle-text="currentSubtitleText"
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
  },
  setup(props) {
    console.log('Received subtitles:', props.subtitles);
    const player = ref(null);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const isLooping = ref(false);
    const loopStart = ref(0);
    const loopEnd = ref(0);

    // 解析字幕
    const parsedSubtitles = computed(() => props.subtitles);

    const onPlayerReady = (playerInstance) => {
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
          player.value.pauseVideo();
        } else {
          player.value.playVideo();
        }
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
      return parsedSubtitles.value.find(
        subtitle => currentTime.value >= subtitle.start && currentTime.value < subtitle.end
      );
    });

    const currentSubtitleText = computed(() => {
      return currentSubtitle.value ? currentSubtitle.value.originText : '';
    });

    const currentSubtitleId = computed(() => {
      return currentSubtitle.value ? currentSubtitle.value.id : null;
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
      currentSubtitleText,
      currentSubtitleId,
      stopLooping
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
</style>