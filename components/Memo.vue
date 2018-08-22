<template>
  <!-- z-indexとbackground-colorを追加した -->
  <div
    class="memo"
    :style="`
      top: ${data.top}px;
      left: ${data.left}px;
      z-index: ${data.zIndex};
      background-color: ${$store.state.colorList[data.colorIndex]};
    `"
    @mousedown="putForward(data.id)"
  >
    <div class="handle" @mousedown="$emit('start', $event)"/>

    <!-- 閉じるボタンを追加した -->
    <span class="close" @click="$store.dispatch('removeMemo', data.id)">X</span>

    <!-- Editorはシンプルな機能のコンポーネントなのでstoreに関与させずpropsと$emitで値を受け渡しする -->
    <Editor :text="data.text" @inputEvent="onInput"/>
    <ColorTab :color="data.colorIndex" @changeColor="onChangeColor"/>
  </div>
</template>

<script>
import Editor from './Editor';
import ColorTab from './ColorTab';
import firebase from '@/plugins/firebase';

let database = firebase.database();




export default {
  components: {
    Editor,
    ColorTab,
  },
  props: ['data'], // dataにまとめたので注意
  methods: {
    onInput(text) {
      // 課題：現状だと文字は入力できるが、値が保存されないのでリロードすると消える  

      // -----------------
      // ストアから直接取得すると、データの直書きになってしまう。
      // その場合はstoreに"export const strict = false;"この記述が必要
          // const targetIndex = this.data.id - 1;
          // const newMemoData = this.$store.state.memoData[targetIndex];
          // newMemoData.text = text; //ここでmutateの問題でつまづく。制限を外す必要がある。
          // console.log(newMemoData);
          // this.$store.commit('updateMemo', newMemoData); //元のデータに書き込むのではなく、commitでupDateMemoに飛ばす  
          // console.log(this.data);
      // -----------------

      //storeからgetters.getMemoByIdで取得する
      const targetId = this.data.id;
      const newMemoData2= {
        ...this.$store.getters.getMemoById(targetId),
      };
      // console.log(newMemoData2);
      newMemoData2.text = text;
      this.$store.dispatch('updateMemo', newMemoData2);
    },
    putForward(id) {
      // 課題：該当のメモのzIndexをmemoData配列の中の最大+1にして前面に出したい
      // pages/index.vue > methods.onMoveを参考に、getMemoByIdを使うこと

      // -----------------
      // !!他のメモを０に戻して、選択したメモを１にする方法だと、挙動がおかしくなる
        // for (var i = 0; i < this.$store.state.memoData.length;i++ ){
        //   const newMemoData = this.$store.state.memoData[i];
        //   console.log(this.$store.state.memoData[i].zIndex);
        //   newMemoData.zIndex = 0;
        //   this.$store.commit('updateMemo', newMemoData);
        // }
      // -----------------

    
      // -----------------
      // zIndexの配列を作る
      // -----------------
      var arrayZindex =[];
      for (var i = 0; i < this.$store.state.memoData.length;i++ ){
        arrayZindex.push(this.$store.state.memoData[i].zIndex);
      }
      // -----------------
      // zIndexの最大値を取得
      // -----------------

      //Math.max.applyを利用する場合
      // var zIndexLargest = Math.max.apply(null,arrayZindex);

      //スプレッド演算子利用した場合
      var zIndexLargest = Math.max(...arrayZindex); 

      // -----------------
      // zIndexの最大値に＋１を行う
      // -----------------

      const targetId = this.data.id;
      const newMemoData= {
        ...this.$store.getters.getMemoById(targetId),
      };
      newMemoData.zIndex = zIndexLargest + 1;
      this.$store.dispatch('updateMemo', newMemoData);
      // console.log(arrayZindex);
      // console.log(zIndexLargest); 
    },

    // -----------------
    // 背景色を変える
    // -----------------

    onChangeColor(color){
      const targetId = this.data.id;
      const newMemoData= {
        ...this.$store.getters.getMemoById(targetId),
      };
      newMemoData.colorIndex = color ;
      // console.log(color);

      this.$store.dispatch('updateMemo', newMemoData);

    },
  },
};
</script>

<style scoped>
.memo {
  position: absolute;
  top: 20px;
  width: 200px;
  height: 300px;
}

.handle {
  width: 100%;
  height: 50px;
  background: rgba(0, 0, 0, 0.2);
  cursor: move;
}

.close {
  color: #fff;
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 20px;
  cursor: pointer;
}
</style>
