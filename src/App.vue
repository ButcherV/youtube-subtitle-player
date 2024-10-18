<template>
  <div id="app">
    <h1>YouTube Subtitle Player</h1>
    <input v-model="videoUrl" placeholder="输入 YouTube 视频链接" @keyup.enter="extractSubtitles">
    <button @click="extractSubtitles">提取字幕</button>
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
import { ref } from 'vue'
import axios from 'axios'
import VideoPlayer from './components/VideoPlayer.vue'
// import { parseSRT } from './utils/srtParser';
import { extractVideoId } from './utils/youtubeUtils';
// import { translateSubtitles } from './services/translationService';

// 基础 URL
const API_BASE_URL = 'http://localhost:3000'

export default {
  name: 'App',
  components: {
    VideoPlayer
  },
  setup() {
    const videoUrl = ref('')
    const subtitles = ref([])
    const meta = ref({})
    const currentVideoId = ref('')
    
    const extractSubtitles = async () => {
      if (!videoUrl.value) {
        alert('请输入 YouTube 视频链接')
        return
      }

      const videoId = extractVideoId(videoUrl.value);
      currentVideoId.value = extractVideoId(videoUrl.value);

      if (!videoId) {
        alert('无效的 YouTube 链接')
        return
      }

    // 首先检查 localStorage
    const storedData = localStorage.getItem(videoId);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.subtitles) {
          subtitles.value = parsedData.subtitles;
          meta.value = parsedData.metadata;
          console.log('从 localStorage 加载字幕数据');
          return;
        }
      } catch (error) {
        console.error('解析存储的字幕数据时出错:', error);
        // 如果解析失败，继续从服务器获取
      }
    }

      // 如果没有缓存，显示确认对话框
      const userConfirmed = await showConfirmDialog()
      if (!userConfirmed) {
        console.log('用户取消了字幕提取')
        return
      }

      try {
        console.log('正在从服务器获取字幕，URL:', videoUrl.value)
        const response = await axios.post(`${API_BASE_URL}/extract-and-translate-subtitles`, {
          videoUrl: videoUrl.value
        })
        console.log('收到响应:', response)

        if (response.data && response.data.subtitles) {
          console.log('接收到的字幕数据:', response.data.subtitles)
          // const parsedSubtitles = parseSRT(response.data.subtitles)
          // const parsedSubtitles = response.data.subtitles

          // 调用翻译服务
          // subtitles.value = await translateSubtitles(parsedSubtitles)

          // srt 数据格式化功能、翻译功能都已迁移至后端
          subtitles.value = response.data.subtitles
          meta.value = response.data.metadata
          console.log('解析和翻译后的字幕:', subtitles.value)
          localStorage.setItem(videoId, JSON.stringify(response.data))
        } else {
          throw new Error('无效的字幕数据')
        }
      } catch (error) {
        console.error('提取字幕时出错:', error)
        if (error.response) {
          console.error('响应数据:', error.response.data)
          console.error('响应状态:', error.response.status)
        }
        alert('提取字幕时出错，请检查视频链接或稍后重试')
      }
    }

    const showConfirmDialog = () => {
      return new Promise((resolve) => {
        const result = window.confirm('首次处理字幕，是否同意继续？')
        resolve(result)
      })
    }

    const handleTimeUpdate = () => {
      // 可以在这里添加额外的逻辑，如果需要的话
    }

    return {
      videoUrl,
      subtitles,
      meta,
      extractSubtitles,
      handleTimeUpdate,
      currentVideoId
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

input {
  margin-right: 10px;
  padding: 5px;
  width: 300px;
}

button {
  padding: 5px 10px;
}
</style>