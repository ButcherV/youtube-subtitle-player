<template>
  <teleport to="body">
    <div class="popup-overlay" :class="{ active: isActive }" @click="close">
      <div class="subtitle-analysis-popup" :class="{ active: isActive }" @click.stop>
        <div class="popup-content">
          <button class="close-button" @click="close">
            <font-awesome-icon :icon="['fas', 'xmark']" />
          </button>
          <div class="main-text-wrapper">
            <p 
              class="main-text" 
              ref="textRef"
              contenteditable="false"
              @blur="handleBlur"
            >{{ currentSubtitle }}</p>
            <div class="button-group">
              <button class="icon-button">
                <font-awesome-icon icon="plus" />
              </button>
              <button 
                class="icon-button" 
                @click="handleAnalyzeGrammar"
                :disabled="!hasSelectedText"
                :class="{ 'is-disabled': !hasSelectedText }"
              >
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                <p class="icon-text">语法分析</p>
              </button>
              <button 
                class="icon-button"
                :disabled="!grammarAnalysis"
                :class="{ 'is-disabled': !grammarAnalysis }"
              >
                <font-awesome-icon icon="plus" />
                <p class="icon-text">收藏</p>
              </button>
              <button class="icon-button">
                <font-awesome-icon icon="plus" />
              </button>
            </div>
          </div>
          <div class="main-grammer-wrapper">
            <div v-if="grammarAnalysis" class="grammar-result">
              {{ grammarAnalysis }}
            </div>
            <div v-else-if="isAnalyzing" class="analyzing">
              <Loading color="#666" :duration="0.8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from "vue";
import { cleanText } from "../utils/helper"; 
import axios from 'axios';
import Loading from './Loading.vue'; 
const API_BASE_URL = "http://192.168.128.153:3000";

export default {
  name: "SubtitleAnalysisPopup",
  components: {
    Loading
  },
  props: {
    isActive: Boolean,
    subtitle: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  emits: ["close"],
  setup(props, { emit }) {
    const currentAnalyzingSubtitle = ref(null);
    const textRef = ref(null);
    const grammarAnalysis = ref(null);
    const isAnalyzing = ref(false);
    const hasSelectedText = ref(false);

    // 保存选中的文本。不能在调用方法时再保存。
    // 否则因为调用方法本身就会失焦，会出现选中的文本为空的情况
    const currentSelectedText = ref('');

    watch(() => props.isActive, (newValue) => {
      if (newValue) {
        currentAnalyzingSubtitle.value = cleanText(props.subtitle.originText);
        nextTick(() => {
          if (textRef.value) {
            textRef.value.focus();
            const range = document.createRange();
            range.selectNodeContents(textRef.value);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            // 初始化时，保存选中的文本
            const selectedText = selection.toString().trim();
            hasSelectedText.value = selectedText.length > 0;
            currentSelectedText.value = selectedText;
            
            textRef.value.blur();

            // 自动触发语法分析
            handleAnalyzeGrammar();
          } else {
            grammarAnalysis.value = null;
            isAnalyzing.value = false;
          }
        });
      }
    });

    onMounted(() => {
      document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        hasSelectedText.value = text.length > 0;
        currentSelectedText.value = text;
      });
    });

    onUnmounted(() => {
      document.removeEventListener('selectionchange', () => {
        const selection = window.getSelection();
        hasSelectedText.value = selection.toString().trim().length > 0;
      });
    });

    const handleBlur = () => {
      if (textRef.value) {
        textRef.value.blur();
      }
    };

    const close = () => {
      const selection = window.getSelection();
      selection.removeAllRanges();
      emit("close");
    };

    const handleAnalyzeGrammar = async () => {
      const textToAnalyze = cleanText(currentSelectedText.value);  // 使用保存的文本

      if (!textToAnalyze) {
        console.warn('没有要分析的文本');
        return;
      }

      isAnalyzing.value = true;
      grammarAnalysis.value = null;

      try {
        const response = await axios.post(`${API_BASE_URL}/grammar/analyze`, {
          text: textToAnalyze,
          context: props.subtitle?.context || ''
        });
        
        grammarAnalysis.value = response.data;
      } catch (error) {
        console.error('语法分析失败:', error);
      } finally {
        isAnalyzing.value = false;
      }
    };
    
    return { 
      close,
      currentSubtitle: computed(() => currentAnalyzingSubtitle.value),
      textRef,
      handleBlur,
      handleAnalyzeGrammar,
      grammarAnalysis,
      isAnalyzing,
      hasSelectedText
    };
  }
};
</script>

<style scoped lang="scss">
/* 禁用所有元素的文本选择 */
* {
  user-select: none;
  -webkit-user-select: none;
}

// 只允许 main-text 可选
.main-text {
  user-select: text !important;  // 使用 !important 确保覆盖
  -webkit-user-select: text !important;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: $zIndexSubtitleAnalysisPopup;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-in-out;

  &.active {
    opacity: 1;
    visibility: visible;
  }
}

.subtitle-analysis-popup {
  position: fixed;
  bottom: -100%;
  left: 0;
  width: 100%;
  height: 80vh;
  border-radius: 16px 16px 0 0;
  transition: bottom 0.3s ease-in-out;
  z-index: $zIndexSubtitleAnalysisPopup + 1;
  background-color: white;

  &.active {
    bottom: 0;
  }
}

.popup-content {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1;
}

.main-text-wrapper {
  padding: 40px 16px 16px 16px;
  border-radius: 16px 16px 0px 16px;
  background-color: $green;
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

.main-grammer-wrapper {
  background-color: white;
  border-top-right-radius: 16px;
  z-index: 1;
  flex: 1;
}

.main-text {
  width: 80%;
  margin: 0 auto;
  font-size: 24px;
  line-height: 1.2;
  color: white;
  font-weight: 900;
  user-select: text;
  -webkit-user-select: text;
  outline: none;

  &::selection {
    background-color: rgba(255, 255, 255, 0.3) !important;
    color: #FFD700 !important;
  }
}

.button-group {
  display: flex;
  justify-content: space-around;
  margin-top: 24px;
}

.icon-button {
  background-color: rgba(0, 0, 0, 0.1);
  border: none;
  font-size: 18px;
  color: white;
  border-radius: 8px;
  padding: 8px 12px;
  width: 72px;

  &.is-disabled {
    opacity: 0.5;
  }
}

.icon-text {
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
}

.analyzing {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>