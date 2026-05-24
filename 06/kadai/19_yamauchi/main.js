import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import GUI from 'lil-gui';

/* 初期設定
---------------------------------------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb0c4de);

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(10, 10);
//scene.add(gridHelper);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 5;

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

/* Floating background
---------------------------------------- */
const floaterGroup = new THREE.Group();
scene.add(floaterGroup);

const getViewSizeAtZ = (camera, z) => {
  const distance = camera.position.z - z;
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(vFov / 2) * distance;
  const width = height * camera.aspect;
  return { width, height };
};

const createSoftCircleTexture = () => {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    0,
    size * 0.5,
    size * 0.5,
    size * 0.5,
  );
  gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const floaterTexture = createSoftCircleTexture();
const floaters = [];
const FLOAT_COUNT = 45;
const floatBounds = {
  width: 0,
  height: 0,
  zMin: -9,
  zMax: -4,
};

const updateFloatBounds = () => {
  const targetZ = (floatBounds.zMin + floatBounds.zMax) * 0.5;
  const view = getViewSizeAtZ(camera, targetZ);
  floatBounds.width = view.width;
  floatBounds.height = view.height;
};

updateFloatBounds();

const resetFloater = (sprite, spawnAnywhere = false) => {
  const data = sprite.userData;
  const size = Math.random() * 0.6 + 0.2;
  const yMin = -floatBounds.height * 0.5;
  const yMax = floatBounds.height * 0.5;

  data.baseX = (Math.random() - 0.5) * floatBounds.width;
  data.baseZ = floatBounds.zMin + Math.random() * (floatBounds.zMax - floatBounds.zMin);
  data.speed = Math.random() * 0.006 + 0.004;
  data.swing = Math.random() * 0.5 + 0.2;
  data.phase = Math.random() * Math.PI * 2;
  data.swingSpeed = Math.random() * 0.02 + 0.01;
  data.maxOpacity = Math.random() * 0.35 + 0.15;

  const startY = spawnAnywhere
    ? yMin + Math.random() * (yMax - yMin)
    : yMin - Math.random() * (floatBounds.height * 0.4 + 1);
  sprite.position.set(data.baseX, startY, data.baseZ);
  sprite.scale.set(size, size, 1);
  sprite.material.opacity = spawnAnywhere ? data.maxOpacity : 0;
};

for (let i = 0; i < FLOAT_COUNT; i++) {
  const material = new THREE.SpriteMaterial({
    map: floaterTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  resetFloater(sprite, true);
  floaters.push(sprite);
  floaterGroup.add(sprite);
}

const updateFloaters = () => {
  const yMin = -floatBounds.height * 0.5;
  const yMax = floatBounds.height * 0.5;
  floaters.forEach((sprite) => {
    const data = sprite.userData;
    sprite.position.y += data.speed;
    data.phase += data.swingSpeed;

    sprite.position.x = data.baseX + Math.sin(data.phase) * data.swing;
    sprite.position.z = data.baseZ + Math.cos(data.phase * 0.7) * data.swing;

    const t = (sprite.position.y - yMin) / (yMax - yMin);
    const clamped = Math.min(Math.max(t, 0), 1);
    let fade = 1;
    if (clamped < 0.2) fade = clamped / 0.2;
    if (clamped > 0.8) fade = (1 - clamped) / 0.2;
    sprite.material.opacity = data.maxOpacity * fade;

    if (sprite.position.y > yMax) resetFloater(sprite);
  });
};



const gltfLoader = new GLTFLoader();
const gltf = await gltfLoader.loadAsync('./hugu1.glb');
const originalFugu = gltf.scene;
const fugus = [];

for (let i = 0; i < 100; i++) {
  const fugu = originalFugu.clone();

  fugu.position.set(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20,
  );

  fugu.rotation.x = Math.random() * Math.PI * 2;
  fugu.rotation.y = Math.random() * Math.PI * 2;

  const s = Math.random() * 0.4 + 0.1;
  fugu.scale.set(s, s, s);

  fugus.push(fugu);
  scene.add(fugu);
}



const fontLoader = new FontLoader();
const font = await fontLoader.loadAsync('./Pacifico_Regular.json');

const clockGroup = new THREE.Group();
scene.add(clockGroup);

const baseGeometry = new RoundedBoxGeometry(3.5, 1.5, 1, 6, 0.18);
const baseMaterial = new THREE.MeshStandardMaterial({
  color: 0x4682b4,
});
const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
baseMesh.position.z = -0.3;
clockGroup.add(baseMesh);

const textGroup = new THREE.Group();
clockGroup.add(textGroup);

let currentSeconds = -1;

const updateClock = () => {
  const now = new Date();

  if (currentSeconds === now.getSeconds()) return;
  currentSeconds = now.getSeconds();

  textGroup.clear();

  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  const ms = now.getMilliseconds();
  const timeString = `${h}:${m}:${s}`;

  const textGeometry = new TextGeometry(timeString, {
    font: font,
    size: 0.5,
    depth: 0.5,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
  });

  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0xe6de55,
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textGeometry.center();
  textGroup.add(textMesh);
};


/* 表示の更新（アニメーション）
---------------------------------------- */
const update = () => {
  window.requestAnimationFrame(update);
  stats.update();

  updateClock();
  updateFloaters();
  //clockGroup.rotation.y += 0.01;

  fugus.forEach((fugu) => {
    fugu.position.z += 0.05;
    if (fugu.position.z > 10) fugu.position.z = -10;
  });

  renderer.render(scene, camera);
};

update();


/* ブラウザリサイズの処理
---------------------------------------- */
const onWindowResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  updateFloatBounds();
  floaters.forEach((sprite) => resetFloater(sprite, true));
};

window.addEventListener('resize', onWindowResize);