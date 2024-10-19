<template>
  <div class="top-bar">
    <div class="left-section">
      <span class="user-name">{{ userName }}</span>
      <span class="time">{{ currentTime }}</span>
    </div>
    <div class="right-section">
      <div class="avatar-placeholder" v-if="!avatarUrl"></div>
      <img v-else :src="avatarUrl" alt="User Avatar" class="avatar" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";

export default {
  name: "TopBar",
  setup() {
    const userName = ref("Hi, xiaowei");
    const currentTime = ref("");
    const avatarUrl = ref(""); // 初始为空字符串，表示还没有头像

    const updateTime = () => {
      const now = new Date();
      currentTime.value = now.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    let timer;

    onMounted(() => {
      updateTime();
      timer = setInterval(updateTime, 60000); // 每分钟更新一次时间
    });

    onUnmounted(() => {
      clearInterval(timer); // 清除定时器
    });

    return {
      userName,
      currentTime,
      avatarUrl,
    };
  },
};
</script>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.left-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.time {
  font-size: 0.9em;
  color: #666;
}

.avatar-placeholder,
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.avatar-placeholder {
  border: 2px solid #ccc; /* 添加一个浅灰色边框 */
  background-color: #fff; /* 白色背景 */
}

.avatar {
  object-fit: cover; /* 确保图片正确填充圆形区域 */
}
</style>
