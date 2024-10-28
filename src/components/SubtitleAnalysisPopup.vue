<template>
  <div class="subtitle-analysis-popup" :class="{ active: isActive }">
    <div class="popup-content">
      <button class="close-button" @click="close">×</button>
      <h3>当前字幕分析</h3>
      <p>{{ subtitle.originText }}</p>
      <div v-if="subtitle.grammar?.words?.length || subtitle.grammar?.phrases?.length">
        <h4>词汇</h4>
        <ul>
          <li v-for="word in subtitle.grammar.words" :key="word.word">
            {{ word.word }} - {{ word.translation }} ({{ word.partOfSpeech }})
            <span v-if="word.phonetic">[{{ word.phonetic }}]</span>
          </li>
        </ul>
        <h4 v-if="subtitle.grammar.phrases?.length > 0">短语</h4>
        <ul v-if="subtitle.grammar.phrases?.length > 0">
          <li v-for="phrase in subtitle.grammar.phrases" :key="phrase.phrase">
            {{ phrase.phrase }} - {{ phrase.translation }}
          </li>
        </ul>
      </div>
      <div v-else>暂无分析结果</div>
    </div>
  </div>
</template>
<script>
import { watch } from "vue";
export default {
  name: "SubtitleAnalysisPopup",
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
    // 添加 watch 来观察数据
    watch(() => props.subtitle, (newVal) => {
      console.log('subtitle:', newVal);
      console.log('grammer:', newVal.grammer);
      console.log('words length:', newVal.grammer?.words?.length);
      console.log('phrases length:', newVal.grammer?.phrases?.length);
    }, { immediate: true });

    const close = () => emit("close");
    return { close };
  }
};
</script>
<style scoped lang="scss">
.subtitle-analysis-popup {
  position: fixed;
  bottom: -100%;
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transition: bottom 0.3s ease-in-out;
  z-index: $zIndexSubtitleAnalysisPopup;
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
