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
        />
        <button class="info-card-add-button" @click="addVideoToHistory(userInputUrl)">
          <font-awesome-icon icon="plus" />
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
import { ref, inject, getCurrentInstance, computed, onMounted, watch } from "vue";
import axios from "axios";
import VideoPlayer from "../components/VideoPlayer.vue";
import { extractVideoId } from "../utils/youtubeUtils";
import VideoList from '@/components/VideoList.vue';
import { SUCCESS_KEYS, ERROR_KEYS, getSuccessMessage, getErrorMessage } from '@/constants/errorKeys';

const API_BASE_URL = "http://192.168.128.179:3000";

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
    const auth = inject('auth');
    const { proxy } = getCurrentInstance();

    const isLoggedIn = computed(() => auth.isLoggedIn.value);

    const historyItems = ref([
      // { 
      //   title: 'Scent of a Woman | "I\'ll Show You Out of Order!"', 
      //   coverAddress: 'https://img.youtube.com/vi/Jd10x8LiuBc/sddefault.jpg',
      //   duration: '05:38',
      //   videoUrl: 'https://www.youtube.com/watch?v=Jd10x8LiuBc',
      //   videoPlatform: 'youtube'
      // },
    ]);

    const addVideoToHistory = async (url) => {
      if (!isLoggedIn.value) {
        auth.showAuthModal();
        return;
      }

      const videoId = extractVideoId(url);
      if (!videoId) {
        proxy.$message.error("无效的 YouTube 链接");
        return;
      }

      const newItem = {
        id: videoId,
        url: url,
        title: "加载中...",
        coverAddress: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
        duration: "加载中",
        status: "loading"
      };
      
      historyItems.value.unshift(newItem);

      try {
        const response = await axios.post(`${API_BASE_URL}/process-video`, { videoUrl: url });
        
        if (response.data && response.data.meta && response.data.subtitle) {
          const { meta, subtitle } = response.data;
          
          // 更新历史记录项
          updateHistoryItem(videoId, {
            title: meta.title,
            duration: meta.duration,
            status: "ready"
          });

          // 存储完整的视频数据到 localStorage
          localStorage.setItem(videoId, JSON.stringify({ meta, subtitle }));
        } else {
          throw new Error("处理视频失败：返回数据格式不正确");
        }
      } catch (error) {
        console.error("处理视频时出错:", error);
        updateHistoryItem(videoId, { status: "error" });
        proxy.$message.error("处理视频失败，请稍后重试");
      }
    };

    const updateHistoryItem = (videoId, updates) => {
      const index = historyItems.value.findIndex(item => item.id === videoId);
      if (index !== -1) {
        historyItems.value[index] = { ...historyItems.value[index], ...updates };
      }
    };

    const closeVideoPlayer = () => {
      showVideoPlayer.value = false;
    };

    const handleLogout = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/logout`);
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
          const response = await axios.get(`${API_BASE_URL}/user/profile`);
          userProfile.value = response.data.user;
        } catch (error) {
          const errorMessage = error.response?.data?.error
          proxy.$message.error(getErrorMessage(errorMessage));
        }
      }
    };

    onMounted(() => {
      fetchUserProfile();
    });

    watch(() => auth.isLoggedIn.value, (newValue) => {
      if (newValue) {
        fetchUserProfile();
      } else {
        userProfile.value = {};
      }
    });

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