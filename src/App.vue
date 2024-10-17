<template>
  <div id="app">
    <h1>YouTube Subtitle Player</h1>
    <input v-model="videoUrl" placeholder="输入 YouTube 视频链接" @keyup.enter="extractSubtitles">
    <button @click="extractSubtitles">提取字幕</button>
    <VideoPlayer
      v-if="subtitles.length"
      :videoUrl="videoUrl"
      :subtitles="subtitles"
      @timeupdate="handleTimeUpdate"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import VideoPlayer from './components/VideoPlayer.vue'
import { parseSRT } from './utils/srtParser';

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

    const extractSubtitles = async () => {
      if (!videoUrl.value) {
        alert('请输入 YouTube 视频链接')
        return
      }

      try {
        console.log('正在发送请求，URL:', videoUrl.value)
        const response = await axios.post(`${API_BASE_URL}/extract-subtitles`, {
          videoUrl: videoUrl.value
        })
        console.log('收到响应:', response)

        if (response.data && response.data.subtitles) {
          console.log('接收到的字幕数据:', response.data.subtitles)
          subtitles.value = parseSRT(response.data.subtitles)
          console.log('Parsed subtitles:', subtitles.value)
          localStorage.setItem(videoUrl.value, JSON.stringify(subtitles.value))
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

    const handleTimeUpdate = () => {
      // 可以在这里添加额外的逻辑，如果需要的话
    }

    return {
      videoUrl,
      subtitles,
      extractSubtitles,
      handleTimeUpdate
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