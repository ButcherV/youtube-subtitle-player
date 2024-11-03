<template>
  <div class="phrase-analysis">
    <div class="translation para-wrapper">
      <h3 class="para-title">翻译</h3>
      <div class="para-content">
        <p>{{ data.text }}</p>
        <p>{{ data.translation }}</p>
      </div>
    </div>

    <div class="info-item para-wrapper">
      <h3 class="para-title">原始形式</h3>
      <p class="para-content">{{ data.original }}</p>
    </div>
    <div class="info-item para-wrapper">
      <h3 class="para-title">语法作用</h3>
      <p class="para-content">{{ data.role }}</p>
    </div>
    <div class="info-item para-wrapper">
      <h3 class="para-title">短语类型</h3>
      <p class="para-content">{{ data.phraseType }}</p>
    </div>

    <div class="usage para-wrapper">
      <h3 class="para-title">用法说明</h3>
      <p class="para-content">{{ data.usage }}</p>
    </div>

    <div class="examples para-wrapper">
      <h3 class="para-title">例句</h3>
      <ul class="para-content">
        <li class="para-item" v-for="(example, index) in data.examples" :key="index">
          {{ example }}
        </li>
      </ul>
    </div>

    <div class="alternatives para-wrapper">
      <h3 class="para-title">相似表达</h3>
      <ul class="para-content">
        <li class="para-item" v-for="(alt, index) in data.alternatives" :key="index">
          {{ alt }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@use '@/assets/styles/analysis.scss';
</style>
