<template>
  <div class="word-list">
    <div class="header">
      <button class="back-button" @click="close">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
      <div class="header-content">
        <h2 class="header-title">{{ title }} - Memory Builder</h2>
        <div class="progress-container">
          <span class="progress-text">{{ currentIndex + 1 }} / {{ wordList.length }}</span>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <div v-if="loading" class="loading">
        <Loading />
      </div>
      <template v-else>
        <transition :name="transitionName" mode="out-in">
          <WordCard 
            v-if="currentWord"
            :word="currentWord"
            :key="currentWord._id"
            :is-expanded="isExpanded"
          />
        </transition>
        <div class="button-group">
          <button
            class="button nav-button" 
            @click="showPrevious"
            :disabled="currentIndex === 0"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" />
          </button>
          <button 
            :class="['button', 'action-button', { 'is-expanded': isExpanded }]" 
            @click="toggleExpand"
          >
            <font-awesome-icon :icon="['fas', 'eye']" />
          </button>
          <button 
            class="button plus-button" 
          >
            <font-awesome-icon icon="plus" />
          </button>
          <button 
            class="nav-button button"
            @click="showNext"
            :disabled="currentIndex === wordList.length - 1"
          >
          <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import Loading from './Loading.vue';
import WordCard from './WordCard.vue';

const API_BASE_URL = "http://192.168.128.153:3000";

export default {
  name: 'WordList',
  components: {
    Loading,
    WordCard
  },
  props: {
    type: {
      type: String,
      required: true
    }
  },
  emits: ['closed'],
  setup(props, { emit }) {
    const loading = ref(false);
    const wordList = ref([]);
    const currentIndex = ref(0);
    const isExpanded = ref(false);
    const isReverse = ref(false);
    
    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value;
    };

    const transitionName = computed(() => 
      isReverse.value ? 'slide-fade-reverse' : 'slide-fade'
    );

    const currentWord = computed(() => {
      return wordList.value[currentIndex.value];
    });

    const progressPercentage = computed(() => {
      if (wordList.value.length === 0) return 0;
      return ((currentIndex.value + 1) / wordList.value.length) * 100;
    });

    const showNext = () => {
      isExpanded.value = false;
      if (currentIndex.value < wordList.value.length - 1) {
        isReverse.value = false;
        setTimeout(() => {
          currentIndex.value++;
        }, 50);
      }
    };

    const showPrevious = () => {
      isExpanded.value = false;
      if (currentIndex.value > 0) {
        isReverse.value = true;
        setTimeout(() => {
          currentIndex.value--;
        }, 50);
      }
    };

    const title = computed(() => {
      switch(props.type) {
        case 'WORD': return 'Words';
        case 'PHRASE': return 'Phrases';
        case 'SENTENCE': return 'Sentences';
        case 'ERROR': return 'Error Book';
        default: return '';
      }
    });

    const fetchWordList = async () => {
      loading.value = true;
      try {
        let url = `${API_BASE_URL}/wordcard/list`;
        if (props.type === 'ERROR') {
          url += '?isInErrorBook=true';
        } else {
          url += `?type=${props.type}`;
        }

        const response = await axios.get(url);
        if (response.data.success) {
          wordList.value = response.data.data;
        }
      } catch (error) {
        console.error('获取列表失败:', error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchWordList();
    });

    const close = () => {
      emit('closed');
    };

    return {
      title,
      close,
      loading,
      wordList,
      currentWord,
      currentIndex,
      showNext,
      showPrevious,
      progressPercentage,
      isExpanded,
      toggleExpand,
      transitionName
    };
  }
};
</script>

<style scoped lang="scss">
.word-list {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  background: white;
  z-index: $zIndexVideoPlayer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  padding: 8px 16px;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: $purple;
  // border-bottom: 1px solid #eee;
}

.back-button {
  border: none;
  background: none;
  font-size: 16px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: white;
}

.content {
  height: calc(100% - 60px);
  width: 100%;
  padding: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.button-group {
  position: fixed;
  bottom: 12px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 0 16px;

  .button {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    background: #f1f3f5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    // color: #495057;
    font-size: 18px;
    // cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    // transition: all 0.2s;
  }
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button {
  color: #495057;

  &.is-expanded {
    color: white;
    background: $purple;
  }
}

// ---- 进度条样式 ----
.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.header-title {
  font-size: 16px;
  font-weight: 900;
  color: white;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;  // 添加这行
  height: 20px;  // 添加这行，给定一个固定高度
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: $green;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: white;
  min-width: 30px;
  text-align: left;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  // position: absolute;
  width: 100%;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

// 如果想要反向动画（点击上一个时），可以添加这些类
.slide-fade-reverse-enter-active,
.slide-fade-reverse-leave-active {
  width: 100%;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-reverse-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-fade-reverse-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>