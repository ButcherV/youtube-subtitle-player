<template>
  <div class="video-view-container">
    <div class="info-card" v-if="!showVideoPlayer">
      <div>
        <p class="info-card-title">Hi, Xiaowei</p>
        <p class="info-card-subtitle">本日视频引入时长：13 分</p>
        <p class="info-card-subtitle">本月时长配额：2 小时 23 分 / 5 小时</p>
      </div>
      <div class="info-card-input-group">
        <input
          class="info-card-input"
          v-model="userInputUrl"
          placeholder="输入 YouTube 视频链接"
        />
        <button class="info-card-add-button" @click="extractSubtitles(userInputUrl)">
          <font-awesome-icon icon="plus" />
        </button>
      </div>
    </div>
    <div class="card-wrapper" v-if="!showVideoPlayer">
      <div class="card-info">
        <p class="card-info-title">#History</p>
        <div class="card-info-subtitle" @click="toggleListView">
          <font-awesome-icon :icon="isListView ? 'chevron-up' : 'chevron-down'" />
        </div>
      </div>
      <CarouselCard
        v-if="!isListView"
        :items="carouselItems" 
        @cardClick="handleCardClick"
      />
      <VideoList
        v-else
        :items="carouselItems"
        @itemClick="handleCardClick"
      />
    </div>
    <Teleport to="body">
      <Transition name="slide-left">
        <VideoPlayer
          v-if="showVideoPlayer"
          :videoUrl="currentVideoUrl"
          :videoId="currentVideoId"
          :subtitles="subtitles"
          :meta="meta"
          @timeupdate="handleTimeUpdate"
          :onClose="closeVideoPlayer"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { ref, inject } from "vue";
import axios from "axios";
import VideoPlayer from "../components/VideoPlayer.vue";
import { extractVideoId } from "../utils/youtubeUtils";
import CarouselCard from '@/components/CarouselCard.vue';
import VideoList from '@/components/VideoList.vue';

const API_BASE_URL = "http://192.168.128.179:3000";

