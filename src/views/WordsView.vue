<template>
  <div class="container">
    <div class="cards">
      <div class="card is-word" @click="openList('WORD')">
        <div class="card-content">
          <div class="card-text">
            <h3 class="card-text-title">WORDS</h3>
            <p class="card-text-number">{{ stats.words || 0 }} {{ stats.words === 1 ? 'Word' : 'Words' }}</p>
          </div>
          <div class="card-logo"></div>
        </div>
      </div>

      <div class="card is-phrase" @click="openList('PHRASE')">
        <div class="card-content">
          <div class="card-text">
            <h3 class="card-text-title">PHRASES</h3>
            <p class="card-text-number">{{ stats.phrases || 0 }} {{ stats.phrases === 1 ? 'Phrase' : 'Phrases' }}</p>
          </div>
          <div class="card-logo"></div>
        </div>
      </div>

      <div class="card is-sentence" @click="openList('SENTENCE')">
        <div class="card-content">
          <div class="card-text">
            <h3 class="card-text-title">SENTENCES</h3>
            <p class="card-text-number">{{ stats.sentences || 0 }} {{ stats.sentences === 1 ? 'Sentence' : 'Sentences' }}</p>
          </div>
          <div class="card-logo"></div>
        </div>
      </div>

      <div class="card is-error" @click="openList('ERROR')">
        <div class="card-content">
          <div class="card-text">
            <h3 class="card-text-title">REVIEW LIST</h3>
            <p class="card-text-number">{{ stats.errorBook || 0 }} {{ stats.errorBook === 1 ? 'Item' : 'Items' }}</p>
          </div>
          <div class="card-logo"></div>
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <Transition name="slide-left">
      <WordList
        v-if="listVisible"
        :type="currentType"
        @closed="handleClosed"
      />
    </Transition>
  </Teleport>  
</template>

<script>
import { ref, onMounted, getCurrentInstance } from 'vue';
import WordList from '../components/WordList.vue';
import axios from 'axios';
import { API } from '@/constants';

export default {
  name: 'WordsView',
  components: {
    WordList
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const listVisible = ref(false);
    const currentType = ref('');
    const stats = ref({
      words: 0,
      phrases: 0,
      sentences: 0,
      errorBook: 0
    });

    const openList = (type) => {
      const count = {
        'WORD': stats.value.words,
        'PHRASE': stats.value.phrases,
        'SENTENCE': stats.value.sentences,
        'ERROR': stats.value.errorBook
      }[type];

      if (!count) {
        proxy.$message.info('暂无内容');
        return;
      }

      currentType.value = type;
      listVisible.value = true;
    };

    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API.BASE_URL}/wordcard/stats`);
        if (response.data.success) {
          stats.value = response.data.data;
        }
      } catch (error) {
        proxy.$message.error('获取统计数据失败');
      }
    };

    const handleClosed = () => {
      listVisible.value = false;
      fetchStats();
    };

    onMounted(() => {
      fetchStats();
    });

    return {
      stats,
      listVisible,
      currentType,
      openList,
      fetchStats,
      handleClosed
    };
  }
};
</script>

<style scoped lang="scss">
.container {
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  box-sizing: border-box;
}

.card {
  width: calc(50% - 8px);
  border-radius: 8px;
  
  &.is-error { 
    background: #e0fedd; 
    height: calc((100% - 16px) * 0.45);

    .card-logo {
      background-image: url('../assets/images/favorite-plus.png');
    }
  }

  &.is-sentence { 
    background: #dedaff;
    height: calc((100% - 16px) * 0.55);

    .card-logo {
      background-image: url('../assets/images/filter.png');
    }
  }

  &.is-phrase { 
    background: #fde3f1; 
    height: calc((100% - 16px) * 0.55);

    .card-logo {
      background-image: url('../assets/images/crossword.png');
    }
  }

  &.is-word {
    background: #fde6e1;
    height: calc((100% - 16px) * 0.45);

    .card-logo {
      background-image: url('../assets/images/abc.png');
    }
  }
}

.card-text-title {
  font-size: 16px;
  font-weight: 900;
  color: #333;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.card-text-number {
  font-size: 16px;
  color: #666;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.card-logo {
  width: 100%;
  height: 100px;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  margin: 8px 0;
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
</style>