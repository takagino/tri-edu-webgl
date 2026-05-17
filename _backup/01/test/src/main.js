import './style.css';
import * as THREE from 'three';

// 1. シーンの作成
const scene = new THREE.Scene();

// 2. カメラの作成
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.z = 5;

// 3. レンダラーの作成
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 4. ジオメトリ（形状）の作成： 幅1, 高さ1, 奥行き1の立方体
const geometry = new THREE.BoxGeometry(1, 1, 1);

// 5. マテリアル（質感）の作成： 光がなくても立体感がわかるノーマルマテリアル
const material = new THREE.MeshNormalMaterial();

// 6. メッシュで組み合わせる（形状 + 質感）
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 7. アニメーション（毎フレーム更新）
const update = () => {
  window.requestAnimationFrame(update);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
};

update();

// 8. ウィンドウのリサイズに対応
const onWindowResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

window.addEventListener('resize', onWindowResize);
