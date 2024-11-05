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
                :disabled="!canSave"
                :class="{ 'is-disabled': !canSave }"
                @click="handleSaveWordCard"
              >
                <font-awesome-icon icon="plus" />
                <p class="icon-text">收藏</p>
              </button>
              <!-- <button class="icon-button">
                <font-awesome-icon icon="plus" />
              </button> -->
            </div>
          </div>
          <div class="main-grammer-wrapper">
            <div v-if="grammarAnalysis" class="grammar-result">
              <component 
                :is="analysisComponent" 
                :data="grammarAnalysis"
              />
            </div>
            <div v-else-if="isAnalyzing" class="analyzing">
              <Loading color="#5B37B7" :duration="0.8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { ref, watch, computed, nextTick, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { cleanText } from "../utils/helper"; 
import axios from 'axios';
import Loading from './Loading.vue';
import SentenceAnalysis from './template/SentenceAnalysis.vue'
import PhraseAnalysis from './template/PhraseAnalysis.vue'
import WordAnalysis from './template/WordAnalysis.vue' 
const API_BASE_URL = "http://192.168.128.153:3000";

export default {
  name: "SubtitleAnalysisPopup",
  components: {
    Loading,
    SentenceAnalysis,
    PhraseAnalysis,
    WordAnalysis
  },
  props: {
    isActive: Boolean,
    subtitle: {
      type: Object,
      required: false,
      default: () => ({
        originText: '',
        title: '',
        description: '',
        previous: '',
        next: ''
      })
    }
  },
  emits: ["close"],
  setup(props, { emit }) {
    const currentAnalyzingSubtitle = ref(null);
    const textRef = ref(null);
    const grammarAnalysis = ref(null);
    const isAnalyzing = ref(false);
    const hasSelectedText = ref(false);
    const { proxy } = getCurrentInstance();

    // 用于实时跟踪用户选中的文本，控制"语法分析"按钮的状态
    // 会随着用户选择/失焦而改变
    const currentSelectedText = ref('');
    
    // 用于保存已经点击"语法分析"的文本，控制"收藏"按钮的状态和收藏的内容
    // 不会因为失焦而改变，只在点击"语法分析"时更新
    const analyzingText = ref('');

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

            // 弹窗打开时，禁止背景滚动
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';

            // 自动触发语法分析
            handleAnalyzeGrammar();
          } else {
            grammarAnalysis.value = null;
            isAnalyzing.value = false;

            // 弹窗关闭时，恢复背景滚动
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
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

    // 语法分析时，保存当前选中的文本，避免失焦后找不到要分析的内容
    const handleAnalyzeGrammar = async () => {
      // 在分析前保存当前选中的文本
      const textToAnalyze = cleanText(currentSelectedText.value);
      if (!textToAnalyze) {
        console.warn('没有要分析的文本');
        return;
      }

      // 保存正在分析的文本
      analyzingText.value = textToAnalyze;
      isAnalyzing.value = true;
      grammarAnalysis.value = null;

      try {
        const response = await axios.post(`${API_BASE_URL}/grammar/analyze`, {
          text: textToAnalyze,
          context: {
            originText: props.subtitle.originText,
            title: props.subtitle.title,
            // description: props.subtitle.description,
            previous: props.subtitle.previous,
            next: props.subtitle.next
          }
        });
        
        grammarAnalysis.value = response.data;
      } catch (error) {
        console.error('语法分析失败:', error);
        // 根据错误类型显示不同提示
        if (error.response) {
          // 服务器返回错误
          const message = error.response.data.message || '分析失败，请重试';
          proxy.$message.error(message);
        } else if (error.request) {
          // 网络错误
          proxy.$message.error('网络连接失败，请检查网络设置');
        } else {
          // 其他错误
          proxy.$message.error('分析失败，请稍后重试');
        }
      } finally {
        isAnalyzing.value = false;
      }
    };

    // 使用 analyzingText 判断是否可以收藏
    // 因为 currentSelectedText 会因为失焦变为空，而 analyzingText 不会
    const canSave = computed(() => {
      return grammarAnalysis.value 
        && analyzingText.value 
        && !isAnalyzing.value;
    });

    const handleSaveWordCard = async () => {
      if (!grammarAnalysis.value) {
        console.warn('没有可收藏的内容');
        return;
      }

      try {
        const payload = {
          text: analyzingText.value,
          type: grammarAnalysis.value.type,
          data: grammarAnalysis.value,
          videoInfo: {
            videoId: props.subtitle.videoId,
            videoTitle: props.subtitle.title,
            text: props.subtitle.originText,
            startTime: props.subtitle.start,
            endTime: props.subtitle.end
          }
        };

        const response = await axios.post(`${API_BASE_URL}/wordcard/save`, payload);
        
        // 根据后端返回的消息显示提示
        if (response.data.success) {
          proxy.$message.success(response.data.message || '收藏成功');
        } else {
          proxy.$message.warning(response.data.message || '该内容已收藏过');
        }
      } catch (error) {
        console.error('收藏失败:', error);
    
        if (error.response) {
          // 服务器返回错误
          const message = error.response.data.message || '收藏失败，请重试';
          proxy.$message.error(message);
        } else if (error.request) {
          // 网络错误
          proxy.$message.error('网络连接失败，请检查网络设置');
        } else {
          // 其他错误
          proxy.$message.error('收藏失败，请稍后重试');
        }
      }
    };

    const analysisComponent = computed(() => {
      if (!grammarAnalysis.value) return null;
      
      console.log("grammarAnalysis.value.type", grammarAnalysis.value.type)

      switch (grammarAnalysis.value.type) {
        case 'SENTENCE': return SentenceAnalysis;
        case 'PHRASE': return PhraseAnalysis;
        case 'WORD': return WordAnalysis;
        default: return null;
      }
    });
    
    return { 
      close,
      currentSubtitle: computed(() => currentAnalyzingSubtitle.value),
      textRef,
      handleBlur,
      handleAnalyzeGrammar,
      grammarAnalysis,
      isAnalyzing,
      hasSelectedText,
      analysisComponent,
      handleSaveWordCard,
      canSave
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
  background-color: $gray;

  &.active {
    bottom: 0
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
  top: 8px;
  right: 8px;
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
  border-radius: 16px 16px 0px 32px;
  background-color: $green;
  position: relative;

  &::before {
    content: "";
    width: 40px;
    height: 40px;
    background-color: $green;
    position: absolute;
    bottom: -25px;
    right: 0;
  }
}

.main-grammer-wrapper {
  background-color: white;
  border-top-right-radius: 32px;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 16px 32px;
  background-color: $gray;
}

.main-text {
  width: 90%;
  margin: 0 auto;
  font-size: 22px;
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
  width: 80%;
  margin: 24px auto 0 auto;
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