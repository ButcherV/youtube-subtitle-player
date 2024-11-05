<template>
  <div class="video-clip">
    <div id="clip-player" ref="playerRef"></div>
    <div v-if="!isPlaying" class="thumbnail-overlay" @click="play">
      <img :src="thumbnailUrl" alt="video thumbnail" class="thumbnail" />
      <div class="play-button">
        <font-awesome-icon :icon="['fas', 'play']" />
      </div>
    </div>
  </div>
</template>

<script>
/* global YT */
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";

export default {
  name: "VideoClip",
  props: {
    videoId: {
      type: String,
      required: true,
    },
    startTime: {
      type: Number,
      required: true,
    },
    endTime: {
      type: Number,
      required: true,
    },
    isExpanded: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const playerRef = ref(null);
    const player = ref(null);
    const isPlaying = ref(false);

    const thumbnailUrl = computed(() => {
      // YouTube提供多种尺寸的缩略图：
      // default.jpg (120x90)
      // mqdefault.jpg (320x180)
      // hqdefault.jpg (480x360)
      // sddefault.jpg (640x480)
      // maxresdefault.jpg (1920x1080)
      return `https://img.youtube.com/vi/${props.videoId}/hqdefault.jpg`;
    });

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        player.value = new window.YT.Player("clip-player", {
          height: "100%",
          width: "100%",
          videoId: props.videoId,
          playerVars: {
            controls: 0,  // 隐藏控制栏
            disablekb: 1, // 禁用键盘控制
            modestbranding: 1,  // 简化YouTube品牌显示
            playsinline: 1, // 在移动设备内嵌播放
            start: Math.floor(props.startTime),
            end: Math.ceil(props.endTime), 
            loop: 1  // 添加循环参数
          },
          events: {
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.ENDED) {
                // 视频结束时，重新从开始时间播放
                player.value.seekTo(props.startTime, true);
                player.value.playVideo();
              } else if (event.data === YT.PlayerState.PAUSED) {
                isPlaying.value = false;
              } else if (event.data === YT.PlayerState.PLAYING) {
                isPlaying.value = true;
              }
            },
          },
        });
      }
    };

    const loadYouTubeAPI = () => {
      return new Promise((resolve) => {
        if (window.YT) {
          resolve();
          return;
        }
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(tag, firstScript);
        window.onYouTubeIframeAPIReady = resolve;
      });
    };

    // 开始播放
    const play = () => {
      if (player.value) {
        player.value.seekTo(props.startTime, true);
        player.value.playVideo();
      }
    };

    // 暂停播放
    const pauseVideo = () => {
      if (player.value && typeof player.value.pauseVideo === 'function') {
        player.value.pauseVideo();
        isPlaying.value = false;
      }
    };

    // 销毁播放器
    const destroyPlayer = () => {
      if (player.value && typeof player.value.stopVideo === 'function') {
        player.value.stopVideo();
        player.value.destroy();
        player.value = null;
      }
    };

    onMounted(async () => {
      await loadYouTubeAPI();
      initPlayer();
    });

    // 组件销毁前清理播放器
    onBeforeUnmount(() => {
      destroyPlayer();
    });

    // 监听视频 ID 变化，加载新视频
    watch(
      () => props.videoId,
      () => {
        if (player.value) {
          player.value.loadVideoById({
            videoId: props.videoId,
            startSeconds: props.startTime,
            endSeconds: props.endTime,
          });
        }
      }
    );

    // 监听父组件的展开状态
    watch(() => props.isExpanded, (newValue) => {
      if (!newValue) {  // 当卡片收起时
        pauseVideo();   // 暂停视频播放
      }
    });

    return {
      playerRef,
      isPlaying,
      play,
      thumbnailUrl
    };
  },
};
</script>

<style scoped lang="scss">
.video-clip {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
}

#clip-player {
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  font-size: 64px;
  color: $green;
  z-index: 1;
}
</style>
