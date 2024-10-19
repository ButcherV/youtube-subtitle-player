<template>
  <div class="subtitle-analysis-popup" :class="{ active: isActive }">
    <div class="popup-content">
      <button class="close-button" @click="close">×</button>
      <h3>当前字幕分析</h3>
      <p>{{ lockedSubtitleText }}</p>
      <div v-if="currentAnalysis">
        <h4>词汇</h4>
        <ul>
          <li v-for="word in currentAnalysis.words" :key="word.word">
            {{ word.word }} - {{ word.translation }} ({{ word.partOfSpeech }})
            <span v-if="word.phonetic">[{{ word.phonetic }}]</span>
          </li>
        </ul>
        <h4 v-if="currentAnalysis.phrases.length > 0">短语</h4>
        <ul v-if="currentAnalysis.phrases.length > 0">
          <li v-for="phrase in currentAnalysis.phrases" :key="phrase.phrase">
            {{ phrase.phrase }} - {{ phrase.translation }}
          </li>
        </ul>
      </div>
      <div v-else>正在加载分析结果...</div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from "vue";
import axios from "axios";

const API_BASE_URL = "http://192.168.128.179:3000";

export default {
  name: "SubtitleAnalysisPopup",
  props: {
    isActive: Boolean,
    videoId: String,
    currentSubtitleId: String,
    currentSubtitleText: String,
  },
  emits: ["close"],
  setup(props, { emit }) {
    const grammarAnalysis = ref(null);
    const lockedSubtitleText = ref('');
    const lockedSubtitleId = ref('');

    const currentAnalysis = computed(() => {
      if (grammarAnalysis.value && lockedSubtitleId.value) {
        return grammarAnalysis.value[lockedSubtitleId.value];
      }
      return null;
    });

    const getGrammarAnalysisFromLocalStorage = () => {
      const storedData = localStorage.getItem(props.videoId);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        return parsedData.grammarAnalysis || null;
      }
      return null;
    };

    const setGrammarAnalysisToLocalStorage = (data) => {
      let storedData = localStorage.getItem(props.videoId);
      if (storedData) {
        storedData = JSON.parse(storedData);
        if (!storedData.grammarAnalysis) {
          storedData.grammarAnalysis = {};
        }
      } else {
        console.error('Expected stored data not found for video:', props.videoId);
        return;
      }
      
      Object.assign(storedData.grammarAnalysis, data);
      localStorage.setItem(props.videoId, JSON.stringify(storedData));
    };

    const fetchGrammarAnalysis = async () => {
      const localData = getGrammarAnalysisFromLocalStorage();
      if (localData && localData[lockedSubtitleId.value]) {
        grammarAnalysis.value = localData;
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/analyze-grammar`, {
          text: lockedSubtitleText.value,
          subtitleId: lockedSubtitleId.value,
        });
        const newAnalysis = { [lockedSubtitleId.value]: response.data.analysis };
        grammarAnalysis.value = { ...grammarAnalysis.value, ...newAnalysis };
        setGrammarAnalysisToLocalStorage(newAnalysis);
      } catch (error) {
        console.error("Error fetching grammar analysis:", error);
      }
    };

    const updateLockedSubtitle = () => {
      if (props.currentSubtitleId !== lockedSubtitleId.value) {
        lockedSubtitleId.value = props.currentSubtitleId;
        lockedSubtitleText.value = props.currentSubtitleText;
        fetchGrammarAnalysis();
      }
    };

    watch(() => props.isActive, (newValue) => {
      if (newValue) {
        updateLockedSubtitle();
      } else {
        lockedSubtitleId.value = '';
        lockedSubtitleText.value = '';
        grammarAnalysis.value = null;
      }
    });

    const close = () => {
      emit("close");
    };

    return {
      currentAnalysis,
      lockedSubtitleText,
      close,
    };
  },
};
</script>
<style scoped>
.subtitle-analysis-popup {
  position: fixed;
  bottom: -100%;
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transition: bottom 0.3s ease-in-out;
  z-index: 1000;
}

.subtitle-analysis-popup.active {
  bottom: 0;
}

.popup-content {
  padding: 20px;
  max-height: 50vh;
  overflow-y: auto;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
</style>
