<template>
  <div class="video-view-container">
    <div class="info-card">
      <div>
        <div class="info-card-title-wrapper">
          <p class="info-card-title">Hi, {{ userProfile.username || 'Guest' }}</p>
          <font-awesome-icon
            v-if="isLoggedIn"
            :icon="['fas', 'right-from-bracket']" 
            @click="handleLogout" 
            class="log-btn"
          />
          <font-awesome-icon
            v-else
            :icon="['fas', 'fa-right-to-bracket']" 
            @click="auth.showAuthModal" 
            class="log-btn"
          />
        </div>
        <p class="info-card-subtitle">本日视频引入时长：13 分</p>
        <p class="info-card-subtitle">本月时长配额：2 小时 23 分 / 5 小时</p>
      </div>
      <div class="info-card-input-group">
        <input
          class="info-card-input"
          v-model="userInputUrl"
          placeholder="输入 YouTube 视频链接"
          :disabled="isChecking"
        />
        <button 
          class="info-card-add-button" 
          @click="addVideoToHistory(userInputUrl)"
          :disabled="isChecking"
        >
          <font-awesome-icon v-if="!isChecking" icon="plus" />
          <font-awesome-icon v-else icon="spinner" class="fa-spin" />
        </button>
      </div>
    </div>
    <div class="card-wrapper">
      <div class="card-info">
        <p class="card-info-title">#History</p>
      </div>
      <VideoList
        :items="historyItems"
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
          :onClose="closeVideoPlayer"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { ref, inject, getCurrentInstance, computed, onMounted, onUnmounted, watch } from "vue";
import axios from "axios";
import VideoPlayer from "../components/VideoPlayer.vue";
import { extractVideoId, normalizeYoutubeUrl } from "../utils/youtubeUtils";
import VideoList from '@/components/VideoList.vue';
import { SUCCESS_KEYS, ERROR_KEYS, getSuccessMessage, getErrorMessage } from '@/constants';

import { API } from '@/constants';

