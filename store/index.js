// ページ1つに巨大な連想配列1つを定義する
// コンポーネントをまたがる情報や保存しておきたい情報を集約する
// localStorageやFirebaseなどと連携出来るように、JSON化出来るデータのみセットする
// つまり、関数やDOMやインスタンスは極力置かない
// number, boolean, string, null, array, objectはJSON化可能


// firebaseをプラグインからのみ取り
import firebase from '@/plugins/firebase';
const db = firebase.database();





// State部分
export const state = () => ({
  colorList: [
    '#d00',
    '#cc0',
    '#0cc',
    '#0c0',
    '#c0c',
  ],
  memoData: [],
  boards:[],
  boardsPath: '/boards',
  currentBoardId: null,
  // const localData = localStorage.vuex;
  // localStorageのデータがあれば適用する
  // } else {
  //   return {
//     };
//   }
});


// ページ初期化時に一回だけ呼ばれる
export const plugins = [ 
  (store) => {
    // 部屋や名前の作成を監視する
    db.ref(store.state.boardsPath).on('value',(snapshot)=>{
      store.commit('setBoards', snapshot.val() || []);
    });
    // $store.commit が呼ばれるのを監視してlocalStorageに保存する
    // store.subscribe(() => {
      // -------------------
      // localstorageにデータを送る
      // -------------------
      // localStorage.vuex = JSON.stringify(store.state);

  },
];


// index.vue の methods.onMove 内で使用している。メソッドスタイルgetterの書き方より使い方を意識する
// https://vuex.vuejs.org/ja/guide/getters.html#%E3%83%A1%E3%82%BD%E3%83%83%E3%83%89%E3%82%B9%E3%82%BF%E3%82%A4%E3%83%AB%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9
export const getters = {
  getMemoById: (state) => (id) => {
    return state.memoData.find(memo => memo.id === id);
  },
  memoPath(state){
    return state.currentBoardId ? `/memos/${state.currentBoardId}`: null ; //前のページから遷移していたら一度消す
  }

};

// stateは「必ず」mutationsの関数を通して更新する
// 呼び出しは $store.commit('関数名', 必要なら引数);
// mutationsに非同期処理を書いてはならない
// 非同期処理はactionを経由してmutationを呼ぶ
export const mutations = {
  setBoards(state, boards){
    state.boards = boards
  },

  setCurrentBoardId(state, id){
    state.currentBoardId = id;
  },
  setMemoData(state, memoData){
    state.memoData = memoData;
  },

};

// axiosなど非同期処理を挟んでstateを更新したい場合に使う
// 呼び出しは$store.dispatch('関数名', 必要なら引数)
// actionsの中で$store.commit を呼んでstateを更新する
export const actions = {
  async getBoards({commit, state}){
    // console.log(state); 
    const snapshot = await db.ref(state.boardsPath).once('value');
    commit('setBoards', snapshot.val() || []);
  },
  async createBoard({commit, state},name){
    const memos = state.memoData;
    const id = Math.max(...state.boards.map(b => b.id), 0) + 1; //空の時に備えて０を第二引数に入れておく
    await db.ref(state.boardsPath).set([...state.boards,{id,name, memos}]);
    return id;
  },
  async addMemo(state, getters) {
    console.log(state.state.memoData); //なぜ？
    const newMemoData = [...state.state.memoData];
    const lastMemo = newMemoData[newMemoData.length - 1] || { id: 0 };

    newMemoData.push({
      id: lastMemo.id + 1,
      left: 20, // 常に一番左に生成することにした
      top: 20,
      colorIndex: Math.floor(Math.random()*state.state.colorList.length),
      text: '',
      zIndex: 0, // 新たに追加した
    });

    // state.memoData = newMemoData;
    db.ref(state.getters.memoPath).set(newMemoData);
  },

  
  async updateMemo({state,getters}, memo) {
    const newMemoData = [...state.memoData];
    const targetIndex = newMemoData.findIndex(m => m.id === memo.id);
    newMemoData[targetIndex]= memo;
    // state.memoData = newMemoData;
    db.ref(getters.memoPath).set(newMemoData);
  },

  async removeMemo({state,getters}, id) {
    // 課題
    const newMemoData = [...state.memoData];
    const targetIndex = newMemoData.findIndex(m => m.id === id);
    newMemoData.splice(targetIndex,1);
    // state.memoData = newMemoData;
    db.ref(getters.memoPath).set(newMemoData);
  },

  async removeBoard({state}, id) {
    if (state.boards.length === 1){
      alert("これ以上削除できてません");
      return;
    }
    var result = window.confirm("本当に削除して大丈夫ですか？");
    if (!result){
      return;
    }
    const newBoards = [...state.boards];
    const targetBoard = newBoards.findIndex(m => m.id === id);
    newBoards.splice(targetBoard,1);
    // state.memoData = newMemoData;
    db.ref(state.boardsPath).set(newBoards);
  },

};

// ストアの外でデータの書き換えをするための設定
// https://github.com/nuxt/nuxt.js/issues/1917
// export const strict = false;