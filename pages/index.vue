<template>
    <div class="background">
      <div class="container">
          <h1>Memo App</h1>
          <form class="inputArea" @submit.prevent="inputName">
            <input type="text" id="input" placeholder="好きな名前を入力" v-model="name" > <!-- v-modelは:valueと@inputと同じ（ダブルバインディング） -->
            <div  id="btn" @click="inputName"> <!--to がrefと同じ役割 -->
                <i class="fas fa-plus"></i> 
                New
            </div>
          </form>
      </div>
    </div>
</template>

<script>
var inputFlag = false;

export default {
    async fetch ({store}){
        await store.dispatch('getBoards');
    },
    data(){
        return{
            name:'',
        };
    },
    methods:{
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
            }
        },
    },



}

</script>

<style scoped>
.background {
    background: center/cover url(~/assets/background.png); /* center/coverで自動的にウィンドウ幅に調整 */
    position: fixed;
    top: 0;
    left:0;
    right:0;
    bottom:0;
    z-index:-1;
}

.container {
  position:absolute;
  top: 30%;
  left: 15%;
  width: 500px;
}

.container > h1 {
  font-size: 70px;
  margin-bottom: 30px;
}


.inputArea {
    width: 100%;
    display:flex;
}

#input {
    padding: 2px 16px;
    font-size: 30px;
    border: 1px;
}

#btn {
    /* text-align: center; */
    background-color: gray;
    height: 49px;
    line-height:33px;
    padding: 8px;
    color: #fff;
    text-decoration: none;
    font-size: 28px;
    font-weight: bold;
    border-radius: 5px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    cursor: pointer;
    
}





</style>
