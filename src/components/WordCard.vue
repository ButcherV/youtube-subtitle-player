<template>
  <div class="word-card-container">
    <div class="word-card" :class="{ 'is-expanded': isExpanded }">
      <div class="video-section" v-if="word.videoInfos && word.videoInfos.length">
        <!-- <VideoClip
          v-for="videoInfo in word.videoInfos"
          :key="videoInfo._id"
          :videoId="videoInfo.videoId"
          :startTime="videoInfo.startTime"
          :endTime="videoInfo.endTime"
        /> 
        针对多视频，前端暂时没想好，怎么展示比较合适。
        暂时只展示第一个视频
        -->
        <VideoClip
          :videoId="word.videoInfos[0].videoId"
          :startTime="word.videoInfos[0].startTime"
          :endTime="word.videoInfos[0].endTime"
          :isExpanded="isExpanded"
        />
      </div>
      <div v-if="isExpanded" :class="['original-text', 'word-text', { 'is-small': isExpanded }]">
        <span v-html="highlightedText"></span>
      </div>
      <div v-else class="word-text">
        {{ word.text }}
      </div>
    </div>
    <div class="word-info-card" :class="{ 'is-show': isExpanded }">
      <div class="info-content">
        <component 
          :is="analysisComponent" 
          :data="word.data"
        />
      </div>
    </div>
  </div>
</template>

<script>
import VideoClip from './VideoClip.vue';
import { computed } from 'vue';
import SentenceAnalysis from './template/SentenceAnalysis.vue';
import PhraseAnalysis from './template/PhraseAnalysis.vue';
import WordAnalysis from './template/WordAnalysis.vue';

export default {
  name: "WordCard",
  components: {
    VideoClip,
    SentenceAnalysis,
    PhraseAnalysis,
    WordAnalysis
  },
  props: {
    word: {
      type: Object,
      required: true
    },
    isExpanded: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const analysisComponent = computed(() => {
      switch (props.word.type) {
        case 'SENTENCE': return SentenceAnalysis;
        case 'PHRASE': return PhraseAnalysis;
        case 'WORD': return WordAnalysis;
        default: return null;
      }
    });

    const highlightedText = computed(() => {
      if (!props.word.videoInfos[0].text || !props.word.text) return '';
      
      // 转义特殊字符，防止 XSS
      const escapeHtml = (text) => {
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      const originalText = escapeHtml(props.word.videoInfos[0].text);
      const targetText = escapeHtml(props.word.text);
      
      // 使用正则表达式进行替换，保持大小写匹配
      const regex = new RegExp(`(${targetText})`, 'gi');
      return originalText.replace(regex, '<span class="highlight">$1</span>');
    });

    return {
      analysisComponent,
      highlightedText
    };
  },
};
</script>

<style scoped lang="scss">
.word-card-container {
  position: relative;
  width: 100%;
  perspective: 1000px;
  height: calc(100% - 60px);
}

.word-card {
  width: 100%;
  background: $green;
  border-radius: 16px;
  position: relative;
  transition: all 0.5s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  z-index: 100;
  
  &.is-expanded {
    z-index: 999;
    height: calc(100% - 156px);
    justify-content: flex-start;
    // transform: translateY(-20px);
  }
}

.video-section {
  width: 100%;
  opacity: 0;
  transform: translateY(-60px);
  transition: all 0.5s ease;
  height: 0;
  overflow: hidden;

  .is-expanded & {
    opacity: 1;
    transform: translateY(0);
    height: auto;
  }
}

.word-text {
  font-size: 36px;
  line-height: 1.2;
  color: white;
  font-weight: 500;
  text-align: center;
  transition: all 0.5s ease;

  &.is-small {
    font-size: 18px;
    margin-top: 10px;
  }
}

.word-info-card {
  border-radius: 16px;
  background-color: $gray;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  font-size: 14px;
  position: absolute;
  left: 0;
  right: 0;
  height: 180px;
  padding: 16px;
  padding-top: 40px;
  z-index: 1;
  transition: all 0.5s ease;
  opacity: 0;
  overflow-y: auto;
  transform: translateY(-24px);  // 初始位置向上隐藏自身高度
  
  &.is-show {
    opacity: 1;
    // transform: translateY(-24px);  // 显示时回到原位
  }
}

.original-text {
  font-size: 16px;
  list-style: 1.4;
  padding: 0 8px;
  position: relative;
  text-align: left;
  :deep(.highlight) {
    background: rgba($purple, 0.2);
    color: white;
    padding: 0 4px;
    border-radius: 4px;
    font-weight: 500;
  }
}
</style>
