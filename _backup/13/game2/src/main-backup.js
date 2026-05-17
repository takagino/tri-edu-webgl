// main.js
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let player;
let collectibles = [];
let score = 0;

//シーン
const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(0, 3, 5);
scene.add(camera);

// 環境マップの読み込み
const loader = new THREE.CubeTextureLoader();
const environmentMap = loader.load([
  'textures/cube/posx.jpg', // 右面
  'textures/cube/negx.jpg', // 左面
  'textures/cube/posy.jpg', // 上面
  'textures/cube/negy.jpg', // 下面
  'textures/cube/posz.jpg', // 前面
  'textures/cube/negz.jpg', // 背面
]);
scene.background = environmentMap;

//周囲光;
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

//コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 床
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x808080 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// プレイヤー（Box）
const gltfLoader = new GLTFLoader();

gltfLoader.load('/models/bear.gltf', (gltf) => {
  player = gltf.scene;
  player.scale.set(0.5, 0.5, 0.5);
  player.position.set(0, 1, 0);
  scene.add(player);

  // アイテム（球体）をランダムに配置
  for (let i = 0; i < 10; i++) {
    const x = (Math.random() - 0.5) * 16;
    const z = (Math.random() - 0.5) * 16;
    gltfLoader.load('/models/fish.gltf', (gltf) => {
      const item = gltf.scene;
      item.scale.set(0.5, 0.5, 0.5);
      item.position.set(x, 0.4, z);
      item.rotation.y = Math.random() * Math.PI * 2; // ランダムな回転
      scene.add(item);
      collectibles.push(item);
    });
  }

  update();
});

// スコア表示
const scoreDiv = document.createElement('div');
scoreDiv.id = 'score';
scoreDiv.style.position = 'absolute';
scoreDiv.style.top = '10px';
scoreDiv.style.left = '10px';
scoreDiv.style.color = 'white';
scoreDiv.style.fontSize = '20px';
scoreDiv.innerText = 'Score: 0';
document.body.appendChild(scoreDiv);
const startTime = Date.now();
let isGameCleared = false;

// プレイタイム表示
const timeDiv = document.createElement('div');
timeDiv.id = 'playtime';
timeDiv.style.position = 'absolute';
timeDiv.style.top = '40px';
timeDiv.style.left = '10px';
timeDiv.style.color = 'white';
timeDiv.style.fontSize = '20px';
timeDiv.innerText = 'Time: 0.0s';
document.body.appendChild(timeDiv);

// キーボード操作
const keyState = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
  ' ': false,
};

let isJumping = false;
let velocityY = 0;
const gravity = -0.01;

window.addEventListener('keydown', (event) => {
  if (event.key in keyState) keyState[event.key] = true;

  // ジャンプ処理
  if (keyState[' '] && !isJumping) {
    isJumping = true;
    velocityY = 0.2;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key in keyState) keyState[event.key] = false;
});

const update = () => {
  if (!isGameCleared) {
    const now = Date.now();
    const elapsedSec = ((now - startTime) / 1000).toFixed(1);
    timeDiv.innerText = `Time: ${elapsedSec}s`;
  }

  const speed = 0.1;
  if (keyState.w || keyState.ArrowUp) {
    player.position.z -= speed;
    player.rotation.y = Math.PI;
  }
  if (keyState.s || keyState.ArrowDown) {
    player.position.z += speed;
    player.rotation.y = 0;
  }
  if (keyState.a || keyState.ArrowLeft) {
    player.position.x -= speed;
    player.rotation.y = -Math.PI / 2;
  }
  if (keyState.d || keyState.ArrowRight) {
    player.position.x += speed;
    player.rotation.y = Math.PI / 2;
  }

  // === 移動後の床範囲制限 ===
  const limit = 9.5; // プレイヤーの半径分を差し引いた制限
  player.position.x = THREE.MathUtils.clamp(player.position.x, -limit, limit);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -limit, limit);

  // ジャンプ処理
  if (isJumping) {
    player.position.y += velocityY;
    velocityY += gravity;

    // 地面に着地したらジャンプ終了
    if (player.position.y <= 0.5) {
      player.position.y = 0.5;
      isJumping = false;
      velocityY = 0;
    }
  }

  collectibles.forEach((item, index) => {
    const distance = player.position.distanceTo(item.position);
    if (distance < 1) {
      // 取得処理
      scene.remove(item);
      collectibles.splice(index, 1);
      score++;
      document.getElementById('score').innerText = `Score: ${score}`;

      // ゲームクリア判定
      if (collectibles.length === 0 && !isGameCleared) {
        isGameCleared = true;
        const clearTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const win = document.createElement('div');
        win.innerText = `🎉 Game Clear! 🎉\nTime: ${clearTime}s`;
        win.style.position = 'absolute';
        win.style.top = '50%';
        win.style.left = '50%';
        win.style.transform = 'translate(-50%, -50%)';
        win.style.color = 'yellow';
        win.style.fontSize = '32px';
        win.style.fontWeight = 'bold';
        document.body.appendChild(win);
      }
    }
  });

  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(update);
};

//ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
