import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import GUI from 'lil-gui';
import Stats from 'stats-js';
import * as CANNON from 'cannon-es';

console.log(CANNON);

//UIデバッグ
const gui = new GUI();

//FPSデバッグ
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

//シーン
const scene = new THREE.Scene();

//カメラ
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 15;
scene.add(camera);

//周囲光;
const light = new THREE.AmbientLight(0xffffff, 10);
scene.add(light);

//軸ヘルパー
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

//レンダラー
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

//コントロール
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const N = 100; // 物理オブジェクトの数
const objects = []; // 物理オブジェクトとメッシュの対応を格納する配列

//Cannon.jsの物理世界
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // 重力を設定（-9.82：地球上の重力定数）

// Cannon.jsの物理世界の設定
const concreteMaterial = new CANNON.Material('concrete');
const plasticMaterial = new CANNON.Material('plastic');

const concretePlasticContactMaterial = new CANNON.ContactMaterial(
  concreteMaterial,
  plasticMaterial,
  {
    friction: 0.5,
    restitution: 0.7,
  }
);
world.addContactMaterial(concretePlasticContactMaterial);

const plasticPlasticContactMaterial = new CANNON.ContactMaterial(plasticMaterial, plasticMaterial, {
  friction: 0.5,
  restitution: 0.5,
});
world.addContactMaterial(plasticPlasticContactMaterial);

const createObj = (x, y, z) => {
  const mtlLoader = new MTLLoader();
  mtlLoader.load('models/kuma/kuma.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('models/kuma/kuma.obj', (object) => {
      object.position.set(x, y, z);
      object.scale.set(0.5, 0.5, 0.5);
      scene.add(object);

      const body = new CANNON.Body({
        mass: 1,
        material: plasticMaterial,
        position: new CANNON.Vec3(x, y, z),
        shape: new CANNON.Sphere(1),
      });
      body.quaternion.setFromEuler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      world.addBody(body);

      objects.push({
        mesh: object,
        body: body,
      });
    });
  });
};

const createSphere = (x, y, z) => {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(Math.random() * 0xffffff),
    })
  );
  scene.add(sphere);

  const sphereBody = new CANNON.Body({
    mass: 1, // 質量
    material: plasticMaterial,
    position: new CANNON.Vec3(x, y, z), // 初期位置
    shape: new CANNON.Sphere(Math.random() + 0.5), // 半径
  });
  world.addBody(sphereBody);

  objects.push({
    mesh: sphere,
    body: sphereBody,
  });
};

const createFloor = () => {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({
      color: '#777777',
    })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const floorBody = new CANNON.Body({
    mass: 0,
    material: concreteMaterial,
    shape: new CANNON.Plane(),
  });
  world.addBody(floorBody);
  floorBody.position.copy(floor.position);
  floorBody.quaternion.copy(floor.quaternion);
};

const createBox = () => {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(100, 1, 100),
    new THREE.MeshBasicMaterial({
      color: '#333333',
    })
  );
  scene.add(box);

  const boxBody = new CANNON.Body({
    mass: 0,
    material: concreteMaterial,
    shape: new CANNON.Box(new CANNON.Vec3(50, 0.5, 50)), //halfExtents（半分の範囲）
  });
  world.addBody(boxBody);
  boxBody.position.copy(box.position);
  boxBody.quaternion.copy(box.quaternion);
};

//物理オブジェクトの生成
for (let i = 0; i < N; i++) {
  createSphere(Math.random() * 10 - 5, Math.random() * 10 + 5, Math.random() * 10 - 5);
}
createBox();

window.addEventListener('click', () => {
  createObj(Math.random() * 10 - 5, 10, Math.random() * 10 - 5);
});

//更新
const update = () => {
  stats.begin();

  //物理世界の更新
  for (let i = 0; i < objects.length; i++) {
    objects[i].mesh.position.copy(objects[i].body.position);
    objects[i].mesh.quaternion.copy(objects[i].body.quaternion);
  }
  world.fixedStep();

  renderer.render(scene, camera);
  controls.update();
  stats.end();
  window.requestAnimationFrame(update);
};

update();

//ウィンドウリサイズ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
