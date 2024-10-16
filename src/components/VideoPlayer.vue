<template>
  <div class="video-player">
    <VideoContainer
      :video-url="videoUrl"
      @player-ready="onPlayerReady"
      @player-state-change="onPlayerStateChange"
      @duration-change="duration = $event"
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
    <SubtitlesDisplay
      :subtitles="subtitles"
      :current-time="currentTime"
      @seek-to-subtitle="seekToSubtitle"
    />
  </div>
</template>

<script>
/* global YT */
import { ref, watch } from "vue";
import { parseSRT } from "../utils/srtParser";
import subtitlesFile from "!raw-loader!../assets/scripts/subtitles.srt";
import VideoContainer from "./VideoContainer.vue";
import ControlBar from "./ControlBar.vue";
import SubtitlesDisplay from "./SubtitlesDisplay.vue";

export default {
  name: "VideoPlayer",
  components: {
    VideoContainer,
    ControlBar,
    SubtitlesDisplay,
  },
  props: {
    videoUrl: {
      type: String,
      required: true,
    },
  },
  /* eslint-disable no-unused-vars */
  setup(props) {
    const player = ref(null);
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const subtitles = ref([]);
    const isLooping = ref(false);
    const loopStart = ref(0);
    const loopEnd = ref(0);

    subtitles.value = parseSRT(subtitlesFile);

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
      const currentSubtitle = subtitles.value.find(
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
      subtitles,
      isLooping,
      onPlayerReady,
      onPlayerStateChange,
      togglePlay,
      seek,
      seekToSubtitle,
      toggleLoop,
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
