<template>
  <div class="subtitle-analysis-popup" :class="{ active: isActive }">
    <div class="popup-content">
      <button class="close-button" @click="close">×</button>
      <h3>当前字幕分析</h3>
      <p 
        @mouseup="handleTextSelection"
        @touchend="handleTextSelection"
        @contextmenu.prevent
      >{{ subtitle.originText }}</p>
      <Loading
        color="#666" 
        :duration="0.8"
      />
      <!-- 自定义菜单 -->
      <div 
        v-if="showCustomMenu"
        class="custom-menu"
        :style="menuPosition"
      >
        <button @click="handleAnalyze">查询意义</button>
      </div>
      <!-- <div v-if="subtitle.grammar?.words?.length || subtitle.grammar?.phrases?.length">
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
      <div v-else>暂无分析结果</div> -->
    </div>
  </div>
</template>
<script>
import { ref } from "vue";
import Loading from "./Loading.vue";
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
    // 添加 watch 来观察数据
    const showCustomMenu = ref(false);
    const menuPosition = ref({
      top: '0px',
      left: '0px'
    });

    const handleTextSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText) {
        // 获取选择范围的位置
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // 设置菜单位置
        menuPosition.value = {
          top: `${rect.bottom}px`,
          left: `${rect.left}px`
        };

        showCustomMenu.value = true;
      } else {
        showCustomMenu.value = false;
      }
    };

    const handleAnalyze = () => {
      const selectedText = window.getSelection().toString().trim();
      // TODO: 处理选中文本的分析
      console.log('分析文本:', selectedText);
      showCustomMenu.value = false;
    };

    const close = () => emit("close");
    return { 
      close,
      showCustomMenu,
      menuPosition,
      handleTextSelection,
      handleAnalyze
    };
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
