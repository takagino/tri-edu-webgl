import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import GUI from 'lil-gui';

const scene = new THREE.Scene();

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const gui = new GUI();

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 5;

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const bufferGeometry = new THREE.BufferGeometry();
const count = 2000;
const vertices = new Float32Array(count * 3);
const colors = new Float32Array(count * 3); //配列の追加

for (let i = 0; i < count * 3; i++) {
  vertices[i] = (Math.random() - 0.5) * 10;
  colors[i] = Math.random(); //ランダムな値を代入
}
console.log(vertices);
bufferGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
bufferGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); //追加

const textureLoader = new THREE.TextureLoader();
const texture = await textureLoader.loadAsync('./textures/1.png');

const pointsMaterial = new THREE.PointsMaterial({
  size: 0.5,
  sizeAttenuation: true,
  vertexColors: true, //変更
  alphaMap: texture,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(bufferGeometry, pointsMaterial);
scene.add(particles);

gui.add(pointsMaterial, 'size', 0.01, 0.5, 0.01).name('パーティクルサイズ');

const clock = new THREE.Clock();

const update = () => {
  window.requestAnimationFrame(update);
  stats.update();

  const elapsedTime = clock.getElapsedTime();
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = bufferGeometry.attributes.position.array[i3];
    bufferGeometry.attributes.position.array[i3 + 1] = Math.sin(
      elapsedTime + x,
    );
    bufferGeometry.attributes.position.needsUpdate = true; // 追加
  }

  renderer.render(scene, camera);
};

update();

const onWindowResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

window.addEventListener('resize', onWindowResize);