export default {
  name: "VideoView",
  components: {
    VideoPlayer,
    CarouselCard,
    VideoList
  },
  setup() {
    const userInputUrl = ref("");
    const currentVideoUrl = ref("");
    const subtitles = ref([]);
    const meta = ref({});
    const currentVideoId = ref("");
    const showVideoPlayer = ref(false);
    const isListView = ref(true);
    const auth = inject('auth');

    const carouselItems = ref([
      { 
        title: 'Scent of a Woman | "I\'ll Show You Out of Order!"', 
        coverAddress: 'https://img.youtube.com/vi/Jd10x8LiuBc/sddefault.jpg',
        duration: '05:38',
        videoUrl: 'https://www.youtube.com/watch?v=Jd10x8LiuBc',
        videoPlatform: 'youtube'
      },
      { 
        title: 'Morgan Freeman Red Misses Andy Dufresne - The Shawshank Redemption (1994)', 
        duration: '01:51',
        coverAddress: 'https://img.youtube.com/vi/mgwZr0r_yF0/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=mgwZr0r_yF0',
        videoPlatform: 'youtube'
      },
      { 
        title: 'Queen – Bohemian Rhapsody (Official Video Remastered)', 
        duration: '05:59',
        coverAddress: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        videoPlatform: 'youtube'
      },
      { 
        title: 'U.S.A. For Africa - We Are the World"', 
        duration: '07:11',
        coverAddress: 'https://img.youtube.com/vi/9AjkUyX0rVw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=9AjkUyX0rVw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Robin Williams' Speech | Good Will Hunting | Max", 
        duration: '05:00',
        coverAddress: 'https://img.youtube.com/vi/8GY3sO47YYo/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=8GY3sO47YYo',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
      { 
        title: "Pink Floyd Another Brick In The Wall (HQ)", 
        duration: '06:00',
        coverAddress: 'https://img.youtube.com/vi/bZwxTX2pWmw/sddefault.jpg', 
        videoUrl: 'https://www.youtube.com/watch?v=bZwxTX2pWmw',
        videoPlatform: 'youtube'
      },
    ]);

    const toggleListView = () => {
      isListView.value = !isListView.value;
    };


    const handleCardClick = (url) => {
      if (!auth.checkAuth()) {
        auth.showAuthModal();
        return;
      }
      
      currentVideoUrl.value = url;
      extractSubtitles(url);
    };

    const extractSubtitles = async (url) => {
      if (!auth.checkAuth()) {
        auth.showAuthModal();
        return;
      }

      const targetUrl = url || userInputUrl.value;
      if (!targetUrl) {
        alert("请输入 YouTube 视频链接或选择一个预设视频");
        return;
      }

      currentVideoUrl.value = targetUrl;
      const videoId = extractVideoId(targetUrl);
      currentVideoId.value = videoId;

      if (!videoId) {
        alert("无效的 YouTube 链接");
        return;
      }

      // 首先检查 localStorage
      const storedData = localStorage.getItem(videoId);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData.subtitles) {
            subtitles.value = parsedData.subtitles;
            meta.value = parsedData.metadata;
            console.log("从 localStorage 加载字幕数据");
            showVideoPlayer.value = true;
            return;
          }
        } catch (error) {
          console.error("解析存储的字幕数据时出错:", error);
          // 如果解析失败，继续从服务器获取
        }
      }

      // 如果没有缓存，显示确认对话框
      const userConfirmed = await showConfirmDialog();
      if (!userConfirmed) {
        console.log("用户取消了字幕提取");
        return;
      }

      try {
        console.log("正在从服务器获取字幕，URL:", targetUrl);
        const response = await axios.post(
          `${API_BASE_URL}/extract-and-translate-subtitles`,
          { videoUrl: targetUrl }
        );
        console.log("收到响应:", response);

        if (response.data && response.data.subtitles) {
          subtitles.value = response.data.subtitles;
          meta.value = response.data.metadata;
          console.log("解析和翻译后的字幕:", subtitles.value);
          localStorage.setItem(videoId, JSON.stringify(response.data));
          showVideoPlayer.value = true;
        } else {
          throw new Error("无效的字幕数据");
        }
      } catch (error) {
        console.error("提取字幕时出错:", error);
        if (error.response) {
          console.error("响应数据:", error.response.data);
          console.error("响应状态:", error.response.status);
        }
        alert("提取字幕时出错，请检查视频链接或稍后重试");
      }
    };

    const showConfirmDialog = () => {
      return new Promise((resolve) => {
        const result = window.confirm("首次处理字幕，是否同意继续？");
        resolve(result);
      });
    };

    const handleTimeUpdate = () => {
      // 可以在这里添加额外的逻辑，如果需要的话
    };

    const closeVideoPlayer = () => {
      showVideoPlayer.value = false;
    };

    return {
      userInputUrl,
      currentVideoUrl,
      subtitles,
      meta,
      extractSubtitles,
      handleTimeUpdate,
      currentVideoId,
      carouselItems,
      handleCardClick,
      showVideoPlayer,
      closeVideoPlayer,
      isListView,
      toggleListView,
    };
  },
};
</script>
<style lang="scss" scoped>
.video-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.carousel-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.info-card {
  padding: 16px;
  background-color: $green;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 8px 15px rgba(0, 0, 0, 0.05);
}

.info-card-input-group {
  display: flex;
  margin-top: 16px;
}

.info-card-input {
  flex-grow: 1;
  width: 300px;
  padding: 10px;
  border: 4px solid white;
  border-radius: 8px 0 0 8px;
  background-color: $green;
  color: white;
}

.info-card-input::placeholder {
  color: white;
  font-weight: 900;
}

.info-card-add-button {
  width: 44px;
  height: 44px;
  background-color: transparent;
  border: 4px solid white;
  border-radius: 0 8px 8px 0; /* 右边圆角 */
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

/* 确保输入框和按钮紧密相连 */
.info-card-input {
  border-right-width: 2px;
}

.info-card-add-button {
  border-left-width: 2px;
  border-right-width: 4px;
}

.info-card-title {
  font-size: 32px;
  text-align: left;
  font-weight: 900;
  color: white;
}

.info-card-subtitle {
  font-size: 14px;
  color: white;
  text-align: left;
  padding-top: 8px;
  font-weight: 600;
}

.card-info {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
}

.card-info-title {
  font-size: 24px;
  font-weight: bold;
  font-weight: 900;
}

.card-info-subtitle {
  font-size: 14px;
  font-weight: bold;
  width: 40px;
  height: 100%;
  display: flex;
  justify-content: end;
  align-items: center;
}

.card-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}

.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0);
}

</style>