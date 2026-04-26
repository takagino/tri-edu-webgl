import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';
import GUI from 'lil-gui';

// stats.js（パフォーマンスメーター）の設定
const stats = new Stats();
stats.showPanel(0); // 0: FPS（コマ数）を表示
document.body.appendChild(stats.dom);

// 1. シーンの作成
const scene = new THREE.Scene();

// AxesHelper(線の長さ)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// GridHelper(全体のサイズ, マス目の数)
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// 2. カメラの作成
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(3, 5, 10);

// 3. レンダラーの作成
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// OrbitControls(操作するカメラ, イベントを検知する画面)
const controls = new OrbitControls(camera, renderer.domElement);

// lil-gui（調整用パネル）の設定
const gui = new GUI();

// ----------------------------------
// ① 環境光（AmbientLight）
// 全体を均等に照らす（色, 強度）
// ----------------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0); // 最初は強度0（真っ暗）にしておく
scene.add(ambientLight);

// GUIパネルに「周囲光」というフォルダ（グループ）を作ってまとめる
const guiAmbient = gui.addFolder('周囲光 (Ambient)');
guiAmbient.addColor(ambientLight, 'color').name('色');
guiAmbient.add(ambientLight, 'intensity', 0, 5).name('強度');

// ----------------------------------
// ② 平行光（DirectionalLight）
// 特定の方向から照らす（色, 強度）
// ----------------------------------
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1); // 光の来る方向（斜め上）
scene.add(directionalLight);

// どこから光が来ているかを見えるようにする「ヘルパー（目印）」
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
);
// scene.add(directionalLightHelper);

// GUIパネルに登録
const guiDirectional = gui.addFolder('平行光 (Directional)');
guiDirectional.addColor(directionalLight, 'color').name('色');
guiDirectional.add(directionalLight, 'intensity', 0, 5).name('強度');

// ----------------------------------
// ③ 半球光（HemisphereLight）
// 空と地面の色で照らす（空の色, 地面の色, 強度）
// ----------------------------------
const hemisphereLight = new THREE.HemisphereLight(0x02051c, 0x132a4e, 3); // 水色と黄色
scene.add(hemisphereLight);

// 半球光のヘルパー
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight);
// scene.add(hemisphereLightHelper);

// GUIパネルに登録
const guiHemisphere = gui.addFolder('半球光 (Hemisphere)');
guiHemisphere.addColor(hemisphereLight, 'color').name('空の色');
guiHemisphere.addColor(hemisphereLight, 'groundColor').name('地面の色');
guiHemisphere.add(hemisphereLight, 'intensity', 0, 5).name('強度');

// ----------------------------------
// ④ 点光源（PointLight）
// 電球のように周囲を照らす（色, 強度, 届く距離）
// ----------------------------------
const pointLight = new THREE.PointLight(0xffaa00, 10, 10); // オレンジ色の光
pointLight.position.set(-1, 4, -1); // モデルの少し上に配置
scene.add(pointLight);

// 点光源のヘルパー
const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
// scene.add(pointLightHelper);

// GUIパネルに登録
const guiPoint = gui.addFolder('点光源 (Point)');
guiPoint.add(pointLight, 'intensity', 0, 10).name('強度');
guiPoint.add(pointLight.position, 'x', -5, 5).name('位置 X');
guiPoint.add(pointLight.position, 'y', -5, 5).name('位置 Y');
guiPoint.add(pointLight.position, 'z', -5, 5).name('位置 Z');

// ----------------------------------
// ⑤ スポットライト（SpotLight）
// 特定の範囲を照らす（色, 強度）
// ----------------------------------
const spotLight = new THREE.SpotLight(0xffffff, 20);
spotLight.position.set(0, 5, 5); // 少し高くて手前から
spotLight.angle = Math.PI / 0.6; // 光の広がる角度
scene.add(spotLight);

// スポットライトのヘルパー
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);

// GUIパネルに登録
const guiSpot = gui.addFolder('スポットライト (Spot)');
guiSpot.add(spotLight, 'intensity', 0, 20).name('強度');
guiSpot.add(spotLight, 'angle', 0, Math.PI / 2).name('角度');

// 5. モデルの読み込み 【新規】
const loader = new GLTFLoader();
loader.load('./furniture.glb', (gltf) => {
  const model = gltf.scene;
  scene.add(model);

  model.position.y = 1.6;

  const guiModel = gui.addFolder('モデルの調整');

  guiModel.add(model.position, 'x', -5, 5, 0.1).name('位置 X');
  guiModel.add(model.position, 'y', -5, 5, 0.1).name('位置 Y');
  guiModel.add(model.position, 'z', -5, 5, 0.1).name('位置 Z');

  guiModel.add(model.rotation, 'x', -Math.PI, Math.PI, 0.1).name('回転 X');
  guiModel.add(model.rotation, 'y', -Math.PI, Math.PI, 0.1).name('回転 Y');
  guiModel.add(model.rotation, 'z', -Math.PI, Math.PI, 0.1).name('回転 Z');

  // 【変更】サイズ（Scale）の一括調整
  // 1. 一括変更用の数値を保持する「仲介役のオブジェクト」を作る
  const scaleParams = {
    uniformScale: 1, // 初期値
  };

  // 2. GUIに登録し、onChangeでモデルのscaleすべてに値をセットする
  guiModel
    .add(scaleParams, 'uniformScale', 0.1, 5, 0.1)
    .name('サイズ（一括）')
    .onChange((value) => {
      // スライダーの値(value)が変わるたびに、モデルのX, Y, Zすべてにその値を適用する
      model.scale.set(value, value, value);
    });
  // ---------------------------------
});

// 6. アニメーション（毎フレーム更新）
const update = () => {
  window.requestAnimationFrame(update);
  stats.update();
  renderer.render(scene, camera);
};

update();

// 7. ウィンドウのリサイズに対応
const onWindowResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

window.addEventListener('resize', onWindowResize);
