<script setup lang="ts">

const captcha = ref()
const loading = ref(false)
function gen(){
  if(loading.value)return;
  loading.value = true;
  useFetch('/api/gen').then((res:any)=>{
    captcha.value = res.data.value?.data
    loading.value=false;
  }).catch(e=>{
    loading.value=false;
  });
}


</script>

<template>

  <captcha-modal v-model="captcha"></captcha-modal>

  <div class="box">
    <div class="button" @click="gen">生成验证码</div>
  </div>

</template>

<style >
body{
  padding: 0;
  margin: 0;
}

.box{
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  justify-content: center;
  background: black;
}

.button{
  margin-top: 20px;
  background: green;border-radius: 10px;text-align: center;vertical-align: center;color: white;font-size: 1.2rem;
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

</style>