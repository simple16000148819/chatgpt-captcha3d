<script setup lang="ts">

import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {getRandomInt, timeout} from "~/utils";
import {useRoute} from "#app";

const query = useRoute().query;

const sceneCanvas = ref<any>()
let renderer: any, scene: any, camera: any, robot: any;
const sceneIsInit = useState('sceneIsInit', () => false);

function callServer(event: 'render-end', any: any) {//通知服务端渲染结束
  const call = JSON.stringify({event, data: any});
  console.log(call)
  return call;
}



onMounted(init)


function init() {

  scene = new THREE.Scene();
  const clock = new THREE.Clock();
  // 初始化相机
  camera = new THREE.PerspectiveCamera(80, sceneCanvas.value?.clientWidth / sceneCanvas.value?.clientHeight, 0.1, 1000);
  camera.position.set(10, 10, 2);
  camera.lookAt(0, 0, 0);

  // 渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: sceneCanvas.value,
    preserveDrawingBuffer: true,
    alpha: true,
  });

  // 灯光
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(10, 10, 10);
  scene.add(light);
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(0, 20, 10);
  scene.add(dirLight);


  // 加载地面纹理
  const groundTexture = new THREE.TextureLoader().load('ground.png');
  // THREE.RepeatWrapping：平铺重复。
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  // 设置重复次数
  groundTexture.repeat.set(5, 5)

  // 创建地面材质
  const groundMaterial = new THREE.MeshBasicMaterial({map: groundTexture});

  // 创建圆形地面
  const radius = 80; // 圆形地面的半径
  const segments = 64; // 圆形地面的分段数，分段数越高，圆形越平滑
  const groundGeometry = new THREE.CircleGeometry(radius, segments);

// 创建地面网格并添加到场景中
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // 将圆形地面旋转到水平面
  scene.add(ground);


  // 加载全景图作为天空盒
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load('sky.jpg', function (texture) {
    const geometry = new THREE.SphereGeometry(500, 60, 40)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.x = -1 // 水平方向翻转

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide // 确保材质应用在球体内部
    })

    const skybox = new THREE.Mesh(geometry, material)
    scene.add(skybox)
  })


  //加载机器人
  const loader = new GLTFLoader();
  let mixer: any;
  loader.load('RobotExpressive.glb', function (gltf: any) {
    robot = gltf.scene;
    const scale = 0.8;
    robot.scale.x = scale
    robot.scale.y = scale
    robot.scale.z = scale
    robot.rotation.y = getRandomInt(0, 3600)//随机旋转角度
    scene.add(robot);
    const anim = gltf.animations[0]
    mixer = new THREE.AnimationMixer(robot);
    const action = mixer.clipAction(anim);
    action.clampWhenFinished = true;
    action.loop = THREE.LoopRepeat;
    action.play()
    sceneIsInit.value = true;//场景初始化成功
  });


  // 渲染循环
  function animate() {
    const dt = clock.getDelta();
    if (mixer) mixer.update(dt);
    requestAnimationFrame(animate);
    // scene.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
}

const taskResult: any =
    {
      sureIndex: null,//正确图片下标
      sureTipImage: null,//正确提示图
      images: null,//所有图
    }
const preview = ref<typeof taskResult>()

function taskEnd(){//渲染结束通知后端
  if(taskResult.images&&taskResult.sureTipImage&&taskResult.sureIndex>=0){
    callServer('render-end',taskResult)
    preview.value = taskResult;
    //console.log('任务成功')
  }else{
    //console.log('任务失败',taskResult)
  }
}

const positionsImages = ref<any[]>([]);//机器人在所有图标位置的截图
async function onTexture(positions: any[], canvas: any) {
  //中心为0.0 贴图模型宽*坐标百分比 - 宽/2
  const size = 16
  const texture = new THREE.CanvasTexture(canvas);
  const geometry = new THREE.BoxGeometry(size, size, 0.1);
  const material = new THREE.MeshBasicMaterial({map: texture, transparent: true});
  const authCube = new THREE.Mesh(geometry, material);

  authCube.rotation.x = -Math.PI / 2; // 使其平行于地面
  authCube.position.set(0, 0.02, 0); // 稍微抬起以避免与地面Z冲突
  scene.add(authCube);
  await timeout(20)
  for (const pos of positions) {
    const mx = pos.x * size - size / 2
    const my = pos.y * size - size / 2
    // console.log('robot位置:', mx, my, robot);
    robot?.position?.set(mx, 0, my);
    scene.rotation.y += 60;
    await timeout(20);
    //等待渲染保存压缩截图
    positionsImages.value.push(renderer.domElement.toDataURL('image/jpeg', 0.8));
    console.log('生成',pos)
  }

  taskResult.images = positionsImages.value;
  taskEnd();
}

function onSureImg(index:number,sureImg:any) {
  taskResult.sureIndex=index;
  taskResult.sureTipImage = sureImg;
  taskEnd();
}


</script>

<template>
  <div class="box">

<!--    <h1 >答案提示图</h1>-->
<!--    <img :src="preview?.sureTipImage" v-if="!query.headless">-->
<!--    <h1 >所有位置图</h1>-->
<!--    <div  class="pv"><img :src="img" v-for="img in preview?.images"></div>-->

    <h1>验证码贴图</h1>
    <captcha-texture @on-texture="onTexture" @on-sure-img="onSureImg"></captcha-texture>
    <h1>场景渲染</h1>
    <canvas ref="sceneCanvas" width="300" height="300"></canvas>
  </div>

</template>

<style scoped>
.box{
  display: flex;
  flex-direction: column;
  width: fit-content;
  max-width: 300px;
}

.pv{
  display: flex;
  flex-direction: row;
  gap: 5px;
}

</style>