import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// シーン
const scene = new THREE.Scene();

// カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.set(0, 3, 5);
scene.add(camera);

// 周囲光
const light = new THREE.AmbientLight(0xffffff, 5);
scene.add(light);

// レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

// コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* 1. ここから追加 */
let score = 0;

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

// プレイタイム表示
const startTime = Date.now();
let isGameCleared = false;
const timeDiv = document.createElement('div');
timeDiv.id = 'playtime';
timeDiv.style.position = 'absolute';
timeDiv.style.top = '40px';
timeDiv.style.left = '10px';
timeDiv.style.color = 'white';
timeDiv.style.fontSize = '20px';
timeDiv.innerText = 'Time: 0.0s';
document.body.appendChild(timeDiv);

// 床
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x808080 })
);
floor.rotation.x = -Math.PI / 2; // 横向きから地面へ
scene.add(floor);

// 3Dモデルの読み込み
let player; // update関数内でも使用するた予め宣言しておく
const gltfLoader = new GLTFLoader();
const collectibles = [];

gltfLoader.load('models/bear.gltf', (gltf) => {
  player = gltf.scene;
  player.scale.set(0.5, 0.5, 0.5);
  player.position.set(0, 1, 0);
  scene.add(player);

  // モデルを読み込み配列に追加
  for (let i = 0; i < 10; i++) {
    const x = (Math.random() - 0.5) * 16; // -8〜8
    const z = (Math.random() - 0.5) * 16;

    gltfLoader.load('models/fish.gltf', (gltf) => {
      const item = gltf.scene;
      item.scale.set(0.5, 0.5, 0.5);
      item.position.set(x, 0.4, z);
      item.rotation.y = Math.random() * Math.PI * 2; // ランダムな向き
      scene.add(item);
      collectibles.push(item);
    });
  }

  update();
});

// キーボード入力の状態管理
const keyState = {
  w: false,
  a: false,
  s: false,
  d: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

// 変数追加
let isJumping = false;
let velocityY = 0;
const gravity = -0.01;

// キーを押したとき
window.addEventListener('keydown', (event) => {
  if (event.key in keyState) keyState[event.key] = true;

  // ジャンプ処理
  if (event.key === ' ' && !isJumping) {
    isJumping = true;
    velocityY = 0.2; // 初速（上方向）
  }
});

// キーを離したとき
window.addEventListener('keyup', (event) => {
  if (event.key in keyState) keyState[event.key] = false;
});

// 更新
const update = () => {
  /* 2. ここから追加 */
  if (!isGameCleared) {
    const now = Date.now();
    const elapsedSec = ((now - startTime) / 1000).toFixed(1);
    timeDiv.innerText = `Time: ${elapsedSec}s`;
  }

  if (player) {
    const speed = 0.1;

    if (keyState.w || keyState.ArrowUp) {
      player.position.z -= speed;
      player.rotation.y = Math.PI; // 前向き
    }
    if (keyState.s || keyState.ArrowDown) {
      player.position.z += speed;
      player.rotation.y = 0; // 後ろ向き
    }
    if (keyState.a || keyState.ArrowLeft) {
      player.position.x -= speed;
      player.rotation.y = -Math.PI / 2; // 左向き
    }
    if (keyState.d || keyState.ArrowRight) {
      player.position.x += speed;
      player.rotation.y = Math.PI / 2; // 右向き
    }

    // ジャンプ処理
    if (isJumping) {
      player.position.y += velocityY;
      velocityY += gravity;

      // 着地判定
      if (player.position.y <= 1) {
        player.position.y = 1;
        isJumping = false;
        velocityY = 0;
      }
    }
  }

  // 床の外に出ないように制限
  const limit = 9.5; // 20の半分 - プレイヤーの半径（=0.5）
  player.position.x = THREE.MathUtils.clamp(player.position.x, -limit, limit);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -limit, limit);

  collectibles.forEach((item, index) => {
    const distance = player.position.distanceTo(item.position);

    // 距離が近くなったらアイテムを削除する
    if (distance < 1) {
      scene.remove(item);
      collectibles.splice(index, 1);
      score++;
      document.getElementById('score').innerText = `Score: ${score}`;

      if (collectibles.length === 0 && !isGameCleared) {
        isGameCleared = true;
        const clearTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const win = document.createElement('div');
        win.innerText = `Game Clear! \n Time: ${clearTime}s`;
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

//update();

// ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
