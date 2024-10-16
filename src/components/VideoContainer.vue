<template>
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
</template>

<script>
/* global YT */
import { ref, computed, onMounted, onUnmounted } from "vue";

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
    const videoFrame = ref(null);
    const player = ref(null);
    const isPlayerReady = ref(false);

    const embedUrl = computed(() => {
      const videoId = props.videoUrl.split("v=")[1];
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&showinfo=0&rel=0&cc_load_policy=0&disablekb=1&hl=en&cc_lang_pref=en&modestbranding=1&playsinline=1`;
    });

    const onPlayerReady = (event) => {
      isPlayerReady.value = true;
      emit("player-ready", event.target);
      emit("duration-change", event.target.getDuration());

      event.target.unloadModule("captions");
      event.target.unloadModule("cc");

      if (event.target.getOptions("captions")) {
        event.target.setOption("captions", "track", {});
      }

      event.target.playVideo();
      setTimeout(() => {
        event.target.pauseVideo();
      }, 50);
    };

    const onPlayerStateChange = (event) => {
      emit("player-state-change", event);
    };

    const disableCaptions = () => {
      if (player.value && player.value.getOptions) {
        const options = player.value.getOptions();
        if (options.includes("captions")) {
          player.value.unloadModule("captions");
        }
        if (options.includes("cc")) {
          player.value.unloadModule("cc");
        }
      }
    };

    onMounted(() => {
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
            cc_load_policy: 3,
            disablekb: 1,
            hl: "en",
            cc_lang_pref: "en",
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
          },
        });
      };

      const captionsInterval = setInterval(() => {
        if (isPlayerReady.value) {
          disableCaptions();
        }
      }, 1000);

      onUnmounted(() => {
        clearInterval(captionsInterval);
      });
    });

    return {
      videoFrame,
      embedUrl,
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

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
