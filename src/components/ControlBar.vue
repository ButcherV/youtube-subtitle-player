<template>
  <div class="control-bar-container">
    <div class="custom-controls">
      <button @click="handleTogglePlay">
        {{ isPlaying ? "暂停" : "播放" }}
      </button>
      <input
        type="range"
        :value="currentTime"
        :max="duration"
        @input="$emit('seek', $event.target.value)"
      />
      <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      <button @click="toggleLoopAndShowText">
        {{ isLooping ? "停止循环" : "循环当前" }}
      </button>
    </div>
    <transition name="fade">
      <div v-if="showLoopText" class="loop-text-container">
        <p v-html="analyzedText"></p>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import nlp from 'compromise';

// 常用词列表
const commonWords = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'can', 'just', 'don', 'should', 'now', 'then', 'here', 'where', 'when', 'why',
  'all', 'any', 'some', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'please', 'thank', 'you', 'your', 'youre', 'my', 'mine', 'ours', 'ourselves', 'theirs', 'themselves', 'ourselves',
  'this', 'that', 'these', 'those', 'my', 'mine', 'your', 'yours', 'our', 'ours', 'their', 'theirs', 'its', 'its',
  'from', 'into', 'during', 'including', 'until', 'against', 'among', 'throughout', 'despite', 'upon', 'of', 'at', 'by', 'in', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
]);

export default {
  name: "ControlBar",
  props: {
    isPlaying: {
      type: Boolean,
      required: true,
    },
    currentTime: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isLooping: {
      type: Boolean,
      required: true,
    },
    currentSubtitleText: {
      type: String,
      default: '',
    },
  },
  emits: ["toggle-play", "seek", "toggle-loop"],
  setup(props, { emit }) {
    const showLoopText = ref(false);
    const currentLoopText = ref('');

    const handleTogglePlay = () => {
      console.log("Toggle play button clicked");
      emit('toggle-play');
    };

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const analyzeText = (text) => {
      const doc = nlp(text);
      
      // 识别短语（包括动词短语和其他常见短语）
      const phrases = doc.match([
        '#Verb #Particle',
        '#Adjective #Noun',
        '#Verb to #Verb',
        '#Phrasal'
      ]).out('array');
      
      // 识别生僻词
      const words = doc.terms().out('array');
      const rareWords = words.filter(word => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        return !commonWords.has(cleanWord) && cleanWord.length > 2;
      });
      
      // 高亮处理
      let highlightedText = text;
      
      // 先处理短语，避免被单词处理覆盖
      phrases.forEach(phrase => {
        const safePhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${safePhrase}\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, `<span class="highlight-phrase">$&</span>`);
      });
      
      // 然后处理生僻词
      rareWords.forEach(word => {
        const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${safeWord}\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, `<span class="highlight-rare">$&</span>`);
      });
      
      return highlightedText;
    };

    const analyzedText = computed(() => {
      return analyzeText(currentLoopText.value);
    });

    const toggleLoopAndShowText = () => {
      emit('toggle-loop');
      if (!props.isLooping) {
        currentLoopText.value = props.currentSubtitleText;
        showLoopText.value = true;
      } else {
        showLoopText.value = false;
      }
    };

    return {
      formatTime,
      showLoopText,
      currentLoopText,
      toggleLoopAndShowText,
      analyzedText,
      handleTogglePlay
    };
  },
};
</script>

<style scoped>
.control-bar-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.custom-controls {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.custom-controls input[type="range"] {
  flex-grow: 1;
  margin: 0 10px;
}

.custom-controls button {
  margin-left: 10px;
}

.loop-text-container {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  text-align: center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}


:deep(.highlight-phrase) {
  background-color: yellow;
  font-weight: bold;
}

:deep(.highlight-rare) {
  background-color: lightgreen;
  font-style: italic;
}
</style> 