<template>
    <b-container class="bv-example-row">
      <b-row>
        <b-col cols="2" class="side-bar">

            <div class="upper">
              <div class="toTitle" @click="confirm">
                  Memo App
              </div>

              <!-- モーダル部分 -->
              <div class="modalButton">
                <b-btn v-b-modal.modal1><i class="fas fa-plus"></i></b-btn> 
                <!-- Modal Component -->
                <b-modal id="modal1" title="新規ボード作成" @ok="inputName">
                  <input type="text" v-model="name">
                </b-modal>
              </div>
            </div>



            <div class="lower">
              <nuxt-link v-for="tab in $store.state.boards" :key="tab.id" class="sample" :to="`/board/?id=${tab.id}`">
                {{ tab.name }}
                <div class="btn-wrapper">   
                    <div class="btn" @click="$store.dispatch('removeBoard', tab.id)"><i class="fas fa-trash-alt"></i></div>
                </div> 
              </nuxt-link>
            </div>
        </b-col>
        <b-col cols="10">
          <!-- handlerから外れてもドラッグを止められるようにmouseupもcontainerに当てることにした -->
          <div
            class="container"
            @mousemove="onMove"
            @mouseup="dragEnd"
          >

            <!-- 属性名dataで連想配列ごと渡すことにした -->
            <!-- @start="dragStart($event, data)"のように連想配列ごと渡す方式では移動できないので注意 -->
            <!-- $eventは子コンポーネントがemitした値 -->
            <Memo
              v-for="data in $store.state.memoData"
              :key="data.id"
              :data="data"
              @start="dragStart($event, data.id)"
            />
            <AddBtn @add="$store.dispatch('addMemo')"/>
          </div>
        </b-col>
      </b-row>
    </b-container>
</template>

<script>
import bContainer from 'bootstrap-vue/es/components/layout/container';
import Memo from '~/components/Memo';
import AddBtn from '~/components/AddBtn'; 
import firebase from '@/plugins/firebase';

//インスタンスの作成
let db = firebase.database(); //データベース用の関数の読み込み

export default {
  components: {
    bContainer,
    Memo,
    AddBtn,
  },

  watchQuery: ['id'],
  async fetch ({store, route}){

      if (store.getters.memoPath !== null){
        db.ref(store.getters.memoPath).off('value');
      }
      store.commit('setCurrentBoardId',+route.query.id); //urlから取得してきたidに+をつけることで数値化する
      await store.dispatch('getBoards');
      const dbRef = db.ref(store.getters.memoPath);
      const snapshot = await dbRef.once('value');
      store.commit('setMemoData', snapshot.val() || []);

      dbRef.on('value', snapshot => store.commit('setMemoData', snapshot.val() ||[]));
  },

  data() {
    // このコンポーネントでしか使わない値や、storeに保存するほどでもない値はdataを使う
    return {
      draggingId: null, // targetId から名称変更、永続化する意味がないのでstoreに保存しないことにした
      prevX: null,
      prevY: null,
      name:'',
    };
  },
  mounted() {
    // メモが1枚も無いなら＋ボタンを押すのと同じメソッドを呼んで生成
    if (this.$store.state.memoData.length === 0) {
      this.$store.dispatch('addMemo');
    }
  },

  beforeDestroy(){
    db.ref(this.$store.getters.memoPath).off('value'); //ページが変わるときにデータを破棄する
  },

  methods: {


    confirm(){
      var result = window.confirm("トップページに戻りますか？");
      if (!result){
        return;
      }
      this.$router.push(`/`);
    },
    dragStart(e, id) {
      this.draggingId = id;

      // startの度にマウス位置を初期化するとonMoveの処理がすっきり書けることに気付いた
      this.prevX = e.pageX;
      this.prevY = e.pageY;
    },
    dragEnd() {
      this.draggingId = null;
    },
    onMove(e) {
      const { draggingId } = this; // const draggingId = this.draggingId; と同じ
      if (draggingId === null) return;

      const x = e.pageX;
      const y = e.pageY;
      const targetMemo = {
        // store/index.jsのgetters.getMemoByIdを参照
        // 重要なのはここの使い方、computedに似ているかも
        // storeにdraggingIdを渡す⇒該当するメモを計算して返してもらう
        // ...スプレッド演算子で連想配列のコピーを作る
        ...this.$store.getters.getMemoById(draggingId),
      };
      // console.log(targetMemo);

      // 現在のマウス位置から直前(prev)のマウス位置を引いた差分
      targetMemo.left += x - this.prevX;
      targetMemo.top += y - this.prevY;

      //ウィンドウ左側制限
      if (targetMemo.left <= 0){
        targetMemo.left = 0;
      }
      // ウィンドウ高さの制限
      if (targetMemo.top <= 0){
        targetMemo.top = 0;
      }
      //ウィンドウ右側制限

      var sideBarWidth = document.getElementsByClassName("side-bar")[0].clientWidth;
      var diffW = e.pageX - targetMemo.left - sideBarWidth;
      var targetMemoRight = e.pageX + 200 - diffW;
      if (targetMemoRight >= window.innerWidth){
        targetMemo.left = window.innerWidth - sideBarWidth - 200;
      }

      //ウィンドウ下側制限
      var diffY = e.pageY - targetMemo.top;
      var targetMemoBottom = e.pageY + 305 - diffY;
      if (targetMemoBottom >= window.innerHeight){
        targetMemo.top = window.innerHeight - 305;
      }



      this.prevX = x;
      this.prevY = y;

      this.$store.dispatch('updateMemo', targetMemo);
    },
    async inputName(){
      if (this.name === ""){
          alert("名前を入力してください");
          return;
      }
      const boardData = this.$store.state.boards.find(b => b.name === this.name);
      if (boardData){
          this.$router.push(`/board/?id=${boardData.id}`); //同じ名前のボード名があれば
      } else {
          const id = await this.$store.dispatch('createBoard',this.name);
          this.$router.push(`/board/?id=${id}`);
          this.name="";
      }
    },
  },
}
</script>

<style scoped>
.bv-example-row {
  user-select: none;
  min-width:100vw;
  background: center/cover url('~/assets/bricks.jpg');
}

.side-bar{
  min-height: 100vh;
  background: white;
  color:#000;
  padding: 0;
}

.upper {
  width: 100%;
  height: 50px;
  /* padding: 0 auto; */
  text-align: center;
  padding: 5px 0;
  background: white;
  text-decoration: none;
  font-weight: bold;
}

.toTitle {
  width: 80%;
  display: inline-block;
  font-size: 24px;
  color:#000;
  text-decoration: none;
  cursor: pointer;
}

.toTitle:hover{
  color:green;
}

.modalButton {
  width: 20%;
  display: inline-block;
}



.btn-wrapper.btn {
  border-radius: 5px;
  font-size: 16px;
  padding: 0 5px;
  margin-left: 10px;
  line-height: 34px;
  font-weight: bold;
  cursor: pointer;
}

.input {
  height: 36px;
  padding: 5px;
  line-height: 47px;
}

.sample {
  height: 50px;
  width: 100%;
  padding: 10px;
  line-height: 30px;
  display:flex;
  justify-content: space-between;
  color:#000;
}

.sample:hover {
  border-right: 10px solid green;
  padding-right: 0px;
  color:green;
  text-decoration: none;
}

.nuxt-link-exact-active{
  background: green;
  color: white;
}

.nuxt-link-exact-active:hover{
  background: green;
  color: white;
}




</style>
