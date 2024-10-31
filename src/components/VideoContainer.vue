<template>
  <div class="video-container">
    <div id="youtube-player" ref="youtubePlayerRef"></div>
    <div 
      v-if="showThumbnail" 
      class="thumbnail-overlay"
    >
      <img :src="`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`" alt="thumbnail" />
    </div>
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
    const showThumbnail = ref(true);
    const videoId = ref('');

    const initPlayer = (videoId) => {
      console.log('Current User Agent:', window.navigator.userAgent);
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
            onReady: (event) => {
              console.log('播放器就绪事件触发');
              onPlayerReady(event);
            },
            onStateChange: (event) => {
              console.log('播放器状态改变:', event.data);
              onPlayerStateChange(event);
            },
            onError: (event) => {
              // 添加错误处理
              console.error('YouTube播放器错误:', event.data);
              switch(event.data) {
                case 2:
                  console.error('无效参数');
                  break;
                case 5:
                  console.error('HTML5播放器错误');
                  break;
                case 100:
                  console.error('视频不存在或已被删除');
                  break;
                case 101:
                case 150:
                  console.error('视频所有者禁止嵌入播放');
                  break;
              }
            }
          },
        });
      }
    };

    const onPlayerReady = (event) => {
      emit("player-ready", event.target);
      // emit("duration-change", event.target.getDuration());

      // 禁用自带字幕 - 没用
      event.target.unloadModule("captions");
      event.target.unloadModule("cc");

      if (event.target.getOptions("captions")) {
        event.target.setOption("captions", "track", {});
      }

      // 播放后隐藏缩略图
      event.target.addEventListener('onStateChange', (e) => {
        if (e.data === 1) { // 1 表示开始播放
          showThumbnail.value = false;
        }
      });

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
      videoId.value = extractVideoId(props.videoUrl);
      if (videoId.value) {
        initPlayer(videoId.value);
      }
    });

    watch(
      () => props.videoUrl,
      async (newUrl) => {
        videoId.value = extractVideoId(newUrl);
        if (videoId.value) {
          if (player.value) {
            player.value.loadVideoById(videoId.value);
          } else {
            await loadYouTubeIframeAPI();
            initPlayer(videoId.value);
          }
        }
      }
    );

    return {
      youtubePlayerRef,
      showThumbnail, 
      videoId
    };
  },
};
</script>

<style scoped lang="scss">
.video-container {
  width: 96%;
  border-radius: 8px;
  position: relative;
  margin-top: 8px;

  :deep(iframe) {
    border-radius: 8px;
  }
}

.video-container #youtube-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.thumbnail-overlay img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
</style>
