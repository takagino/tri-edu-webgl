import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import GUI from 'lil-gui';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x404040);

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

const gltfLoader = new GLTFLoader();
const gltf = await gltfLoader.loadAsync('./fugu.glb');
const fugu = gltf.scene;

const fontLoader = new FontLoader();
const font = await fontLoader.loadAsync('./helvetiker_regular.typeface.json');

const clockGroup = new THREE.Group();
scene.add(clockGroup);

const baseGeometry = new THREE.BoxGeometry(3.5, 1.5, 1);
const baseMaterial = new THREE.MeshStandardMaterial({
  color: 0x2b6270,
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

const fugus = [];

for (let i = 0; i < 100; i++) {
  const fuguClone = fugu.clone();

  fuguClone.position.set(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 20,
  );

  fuguClone.rotation.y = Math.random() * Math.PI * 2;

  const s = Math.random() * 0.5 + 0.1;
  fuguClone.scale.set(s, s, s);

  fugus.push(fuguClone);
  scene.add(fuguClone);
}

const update = () => {
  window.requestAnimationFrame(update);
  stats.update();

  updateClock();
  clockGroup.rotation.x += 0.005;
  clockGroup.rotation.y += 0.005;

  fugus.forEach((fugu) => {
    fugu.position.z += 0.05;
    if (fugu.position.z > 10) fugu.position.z = -10;
  });

  renderer.render(scene, camera);
};

update();

const onWindowResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

window.addEventListener('resize', onWindowResize);
