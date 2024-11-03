<template>
  <div class="word-analysis">
    <div class="basic-info para-wrapper">
      <h3 class="para-title">翻译</h3>
      <div class="para-content">
        <h2 class="origin-content">{{ data.original }}</h2>
        <p> |{{ data.phonetic }}|</p>
        <p>{{ data.translation }} / {{ data.roleInSentence }}</p>
      </div>
    </div>

    <!-- <div class="meanings para-wrapper">
      <h3 class="para-title">释义</h3>
      <ul class="para-content">
        <li class="para-item" v-for="(meaning, index) in data.meanings" :key="index">
          {{ meaning }}
        </li>
      </ul>
    </div> -->

    <div class="collocations para-wrapper">
      <h3 class="para-title">常见搭配</h3>
      <ul class="para-content">
        <li class="para-item" v-for="(collocation, index) in data.collocations" :key="index">
          {{ collocation }}
        </li>
      </ul>
    </div>

    <div class="examples para-wrapper">
      <h3 class="para-title">例句</h3>
      <ul class="para-content">
        <li class="para-item" v-for="(example, index) in data.examples" :key="index">
          {{ example }}
        </li>
      </ul>
    </div>

    <div class="synonyms para-wrapper" v-if="data.synonyms.length > 0">
      <h3 class="para-title">同义词</h3>
      <ul class="para-content">
        <li class="para-item" v-for="(synonym, index) in data.synonyms" :key="index">
          {{ synonym }}
        </li>
      </ul>
    </div>
    <div class="antonyms para-wrapper" v-if="data.antonyms.length > 0">
      <h3 class="para-title">反义词</h3>
      <ul class="para-content">
        <li class="para-item" v-for="(antonym, index) in data.antonyms" :key="index">
          {{ antonym }}
        </li>
      </ul>
    </div>

    <div class="etymology para-wrapper" v-if="data.etymology">
      <h3 class="para-title">词源</h3>
      <p class="para-content">{{ data.etymology }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/analysis.scss';
</style>