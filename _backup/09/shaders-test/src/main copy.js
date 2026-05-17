import './style.css';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

/* ------------------------------
基本設定
------------------------------ */
const scene = new THREE.Scene();

// カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;
scene.add(camera);

// レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 軸ヘルパー（任意）
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

// マウスコントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

/* ------------------------------
テクスチャとジオメトリ
------------------------------ */

// テクスチャ
const textureLoader = new THREE.TextureLoader();
const flagTexture = textureLoader.load('/textures/flag-french.jpg');

// ジオメトリ
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

const count = geometry.attributes.position.count;
const randoms = new Float32Array(count).map(() => Math.random());
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

// シェーダーのユニフォーム
const uniforms = {
  uFrequency: { value: new THREE.Vector2(10, 5) },
  uTime: { value: 0 },
  uColor: { value: new THREE.Color('orange') },
  uTexture: { value: flagTexture },
};

// シェーダーマテリアル
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
});

// メッシュの作成
const mesh = new THREE.Mesh(geometry, material);
mesh.scale.y = 2 / 3;
scene.add(mesh);

/* ------------------------------
GUIコントロール
------------------------------ */
const gui = new GUI();
gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('frequencyX');
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('frequencyY');

/* ------------------------------
更新
------------------------------ */
const clock = new THREE.Clock();

const update = () => {
  material.uniforms.uTime.value = clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(update);
};

update();

/* ------------------------------
ウィンドウリサイズ
------------------------------ */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
