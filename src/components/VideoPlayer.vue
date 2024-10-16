<template>
    <div class="video-player">
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
      <div class="custom-controls">
        <button @click="togglePlay">{{ isPlaying ? '暂停' : '播放' }}</button>
        <input
          type="range"
          v-model="currentTime"
          :max="duration"
          @input="seek"
        />
        <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>
      <div class="subtitles-container" ref="subtitlesContainer">
        <div
          v-for="(subtitle, index) in subtitles"
          :key="index"
          :class="{ subtitle: true, active: isSubtitleActive(subtitle) }"
          @click="seekToSubtitle(subtitle)"
        >
          {{ subtitle.text }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  /* global YT */
  import { ref, computed, onMounted, watch } from 'vue'
  import { parseSRT } from '../utils/srtParser'
  
  // 导入 SRT 文件
  import subtitlesFile from '!raw-loader!../assets/scripts/subtitles.srt'
  
  export default {
    name: 'VideoPlayer',
    props: {
      videoUrl: {
        type: String,
        required: true
      }
    },
    setup(props) {
      const videoFrame = ref(null)
      const subtitlesContainer = ref(null)
      const player = ref(null)
      const isPlaying = ref(false)
      const currentTime = ref(0)
      const duration = ref(0)
      const subtitles = ref([])
  
      const embedUrl = computed(() => {
        const videoId = props.videoUrl.split('v=')[1]
        return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&showinfo=0&rel=0&cc_load_policy=0&disablekb=1`
        })
  
      const isSubtitleActive = (subtitle) => {
        return currentTime.value >= subtitle.start && currentTime.value < subtitle.end
      }
  
      const seekToSubtitle = (subtitle) => {
        if (player.value) {
          player.value.seekTo(subtitle.start)
        }
      }
  
      const togglePlay = () => {
        if (player.value) {
          if (isPlaying.value) {
            player.value.pauseVideo()
          } else {
            player.value.playVideo()
          }
        }
      }
  
      const seek = () => {
        if (player.value) {
          player.value.seekTo(currentTime.value)
        }
      }
  
      const formatTime = (time) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
  
      onMounted(() => {
        // 解析 SRT 文件
        subtitles.value = parseSRT(subtitlesFile)
  
        // 加载 YouTube IFrame API
        const tag = document.createElement('script')
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
  
        window.onYouTubeIframeAPIReady = () => {
            player.value = new YT.Player(videoFrame.value, {
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                },
                playerVars: {
                    controls: 0,
                    showinfo: 0,
                    rel: 0,
                    cc_load_policy: 0,
                    disablekb: 1
                }
            })
        }
      })
  
      const onPlayerReady = (event) => {
        duration.value = event.target.getDuration()
      }
  
      const onPlayerStateChange = (event) => {
        isPlaying.value = event.data === YT.PlayerState.PLAYING
      }
  
      watch(isPlaying, (newValue) => {
        if (newValue) {
          const interval = setInterval(() => {
            if (player.value) {
              currentTime.value = player.value.getCurrentTime()
            }
          }, 1000)
          return () => clearInterval(interval)
        }
      })
  
      watch(currentTime, () => {
        const activeSubtitle = subtitles.value.find(isSubtitleActive)
        if (activeSubtitle) {
          const subtitleElement = subtitlesContainer.value.children[subtitles.value.indexOf(activeSubtitle)]
          subtitleElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
  
      return {
        videoFrame,
        subtitlesContainer,
        embedUrl,
        isPlaying,
        currentTime,
        duration,
        subtitles,
        isSubtitleActive,
        seekToSubtitle,
        togglePlay,
        seek,
        formatTime
      }
    }
  }
  </script>
  
  <style scoped>
  /* 样式保持不变 */
  </style>