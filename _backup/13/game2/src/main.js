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
// 床
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x808080 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 3Dモデルの読み込み
let player;
const gltfLoader = new GLTFLoader();
const collectibles = [];

gltfLoader.load('/models/bear.gltf', (gltf) => {
  player = gltf.scene;
  player.scale.set(0.5, 0.5, 0.5);
  player.position.set(0, 1, 0);
  scene.add(player);

  // モデルを読み込み配列に追加
  for (let i = 0; i < 10; i++) {
    const x = (Math.random() - 0.5) * 16; // -8〜8
    const z = (Math.random() - 0.5) * 16;

    gltfLoader.load('/models/fish.gltf', (gltf) => {
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

let isJumping = false;
let velocityY = 0;
const gravity = -0.01;

// キーを押したとき
window.addEventListener('keydown', (event) => {
  if (event.key in keyState) keyState[event.key] = true;

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
