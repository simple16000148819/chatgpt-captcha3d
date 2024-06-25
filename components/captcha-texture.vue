<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import multiavatar from "@multiavatar/multiavatar";
//生成图标验证码地面贴图
const textureCanvas = ref();
const ctxRef = ref<any>();
const config = {
  width:200,height:200,
  iconSize:50,//图标尺寸
  iconNum:5,//图标数量
}

const emit = defineEmits(['on-texture','on-sure-img'])//生成贴图和正确提示的图片
const sceneIsInit = useState('sceneIsInit',()=>false);//3d场景是否初始化

watchEffect(()=>{
  ctxRef.value = textureCanvas.value?.getContext('2d');
  if(sceneIsInit.value&&ctxRef.value)render();//场景初始化后渲染
})

onMounted(()=>{
  sceneIsInit.value=true
})

async function render(){
  const ctx = ctxRef.value;
  //ctx.clearRect(0, 0, textureCanvas.value.width, textureCanvas.value.height);//清空画布
  const positions = randomIconPosition();//随机生成icon坐标点
  drawBezierPath(positions); // 先绘制曲线
  await drawIcons(positions); // 然后绘制图标
  function getRandomIndex(array:any[]) {
    return Math.floor(Math.random() * array.length);
  }
  const sureIndex = getRandomIndex(positions);//随机正确坐标点
  const surePos = positions[sureIndex]
  //在three场景中的坐标百分比
  const scenePositions = positions.map(pos=>{ return { x:pos.x/config.width + config.iconSize/config.width/5 , y:pos.y/config.height + config.iconSize/config.height/5 } })
  emit('on-texture',scenePositions,textureCanvas.value);//回调让场景把canvas绘制到地面
  setTimeout(()=>{//延迟绘制正确坐标提示图
    drawSureHint(surePos.x+25, surePos.y+25, 30,3);
    const sureHintImg = textureCanvas.value.toDataURL('image/png',0.5);
    emit('on-sure-img',sureIndex,sureHintImg)
  },10)
}


// 检查两个位置是否重叠
function isOverlapping(pos1:any, pos2:any) {
  const buffer = 5; // 防止图标太近
  return !(pos1.x + config.iconSize + buffer < pos2.x ||
      pos1.x > pos2.x + config.iconSize + buffer ||
      pos1.y + config.iconSize + buffer < pos2.y ||
      pos1.y > pos2.y + config.iconSize + buffer);
}

// 生成随机位置，确保不重叠
function randomIconPosition() {

  const positions:any[] = [];
  while (positions.length < config.iconNum) {
    const x = Math.random() * (config.width - config.iconSize);
    const y = Math.random() * (config.height - config.iconSize);
    const newPos = { x, y };
    if (!positions.some(pos => isOverlapping(pos, newPos))) {
      positions.push(newPos);
    }
  }
  return positions;
}

// 计算贝塞尔曲线控制点
function getControlPoints(p0:any, p1:any, p2:any, t:any) {
  const d01 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
  const d12 = Math.hypot(p2.x - p1.x, p2.y - p1.y);

  const fa = t * d01 / (d01 + d12);   // scaling factor for triangle Ta
  const fb = t * d12 / (d01 + d12);   // ditto for Tb, simplifies to fb=t-fa

  const p1x = p1.x - fa * (p2.x - p0.x);    // x2-x0 is the width of triangle Ta
  const p1y = p1.y - fa * (p2.y - p0.y);    // y2-y0 is the height of Ta
  const p2x = p1.x + fb * (p2.x - p0.x);    // same for triangle Tb
  const p2y = p1.y + fb * (p2.y - p0.y);

  return [{x: p1x, y: p1y}, {x: p2x, y: p2y}];
}


// 绘制多阶贝塞尔曲线
function drawBezierPath(positions:any[]) {
  const ctx = ctxRef.value;
  ctx.strokeStyle = 'rgba(13,13,13,0.89)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(positions[0].x + config.iconSize / 2, positions[0].y + config.iconSize / 2);
  for (let i = 0; i < positions.length - 1; i++) {
    const p0 = positions[i];
    const p1 = positions[i + 1];
    const cp = getControlPoints(p0, p1, positions[i + 2] || positions[0], 0.3);
    ctx.bezierCurveTo(cp[0].x, cp[0].y, cp[1].x, cp[1].y, p1.x + config.iconSize / 2, p1.y + config.iconSize / 2);
  }
  ctx.stroke();
}


// 绘制图标
async function drawIcons(positions:any[]) {

  //使用uuid + multiavatar 生成随机svg图标 转为base64加载
  async function loadIcon(pos:any){
    return new Promise((ok)=>{
      let iconImage = new Image();
      iconImage.src = `data:image/svg+xml;base64,${btoa(multiavatar(uuidv4()))}`
      iconImage.addEventListener('load',()=>{
        pos.icon = iconImage;
        ok(pos)
      })
    })
  }

  const loads:any[] = []
  positions.forEach(pos=>{
    loads.push(loadIcon(pos))
  })

  await Promise.all(loads)//图标全部加载结束后

  positions.forEach(pos => {
    // 加载图标图片
    ctxRef.value.drawImage(pos.icon, pos.x, pos.y, config.iconSize, config.iconSize);
  });
}

//绘制正确位置的红圈提示
function drawSureHint(x:number, y:number, radius:number, lineWidth:number) {
  const ctx = ctxRef.value;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.closePath();
}



</script>

<template>
  <canvas ref="textureCanvas" :width="config.width" :height="config.height"></canvas>
</template>

<style scoped>

</style>