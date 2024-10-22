<template>
  <div class="video-container">
    <div id="youtube-player" ref="youtubePlayerRef"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { extractVideoId } from "../utils/youtubeUtils";

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
          height: "100%",
          width: "100%",
          videoId: videoId,
          playerVars: {
            controls: 0, // 禁用播放器控件
            showinfo: 0, // 隐藏视频标题和上传者信息
            rel: 0, // 禁用相关视频
            cc_load_policy: 3, // 默认不显示字幕
            disablekb: 1, // 禁用键盘控制
            hl: "en", // 设置播放器语言为英语
            cc_lang_pref: "en", // 设置字幕语言首选项为英语
            iv_load_policy: 3, // 隐藏视频注释
            modestbranding: 1, // 隐藏 YouTube 标志
            playsinline: 1, // 在 iOS 中内联播放视频
            autoplay: 0, // 禁止自动播放
            fs: 0, // 禁用全屏按钮
            loop: 0, // 禁止循环播放
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

      // 禁用自带字幕
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

      // 禁用点击视频暂停/播放功能
      const iframe = event.target.getIframe();
      if (iframe) {
        iframe.style.pointerEvents = "none";
      }

      // 尝试添加自定义样式以隐藏 YouTube 标志和其他元素
      try {
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            JSON.stringify({
              event: "command",
              func: "addClass",
              args: [
                "ytp-chrome-top ytp-chrome-bottom ytp-watermark",
                "display-none",
              ],
            }),
            "*"
          );
        }
      } catch (error) {
        console.error("Error while trying to hide YouTube elements:", error);
      }
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
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName("script")[0];
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

    watch(
      () => props.videoUrl,
      async (newUrl) => {
        const videoId = extractVideoId(newUrl);
        if (videoId) {
          if (player.value) {
            player.value.loadVideoById(videoId);
          } else {
            await loadYouTubeIframeAPI();
            initPlayer(videoId);
          }
        }
      }
    );

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
