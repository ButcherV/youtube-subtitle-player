<!-- LanguageSelector.vue -->
<template>
  <div class="language-selector">
    <label class="label">
      {{ label }}
    </label>
    
    <!-- 选择器主按钮 -->
    <button
      type="button"
      class="selector-button"
      @click="isOpen = !isOpen"
    >
      <div class="button-content">
        <!-- 主视觉标识 -->
        <div class="main-symbol">
          {{ selectedLanguage?.symbol }}
        </div>
        
        <!-- 语言信息 -->
        <div class="language-info">
          <div class="language-name">{{ selectedLanguage?.localName }}</div>
          <div class="language-name-en">{{ selectedLanguage?.name }}</div>
        </div>
        
        <!-- 书法/艺术字展示 -->
        <div class="calligraphy">
          {{ selectedLanguage?.calligraphy }}
        </div>
      </div>
    </button>

    <!-- 下拉选项面板 -->
    <div
      v-if="isOpen"
      class="dropdown-panel"
    >
      <div class="options-container">
        <button
          v-for="language in languages"
          :key="language.code"
          class="language-option"
          :class="{ 'is-disabled': isLanguageDisabled(language) }"
          @click="selectLanguage(language.code)"
        >
          <!-- 左侧主视觉标识 -->
          <div class="option-symbol">
            {{ language.symbol }}
          </div>
          
          <!-- 中间语言信息和特征标签 -->
          <div class="option-info">
            <div class="option-name">
              {{ language.localName }}
              <component 
                :is="language.icon"
                class="icon"
              />
            </div>
            <div class="option-name-en">
              {{ language.name }}
            </div>
            <div class="trait-container">
              <span
                v-for="(trait, index) in language.traits"
                :key="index"
                class="trait-tag"
              >
                {{ trait }}
              </span>
            </div>
          </div>
          
          <!-- 右侧书法/艺术字展示 -->
          <div class="option-calligraphy">
            {{ language.calligraphy }}
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Type, Pencil } from 'lucide-vue-next'

export default {
  name: 'LanguageSelector',
  components: {
    Type,
    Pencil
  },
  props: {
    modelValue: String,
    label: String,
    type: {
      type: String,
      required: true,
      validator: (value) => ['native', 'target'].includes(value)
    }
  },
  emits: ['update:modelValue'],
  
  setup(props, { emit }) {
    const isOpen = ref(false)

    // 添加禁用状态判断
    const isLanguageDisabled = (language) => {
      if (props.type === 'native') {
        return language.code !== 'zh'
      }
      if (props.type === 'target') {
        return language.code !== 'en'
      }
      return false
    }

    // 语言配置数据
    const languages = [
      {
        code: 'zh',
        name: '中文',
        localName: '中文',
        symbol: '汉',
        calligraphy: '永',
        icon: 'Type',
        traits: ['方块字', '声调', '书法']
      },
      {
        code: 'en',
        name: 'English',
        localName: 'English',
        symbol: 'Aa',
        calligraphy: '&',
        icon: 'Pencil',
        traits: ['alphabet', 'left-to-right', 'spaces']
      },
      {
        code: 'ja',
        name: 'Japanese',
        localName: '日本語',
        symbol: 'あ',
        calligraphy: '㐂',
        icon: 'Type',
        traits: ['かな', '漢字', '縦書き']
      },
      {
        code: 'ar',
        name: 'Arabic',
        localName: 'العربية',
        symbol: 'ع',
        calligraphy: '﷽',
        icon: 'Pencil',
        traits: ['right-to-left', 'cursive', 'calligraphy']
      },
      {
        code: 'ko',
        name: 'Korean',
        localName: '한국어',
        symbol: 'ㄱ',
        calligraphy: '훈',
        icon: 'Type',
        traits: ['한글', '음절', '받침']
      }
    ]

    const selectedLanguage = computed(() => {
      // 如果有选中的值，优先使用选中的值
      const selected = languages.find(lang => lang.code === props.modelValue);
      if (selected) return selected;
      
      // 否则根据类型返回默认值
      if (props.type === 'native') {
        return languages.find(lang => lang.code === 'zh');
      } else if (props.type === 'target') {
        return languages.find(lang => lang.code === 'en');
      }
      
      return languages[0];
    });

    const selectLanguage = (code) => {
      // 如果语言被禁用，不执行选择
      const language = languages.find(lang => lang.code === code)
      if (language && !isLanguageDisabled(language)) {
        emit('update:modelValue', code)
        isOpen.value = false
      }
    }

    return {
      isOpen,
      languages,
      selectedLanguage,
      selectLanguage,
      isLanguageDisabled
    }
  }
}
</script>

<style scoped lang="scss">
.icon {
  width: 16px;
  height: 16px;
}

.language-selector {
  position: relative;

  & + .language-selector {
    margin-top: 32px;
  }
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.selector-button {
  width: 100%;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.selector-button:hover {
  background: #F9FAFB;
}

.selector-button:focus {
  outline: none;
  border-color: $green;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.button-content {
  display: flex;
  align-items: center;
}

.main-symbol {
  flex-shrink: 0;
  height: 40px;
  width: 40px;
  background: #F3F4F6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.language-info {
  margin-left: 16px;
  flex: 1;
}

.language-name {
  font-weight: 500;
}

.language-name-en {
  margin-top: 4px;
  font-size: 14px;
  color: #6B7280;
}

.calligraphy {
  margin-left: 12px;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  opacity: 0.6;
}

.dropdown-panel {
  position: absolute;
  z-index: 10;
  margin-top: 8px;
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
}

.options-container {
  padding: 8px 0;
}

.language-option {
  width: 100%;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.language-option:hover {
  background: #F9FAFB;
}

.option-symbol {
  flex-shrink: 0;
  height: 48px;
  width: 48px;
  background: #F3F4F6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.language-option:hover .option-symbol {
  background: white;
}

.option-info {
  flex: 1;
  text-align: left;
}

.option-name {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 14px;
}

.option-name-en {
  font-size: 14px;
  color: #6B7280;
  margin-top: 4px;
}

.trait-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.trait-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #F3F4F6;
  color: #374151;
}

.option-calligraphy {
  flex-shrink: 0;
  height: 48px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  opacity: 0.6;
}

.language-option.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  
  // &:hover {
  //   background: transparent;
  // }
  
  .option-symbol {
    background: #E5E7EB;
  }
}
</style>