import './style.css';
import * as THREE from 'three';
import GUI from 'lil-gui';
import Stats from 'stats-js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

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

/* Cannon-es ここから */

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const rubber = new CANNON.Material('rubber');
const concrete = new CANNON.Material('concrete');

const rubberConcrete = new CANNON.ContactMaterial(rubber, concrete, {
  friction: 0.6,
  restitution: 0.5,
});
world.addContactMaterial(rubberConcrete);

const rubberRubber = new CANNON.ContactMaterial(rubber, rubber, {
  friction: 1,
  restitution: 1,
});
world.addContactMaterial(rubberRubber);

const objects = [];

const createObj = (x = 0, y = 0, z = 0, size = 0.5) => {
  const mtlLoader = new MTLLoader();
  mtlLoader.load('models/Panda/Panda.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('models/Panda/Panda.obj', (object) => {
      object.position.set(x, y, z);
      object.scale.set(size, size, size);
      scene.add(object);

      const body = new CANNON.Body({
        mass: 1,
        material: rubber,
        position: new CANNON.Vec3(x, y, z),
        shape: new CANNON.Sphere(size),
      });
      world.addBody(body);

      objects.push({
        mesh: object,
        body: body,
      });
    });
  });
};

createObj(0, 10, 0, 0.5);

const spheres = [];

const createSphere = (x = 0, y = 10, z = 0, size = 0.5) => {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffff00,
    })
  );
  scene.add(sphere);

  const sphereBody = new CANNON.Body({
    mass: 1,
    material: rubber,
    position: new CANNON.Vec3(x, y, z),
    shape: new CANNON.Sphere(size),
  });
  world.addBody(sphereBody);

  spheres.push({
    mesh: sphere,
    body: sphereBody,
  });
};

for (let i = 0; i < 100; i++) {
  createSphere(
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5,
    Math.random() * 0.5 + 0.1
  );
}

const boxes = [];

const createBox = (x = 0, y = 10, z = 0, size = 1) => {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshBasicMaterial({
      color: 0xff00ff,
    })
  );
  scene.add(box);

  const boxBody = new CANNON.Body({
    mass: 1,
    material: rubber,
    position: new CANNON.Vec3(x, y, z),
    shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
  });
  world.addBody(boxBody);

  boxes.push({
    mesh: box,
    body: boxBody,
  });
};

window.addEventListener('click', () => {
  createObj(
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5,
    Math.random() * 0.5 + 0.1
  );
  createBox(
    Math.random() * 10 - 5,
    Math.random() * 10 + 5,
    Math.random() * 10 - 5,
    Math.random() * 0.5 + 0.1
  );
});

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(10, 1, 10),
  new THREE.MeshBasicMaterial({
    color: 0x777777,
  })
);
scene.add(floor);

const floorBody = new CANNON.Body({
  mass: 0,
  material: concrete,
  shape: new CANNON.Box(new CANNON.Vec3(5, 0.5, 5)),
});
world.addBody(floorBody);

floorBody.position.copy(floor.position);
floorBody.quaternion.copy(floor.quaternion);

/* Cannon-es ここまで */

const update = () => {
  stats.begin();

  world.fixedStep();

  //追加
  objects.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  spheres.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

  boxes.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  });

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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  // スクリーン座標を -1〜1 に変換
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // 全オブジェクトを対象に交差判定
  const allMeshes = [
    ...objects.map((o) => o.mesh),
    ...spheres.map((s) => s.mesh),
    ...boxes.map((b) => b.mesh),
  ];

  const intersects = raycaster.intersectObjects(allMeshes);

  if (intersects.length > 0) {
    const hit = intersects[0].object;

    // メッシュの色を変更
    if (hit.material && hit.material.color) {
      hit.material.color.set(0x00ffff); // シアン色に変更
    }

    // 物理オブジェクトに力を加える
    const target = [...objects, ...spheres, ...boxes].find((o) => o.mesh === hit);

    if (target) {
      const force = new CANNON.Vec3(0, 5, 0); // 上に向かって力を加える
      target.body.applyImpulse(force, target.body.position);
    }
  }
});
