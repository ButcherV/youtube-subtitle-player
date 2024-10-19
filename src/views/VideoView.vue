<template>
  <div>
    <input
      v-model="videoUrl"
      placeholder="输入 YouTube 视频链接"
      @keyup.enter="extractSubtitles"
    />
    <button @click="extractSubtitles">提取字幕</button>
    <CarouselCard :items="carouselItems" />
    <VideoPlayer
      v-if="subtitles.length"
      :videoUrl="videoUrl"
      :videoId="currentVideoId"
      :subtitles="subtitles"
      :meta="meta"
      @timeupdate="handleTimeUpdate"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import VideoPlayer from "../components/VideoPlayer.vue";
// import { parseSRT } from './utils/srtParser';
import { extractVideoId } from "../utils/youtubeUtils";
// import { translateSubtitles } from './services/translationService';
import CarouselCard from '@/components/CarouselCard.vue';
// 基础 URL
const API_BASE_URL = "http://localhost:3000";

export default {
  name: "VideoView",
  components: {
    VideoPlayer,
    CarouselCard
  },
  setup() {
    const videoUrl = ref("");
    const subtitles = ref([]);
    const meta = ref({});
    const currentVideoId = ref("");

    const carouselItems = [
      { title: 'Card 1', description: 'This is the first card' },
      { title: 'Card 2', description: 'This is the second card' },
      { title: 'Card 3', description: 'This is the 3 card' },
      { title: 'Card 4', description: 'This is the 4 card' },
      { title: 'Card 5', description: 'This is the 5 card' },
      // { title: 'Card 6', description: 'This is the 6 card' },
      // { title: 'Card 7', description: 'This is the 7 card' },
      // { title: 'Card 8', description: 'This is the 8 card' },
      // { title: 'Card 9', description: 'This is the 9 card' },
      // { title: 'Card 10', description: 'This is the 10 card' },
      // { title: 'Card 11', description: 'This is the 11 card' },
      // { title: 'Card 12', description: 'This is the 12 card' },
      // { title: 'Card 13', description: 'This is the 13 card' },
    ];

    const extractSubtitles = async () => {
      if (!videoUrl.value) {
        alert("请输入 YouTube 视频链接");
        return;
      }

      const videoId = extractVideoId(videoUrl.value);
      currentVideoId.value = extractVideoId(videoUrl.value);

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
        console.log("正在从服务器获取字幕，URL:", videoUrl.value);
        const response = await axios.post(
          `${API_BASE_URL}/extract-and-translate-subtitles`,
          {
            videoUrl: videoUrl.value,
          }
        );
        console.log("收到响应:", response);

        if (response.data && response.data.subtitles) {
          console.log("接收到的字幕数据:", response.data.subtitles);
          // const parsedSubtitles = parseSRT(response.data.subtitles)
          // const parsedSubtitles = response.data.subtitles

          // 调用翻译服务
          // subtitles.value = await translateSubtitles(parsedSubtitles)

          // srt 数据格式化功能、翻译功能都已迁移至后端
          subtitles.value = response.data.subtitles;
          meta.value = response.data.metadata;
          console.log("解析和翻译后的字幕:", subtitles.value);
          localStorage.setItem(videoId, JSON.stringify(response.data));
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

    return {
      videoUrl,
      subtitles,
      meta,
      extractSubtitles,
      handleTimeUpdate,
      currentVideoId,
      carouselItems
    };
  },
};
</script>

<style>

input {
  margin-right: 10px;
  padding: 5px;
  width: 300px;
}

button {
  padding: 5px 10px;
}
</style>
