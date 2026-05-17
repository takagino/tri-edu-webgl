import * as THREE from "three";
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

gsap.registerPlugin(ScrollTrigger);

//UIデバッグ
const gui = new GUI();

//FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);


/*--------------------
必須項目
--------------------*/

//キャンバスの取得
const canvas = document.querySelector("#webgl");

//サイズ
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//シーン
const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 0, 6);
scene.add(camera);

//ライト
const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.set(0.5, 1, 0);
scene.add(directionalLight);

//レンダラー
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);

renderer.render(scene, camera);

//オブジェクトの追加
const boxGeometry = new THREE.SphereGeometry( 10, 32, 16 );
const boxMaterial = new THREE.MeshNormalMaterial();
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 0.5, -15);
box.rotation.set(1, 1, 0);

scene.add(box);

//GLTFデータの読み込み
const group = new THREE.Group();
scene.add(group);

const gltfLoader = new GLTFLoader();
gltfLoader.load("models/scene.gltf", (gltf) => {
  gltf.scene.scale.set(0.03, 0.03, 0.03);
  gltf.scene.position.set(-3, 0, 0);
  gltf.scene.rotation.set(-1, 0, -0.3);
  group.add(gltf.scene);
});

/*--------------------
イベント時の処理
--------------------*/

window.addEventListener("resize", () => {
  //サイズのアップデート
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //カメラのアップデート
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //レンダラーのアップデート
  renderer.setSize(sizes.width, sizes.height);
});

//アニメーション
const clock = new THREE.Clock();

const animate = () => {
  stats.begin();
  renderer.render(scene, camera);
  stats.end();

  const elapsedTime = clock.getElapsedTime();
  //group.rotation.z = elapsedTime;
  box.scale.x = Math.tan(elapsedTime);
  box.scale.y = Math.cos(elapsedTime);
  box.scale.z = Math.sin(elapsedTime);
  // box.position.x = Math.tan(elapsedTime)*0.001;
  // box.position.y = Math.cos(elapsedTime)*0.001;
  // box.position.z = Math.sin(elapsedTime)*0.001;

  requestAnimationFrame(animate);
};

animate();

gsap.fromTo(
  group.rotation,
  {},
  {
    x: 3,
    scrollTrigger: {
      trigger: ".about",
      start: "top 80%",
      end: "bottom 20%",
      markers: false,
      scrub: true,
    },
  }
);
