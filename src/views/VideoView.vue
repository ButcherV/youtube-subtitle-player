<template>
  <div>
    <div v-if="!showVideoPlayer">
      <div class="input-card">
        <div>
          <p>Hi, xiaowei</p>
          <p>或选择预设视频</p>
        </div>
        <div>
          <input
            v-model="userInputUrl"
            placeholder="输入 YouTube 视频链接"
          />
          <button @click="extractSubtitles(userInputUrl)">+</button>
        </div>
      </div>
      <CarouselCard :items="carouselItems" @cardClick="handleCardClick"/>
    </div>
    <VideoPlayer
      v-if="showVideoPlayer"
      :videoUrl="currentVideoUrl"
      :videoId="currentVideoId"
      :subtitles="subtitles"
      :meta="meta"
      @timeupdate="handleTimeUpdate"
      @close="closeVideoPlayer"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import VideoPlayer from "../components/VideoPlayer.vue";
import { extractVideoId } from "../utils/youtubeUtils";
import CarouselCard from '@/components/CarouselCard.vue';

const API_BASE_URL = "http://192.168.128.179:3000";

export default {
  name: "VideoView",
  components: {
    VideoPlayer,
    CarouselCard
  },
  setup() {
    const userInputUrl = ref("");
    const currentVideoUrl = ref("");
    const subtitles = ref([]);
    const meta = ref({});
    const currentVideoId = ref("");
    const showVideoPlayer = ref(false);

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
    ]);

    const handleCardClick = (url) => {
      currentVideoUrl.value = url;
      extractSubtitles(url);
    };

    const extractSubtitles = async (url) => {
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
          {
            videoUrl: targetUrl,
          }
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
      closeVideoPlayer
    };
  },
};
</script>
<style lang="scss" scoped>
.input-card {
  padding: 8px 16px;
  background-color: #1cce6b;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;

  input {
    margin-right: 10px;
    padding: 5px;
    width: 300px;
  }

  button {
    padding: 5px 10px;
  }
}
</style>