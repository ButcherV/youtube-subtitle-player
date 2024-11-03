<template>
  <div class="sentence-analysis">
    <div class="para-wrapper">
      <h3 class="para-title">翻译</h3>
      <div class="para-content">
        <p class="origin-content">{{ data.text }}</p>
        <p>{{ data.translation }}</p>
      </div>
    </div>
    <div class="grammar para-wrapper">
      <h3 class="para-title">语法结构</h3>
      <p class="para-content">{{ data.grammar.structure }}</p>
    </div>
    <div class="para-wrapper">
      <h3 class="para-title">语法点</h3>
      <ul class="para-content">
        <li v-for="(point, index) in data.grammar.points" :key="index">
          {{ point }}
        </li>
      </ul>
    </div>
    <div class="vocabulary para-wrapper">
      <h3 class="para-title">词汇</h3>
      <div class="para-content">
        <div
          v-for="(item, index) in data.vocabulary"
          :key="index"
          class="para-item"
        >
          <h4>{{ item.word }}</h4>
          <p>{{ item.explanation }}</p>
          <p>{{ item.usage }}</p>
        </div>
      </div>
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
