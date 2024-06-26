<script setup lang="ts">
const model = defineModel<any>();
const index = ref(0);
const loading = ref(false);


function auth(){
  loading.value = true;
  useFetch('/api/auth',{ method:'get',query:{ id:model.value.id , index:index.value } }).then((res:any)=>{
    console.log('验证结果',res.data.value)
    model.value.result = res.data.value.suc
    loading.value = false;
  })
}
</script>

<template>
  <div class="modal" v-if="model">
    <img src="/close_40dp.svg" class="close" @click="model=false">
    <div class="content">
      <div class="card">
        <p class="title">根据左侧红圈标记的图标,切换右侧图片,找到机器人站在标记图标的图片(当前{{ index+1 }},共{{model.images.length}})</p>
        <div class="imgs">
          <img :src="model.sureTipImage"
               style="background: rgba(185,182,182,0.85);border-radius: 8px;flex: 1;aspect-ratio: 1/1">
          <div
              style="position: relative;flex: 1;aspect-ratio: 1/1;background: rgba(185,182,182,0.85);border-radius: 8px;">
            <img :src="model.images[index]" style="width: 100%;height: 100%;position: absolute;bottom: 0;border-radius: 8px">
            <div class="arrow-l" @click="()=>{
                if(index>=1)index-=1;
              }"></div>
            <div class="arrow-r" @click="()=>{
                if(index<model.images.length-1)index+=1;
              }"></div>
          </div>

        </div>

        <div class="button" :class="loading?'loading':''" @click="auth">{{ model.result?'验证成功':'提交验证' }}</div>

      </div>
    </div>

    <div class="reward" v-if="model.result">
      <img src="/wx.jpg" style="width: 100%">
      <p>恭喜您获得添加本人微信机会一次!</p>
    </div>

  </div>



</template>

<style scoped>

.modal {
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.81);
  position: fixed;
  left: 0;
  top: 0;
}

.close {
  width: 30px;
  height: 30px;
  position: fixed;
  right: 30px;
  top: 30px;
  cursor: pointer;
}

.content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  width: calc(100% - 30px);
  max-width: 500px;
  height: fit-content;
  background: white;
  border-radius: 8px;
  padding: 16px;
  font-weight: 600;
}

.title {
  font-size: 1.2rem;
  line-height: 1.5rem;
  color: rgba(0, 0, 0, 0.96);

  margin: 0;
}

.imgs {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: 8px;
}


.arrow-l {
  width: 3rem;
  height: 3rem;
  background-size: contain;
  background: url("/left-arrow.svg") no-repeat;
  position: absolute;
  left: 0;
  bottom: 0;
  cursor: pointer;
}

.arrow-r {
  width: 3rem;
  height: 3rem;
  background-size: contain;
  background: url("/left-arrow.svg") no-repeat;
  transform: scaleX(-1);
  position: absolute;
  right: 0;
  bottom: 0;
  cursor: pointer;
}


.button {
  margin-top: 20px;
  background: green;
  border-radius: 10px;
  text-align: center;
  vertical-align: center;
  color: white;
  font-size: 1.2rem;
  padding: 15px;
}

.loading {
  animation: breathing 2s ease-in-out infinite alternate;
}

@keyframes breathing {
  0% {
    background-color: green;
  }
  50% {
    background-color: #24c724;
  }
  100% {
    background-color: #63d563;
  }
}


.reward{
  position: fixed;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 260px;
  color: white;
}


</style>