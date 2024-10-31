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
          <p class="info-card-subtitle">本日视频引入时长：13 分</p>
          <p class="info-card-subtitle">本月时长配额：2 小时 23 分 / 5 小时</p>
        </div>
      </div>
      <div class="info-card-input-group">
        <input
          class="info-card-input"
          v-model="userInputUrl"
          placeholder="输入 YouTube 视频链接"
        />
        <button class="info-card-add-button">
          <font-awesome-icon icon="plus" />
        </button>
      </div>
    </div>
    <div class="card-wrapper">
      <div class="card-info">
        <p class="card-info-title">#History</p>
      </div>
      <VideoList
        :items="carouselItems"
        @itemClick="handleCardClick"
      />
    </div>
    <Teleport to="body">
      <Transition name="slide-left">
        <VideoPlayer
          v-if="showVideoPlayer"
          :videoUrl="currentVideoUrl"
        >
        </VideoPlayer>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance,computed, inject } from "vue";
import axios from "axios";
import { SUCCESS_KEYS, ERROR_KEYS, getSuccessMessage, getErrorMessage } from '@/constants/errorKeys';
import VideoList from '@/components/VideoList.vue';

const API_BASE_URL = "http://192.168.128.153:3000";

export default {
  name: "VideoView",
  components: {
    VideoList
  },
  setup() {
    const userProfile = ref({});
    const userInputUrl = ref("");
    const { proxy } = getCurrentInstance();
    const auth = inject('auth');
    const showVideoPlayer = ref(false);
    const isLoggedIn = computed(() => auth.isLoggedIn.value);

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

    onMounted(() => {
      fetchUserProfile();
    });

    return {
      userProfile,
      isLoggedIn,
      handleLogout,
      userInputUrl,
      carouselItems,
      showVideoPlayer,
    }
  }
}
</script>

<style lang="scss" scoped>
.video-view-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>