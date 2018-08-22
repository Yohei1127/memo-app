<template>
  <div class="colorTab">
      <div class="color" v-for="colorNum in 5" :key="colorNum" :style="`background-color: ${$store.state.colorList[colorNum-1]}`" @mousedown="changeColor(colorNum)"></div>
  </div>
</template>

<script>
export default {
  props: ['color'],
  methods: {
    changeColor(colorNum) {
      // 連想配列にせず直接文字を送るように少々書き換えた
      this.$emit('changeColor', colorNum-1);
      // console.log(colorNum-1);

    },
  },
}
</script>

<style scoped>
.colorTab {
    width: 100%;
    height: 20px;
    display:flex;
    justify-content: space-around;
    background: #fff;
    border-top:1px solid #fff;
}

.color {
    height: 19px;
    width:100%;
    box-sizing: border-box;
}

.color + .color {
    border-left: 1px solid #fff;
    box-sizing: border-box;
}
</style>