export default {
  name: "VideoView",
  components: {
    VideoPlayer,
    VideoList
  },
  setup() {
    const userInputUrl = ref("");
    const userProfile = ref({});
    const currentVideoUrl = ref("");
    const subtitles = ref([]);
    const meta = ref({});
    const currentVideoId = ref("");
    const showVideoPlayer = ref(false);
    const isChecking = ref(false);
    const auth = inject('auth');
    const { proxy } = getCurrentInstance();

    const isLoggedIn = computed(() => auth.isLoggedIn.value);

    const historyItems = ref([
      // { 
      //   title: 'Scent of a Woman | "I\'ll Show You Out of Order!"', 
      //   coverAddress: 'https://img.youtube.com/vi/Jd10x8LiuBc/mqdefault.jpg',
      //   duration: '05:38',
      //   videoUrl: 'https://www.youtube.com/watch?v=Jd10x8LiuBc',
      // },
    ]);

    // 前端基本检查
    const checkVideoFrontend = (url) => {
      // 基础参数验证
      if (!url?.trim()) {
        proxy.$message.error("请输入视频链接");
        return false;
      }
      // 提取并验证视频 ID
      const videoId = extractVideoId(url);
      if (!videoId) {
        proxy.$message.error("无效的 YouTube 链接");
        return false;
      }

      // 检查是否重复
      const isDuplicate = historyItems.value.some(item => item.id === videoId);
      if (isDuplicate) {
        proxy.$message.warning("该视频已经添加过了");
        return false;
      }

      return videoId;
    };

    // 检查是否需要轮询的函数
    const checkAndStartPolling = (videoId, subtitles) => {
      const hasUnTranslatedSubtitles = subtitles.some(sub => !sub.translatedText);
      if (hasUnTranslatedSubtitles) {
        pollVideoStatus(videoId);
      }
    };

    // 后端详细检查（除了是否是英语视频判断）
    const checkVideoBackend = async (videoId, url) => {
      try {
        const response = await axios.post(`${API.BASE_URL}/video/check-video`, {
          videoId,
          url
        });
        
        return {
          success: true,
          data: response.data.data
        };
      } catch (error) {
        const errorMessage = error.response?.data?.message || "视频检查失败";
        proxy.$message.error(errorMessage);
        return {
          success: false
        };
      }
    };

    // 添加视频到列表
    const addVideoToHistoryList = (videoId) => {
      historyItems.value.unshift({
        id: videoId,
        title: "",
        coverAddress: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        duration: 0,
        status: "loading"
      });
    };

    // 处理视频添加成功
    const handleVideoSuccess = (videoId, data) => {
      const { meta, subtitles, status } = data;
      const index = historyItems.value.findIndex(item => item.id === videoId);
      
      if (index !== -1) {
        // 检查是否有已翻译的字幕
        const hasTranslatedSubtitles = subtitles.some(sub => sub.translatedText);
        
        historyItems.value[index] = {
          id: videoId,
          title: meta.videoTitle,
          coverAddress: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          duration: meta.videoDuration,
          // 如果有已翻译的字幕，就显示 ready，否则保持 processing
          status: hasTranslatedSubtitles ? 'ready' : 'processing'
        };
      }

      localStorage.setItem(videoId, JSON.stringify({ meta, subtitles, status }));
    };

    // 修改 pollVideoStatus 函数，将定时器存储到 Map 中
    const pollIntervals = new Map();
    const pollVideoStatus = async (videoId) => {
      // 如果已经存在轮询，先清除
      if (pollIntervals.has(videoId)) {
        clearInterval(pollIntervals.get(videoId));
      }

      const pollInterval = setInterval(async () => {
        try {
          const response = await axios.post(`${API.BASE_URL}/process-video`, { videoId });
          const { meta, subtitles: newSubtitles } = response.data;
          const status = response.data.status || 'processing';
          
          // 更新本地存储
          localStorage.setItem(videoId, JSON.stringify({ meta, newSubtitles, status }));

          // 如果状态是完成或出错，停止轮询
          if (status === 'completed' || status === 'error') {
            clearInterval(pollInterval);
            pollIntervals.delete(videoId);
            return;
          }
              
          // 检查是否有已翻译的字幕
          const hasTranslatedSubtitles = newSubtitles.some(sub => sub.translatedText);
          
          // 更新列表项状态：如果有已翻译字幕，就保持 ready 状态
          const index = historyItems.value.findIndex(item => item.id === videoId);
          if (index !== -1) {
            historyItems.value[index].status = hasTranslatedSubtitles ? 'ready' : 'processing';
          }

          console.log('Poll got new subtitles:', subtitles);
      
          if (currentVideoId.value === videoId) {
            console.log('Updating subtitles.value');
            // subtitles.value = subtitles;
            subtitles.value = [...newSubtitles];
          }

          // 如果全部翻译完成或出错，停止轮询
          if (status === 'completed' || status === 'error') {
            clearInterval(pollInterval);
            pollIntervals.delete(videoId);
          }
        } catch (error) {
          console.error('轮询出错:', error);
          clearInterval(pollInterval);
          pollIntervals.delete(videoId);
        }
      }, 3000);

      // 存储定时器
      pollIntervals.set(videoId, pollInterval);
    };

    // 添加组件卸载时的清理函数
    onUnmounted(() => {
      // 清理所有轮询定时器
      pollIntervals.forEach(interval => clearInterval(interval));
      pollIntervals.clear();
    });

    // 处理视频添加失败
    const handleVideoError = (videoId, error) => {
      console.error("处理视频失败:", error);

      // 无论任何报错（包括语言非英语、whisper 调用过程中的任何问题）都直接从列表中移除
      historyItems.value = historyItems.value.filter(item => item.id !== videoId);
      
      const errorMessage = error.response?.data?.message || "处理视频失败，请重新尝试";
      proxy.$message.error(errorMessage);
      
      // const index = historyItems.value.findIndex(item => item.id === videoId);
      // if (index !== -1) {
      //   // 如果是语言检查错误，直接从列表中移除
      //   if (error.response?.data?.message?.includes('VIDEO_LANGUAGE_ERROR')) {
      //     historyItems.value = historyItems.value.filter(item => item.id !== videoId);
      //     // 显示具体的语言检查错误信息
      //     proxy.$message.error(error.response.data.message);
      //   } else {
      //     // 其他错误则标记为错误状态
      //     historyItems.value[index].status = "error";
      //     const errorMessage = error.response?.data?.message || "处理视频失败，请稍后重试";
      //     proxy.$message.error(errorMessage);
      //   }
      // }
    };

    // 主函数
    const addVideoToHistory = async (url) => {
      // 登录检查
      if (!isLoggedIn.value) {
        auth.showAuthModal();
        return false;
      }

      // 已登录，但没输入 url
      if (!url?.trim()) {
        proxy.$message.error("请输入视频链接");
        return false;
      }

      const normalizedUrl = normalizeYoutubeUrl(url);
      // 前端基础检查
      const videoId = checkVideoFrontend(normalizedUrl);
      if (!videoId) {
        userInputUrl.value = ""; // 清空输入框
        return;
      }

      // 开始检查，设置加载状态
      isChecking.value = true;
      console.log("isChecking", isChecking.value);

      try {
        // 后端详细检查（除了是否是英语视频判断）
        const checkResult = await checkVideoBackend(videoId, normalizedUrl);
        if (!checkResult.success) {
          userInputUrl.value = ""; // 清空输入框
          return;
        }

        addVideoToHistoryList(videoId);
        userInputUrl.value = ""; // 清空输入框
        
        const response = await axios.post(`${API.BASE_URL}/process-video`, { 
          videoUrl: normalizedUrl,
          videoId
        });

        if (response.data && response.data.meta) {
          handleVideoSuccess(videoId, response.data);
          // 如果状态是 processing，开始轮询
          if (response.data.status === 'processing') {
            pollVideoStatus(videoId);
          }
        }
      } catch (error) {
        handleVideoError(videoId, error);
      } finally {
        // 无论成功失败，都结束加载状态
        isChecking.value = false;
      }
    };

    const fetchHistoryList = async () => {
      try {
        const response = await axios.post(`${API.BASE_URL}/process-video`);
        // 处理返回的完整数据
        historyItems.value = response.data.map(item => {
          // 保存完整数据到 localStorage
          localStorage.setItem(item.videoId, JSON.stringify({
            meta: item.data.meta,
            subtitles: item.data.subtitles,
            status: item.status || 'completed'  // 如果没有 status，默认为 completed
          }));

          // 返回列表项数据
          return {
            id: item.videoId,
            title: item.data.meta.videoTitle,
            coverAddress: `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`,
            duration: item.data.meta.videoDuration,
            status: 'ready'  // 历史数据都是已完成的
          };
        });

        // 不需要对历史数据启动轮询
      } catch (error) {
        console.error('获取历史记录失败:', error);
        const errorMessage = error.response?.data?.message || "获取历史记录失败";
        proxy.$message.error(errorMessage);
      }
    };

    // 在用户登录后获取历史列表
    watch(() => auth.isLoggedIn.value, (newValue) => {
      if (newValue) {
        fetchUserProfile();
        fetchHistoryList();
      } else {
        userProfile.value = {};
        historyItems.value = []; // 清空历史列表
      }
    });

    // 组件挂载时，如果用户已登录，获取历史列表
    onMounted(() => {
      if (isLoggedIn.value) {
        fetchUserProfile();
        fetchHistoryList();
      }
    });

    const closeVideoPlayer = () => {
      showVideoPlayer.value = false;
    };

    const handleLogout = async () => {
      try {
        const response = await axios.post(`${API.BASE_URL}/auth/logout`);
        if (response.data.success === SUCCESS_KEYS.LOGOUT_SUCCESS) {
          auth.logout();
          userProfile.value = {};
          proxy.$message.success(getSuccessMessage(SUCCESS_KEYS.LOGOUT_SUCCESS));
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error
          ? getErrorMessage(error.response.data.error)
          : getErrorMessage(ERROR_KEYS.LOGOUT_FAILED);
        proxy.$message.error(errorMessage);
      }
    };

    const fetchUserProfile = async () => {
      if (isLoggedIn.value) {
        try {
          const response = await axios.get(`${API.BASE_URL}/user/profile`);
          userProfile.value = response.data.user;
        } catch (error) {
          const errorMessage = error.response?.data?.error
          proxy.$message.error(getErrorMessage(errorMessage));
        }
      }
    };

    const handleCardClick = (item) => {
      // 从 localStorage 获取完整数据
      const fullData = JSON.parse(localStorage.getItem(item.id));
      if (!fullData) {
        proxy.$message.error("视频数据不完整，请重试");
        return;
      }

      // 设置播放器所需的数据
      currentVideoId.value = item.id;
      currentVideoUrl.value = `https://www.youtube.com/watch?v=${item.id}`;
      meta.value = fullData.meta;
      subtitles.value = fullData.subtitles;  // 这里的 subtitles 可能部分翻译完成，部分未完成
      showVideoPlayer.value = true;

      checkAndStartPolling(item.id, fullData.subtitles);
    };

    return {
      userInputUrl,
      currentVideoUrl,
      subtitles,
      meta,
      currentVideoId,
      historyItems,
      handleCardClick,
      showVideoPlayer,
      closeVideoPlayer,
      handleLogout,
      auth,
      isLoggedIn,
      userProfile,
      addVideoToHistory,
      isChecking,
      pollVideoStatus
      // isListView,
      // toggleListView,
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
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  // box-shadow: 
  //   0 4px 6px rgba(0, 0, 0, 0.1),
  //   0 1px 3px rgba(0, 0, 0, 0.08),
  //   0 8px 15px rgba(0, 0, 0, 0.05);
  position: relative;

  &::before {
    content: "";
    width: 30px;
    height: 30px;
    background-color: $green;
    position: absolute;
    bottom: -15px;
    right: 0;
  }
}

.info-card-input-group {
  display: flex;
  margin-top: 16px;
}

.info-card-input {
  flex-grow: 1;
  width: 300px;
  padding: 0 8px;
  border: 4px solid white;
  border-radius: 8px 0 0 8px;
  background-color: $green;
  color: white;
  font-size: 12px;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
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

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
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
  border-top-right-radius: 18px;
  background-color: $purple;
  padding: 12px 16px;
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

.log-btn {
  color: white;
  font-size: 24px;
}

.info-card-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

</style>