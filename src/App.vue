<template>
  <div id="app">
    <h1>YouTube Subtitle Player</h1>
    <VideoPlayer
      :videoUrl="videoUrl"
      :subtitles="subtitles"
      @timeupdate="handleTimeUpdate"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import VideoPlayer from './components/VideoPlayer.vue'

export default {
  name: 'App',
  components: {
    VideoPlayer
  },
  setup() {
    const videoUrl = ref('https://www.youtube.com/watch?v=Jd10x8LiuBc') // 替换为您的视频链接
    const subtitles = ref([])

    const parseSRT = (srtContent) => {
      const subtitles = []
      const subtitleBlocks = srtContent.trim().split('\n\n')
      
      subtitleBlocks.forEach(block => {
        const lines = block.split('\n')
        const timeLine = lines[1].split(' --> ')
        
        subtitles.push({
          start: timeToSeconds(timeLine[0]),
          end: timeToSeconds(timeLine[1]),
          text: lines.slice(2).join(' ')
        })
      })

      return subtitles
    }

    const timeToSeconds = (timeString) => {
      const [hours, minutes, seconds] = timeString.split(':')
      return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds.replace(',', '.'))
    }

    onMounted(async () => {
      try {
        // 假设您的字幕文件存储在公共文件夹中
        const response = await axios.get('/subtitles.srt')
        subtitles.value = parseSRT(response.data)
      } catch (error) {
        console.error('Error loading subtitles:', error)
      }
    })

    const handleTimeUpdate = () => {
      // 可以在这里添加额外的逻辑，如果需要的话
    }

    return {
      videoUrl,
      subtitles,
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
</style>