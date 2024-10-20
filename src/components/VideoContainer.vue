<template>
  <div class="video-container">
    <div id="youtube-player" ref="youtubePlayerRef"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { extractVideoId } from '../utils/youtubeUtils';

export default {
  name: "VideoContainer",
  props: {
    videoUrl: {
      type: String,
      required: true,
    },
  },
  emits: ["player-ready", "player-state-change", "duration-change"],
  setup(props, { emit }) {
    const youtubePlayerRef = ref(null);
    const player = ref(null);

    const initPlayer = (videoId) => {
      if (window.YT && window.YT.Player && youtubePlayerRef.value) {
        player.value = new window.YT.Player(youtubePlayerRef.value, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            controls: 0,
            showinfo: 0,
            rel: 0,
            cc_load_policy: 3,
            disablekb: 1,
            hl: "en",
            cc_lang_pref: "en",
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      }
    };

    const onPlayerReady = (event) => {
      emit("player-ready", event.target);
      emit("duration-change", event.target.getDuration());

      // 试图禁用自带字幕
      event.target.unloadModule("captions");
      event.target.unloadModule("cc");

      if (event.target.getOptions("captions")) {
        event.target.setOption("captions", "track", {});
      }

      // 短暂播放然后暂停视频，遮盖播放键
      event.target.playVideo();
      setTimeout(() => {
        event.target.pauseVideo();
      }, 50);
    };

    const onPlayerStateChange = (event) => {
      console.log("Player state change:", event.data);
      emit("player-state-change", event);
    };

    const loadYouTubeIframeAPI = () => {
      return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve();
        } else {
          const tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          window.onYouTubeIframeAPIReady = resolve;
        }
      });
    };

    onMounted(async () => {
      await loadYouTubeIframeAPI();
      const videoId = extractVideoId(props.videoUrl);
      if (videoId) {
        initPlayer(videoId);
      }
    });

    watch(() => props.videoUrl, async (newUrl) => {
      const videoId = extractVideoId(newUrl);
      if (videoId) {
        if (player.value) {
          player.value.loadVideoById(videoId);
        } else {
          await loadYouTubeIframeAPI();
          initPlayer(videoId);
        }
      }
    });

    return {
      youtubePlayerRef,
    };
  },
};
</script>

<style scoped>
.video-container {
  width: 100%;
  position: relative;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
}

.video-container #youtube-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>