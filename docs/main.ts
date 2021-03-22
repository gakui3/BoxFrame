import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

import testVert from './shaders/test.vert';
import testFrag from './shaders/test.frag';
import { MathUtils } from 'three';

const params = {
  exposure: 1,
  Strength: 1.0,
  Threshold: 0.0,
  Radius: 0.2,
};

let canvas: any, renderer, scene, camera, geometry, gui, composer, clock, bloomPass, material;
function init() {
  canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({ canvas });
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  clock = new THREE.Clock();
}

function addCamera() {
  camera = new THREE.PerspectiveCamera(45, 800 / 600, 0.1, 100);
  camera.position.set(0, 0, -10);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  controls.enableZoom = false;
  controls.update();
}

function addEffect() {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  //composer.setSize(canvas.clientWidth, canvas.clientHeight);

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1,
    1,
    1
  );
  bloomPass.threshold = params.Threshold;
  bloomPass.strength = params.Strength;
  bloomPass.radius = params.Radius;
  bloomPass.renderToScreen = true;
  composer.addPass(bloomPass);

  scene.fog = new THREE.Fog(0x000000, 0, 20);
}

function createCube() {
  material = new THREE.LineBasicMaterial({
    color: 0x696969,
  });

  let parent = new THREE.Object3D();

  const points: THREE.Vector3[] = [];
  points.push(new THREE.Vector3(-1, 1, 0));
  points.push(new THREE.Vector3(-1, -1, 0));
  points.push(new THREE.Vector3(1, -1, 0));
  points.push(new THREE.Vector3(1, 1, 0));
  points.push(new THREE.Vector3(-1, 1, 0));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const front = new THREE.Line(geometry, material);
  parent.add(front);

  const points_back: THREE.Vector3[] = [];
  points_back.push(new THREE.Vector3(-1, 1, 2));
  points_back.push(new THREE.Vector3(-1, -1, 2));
  points_back.push(new THREE.Vector3(1, -1, 2));
  points_back.push(new THREE.Vector3(1, 1, 2));
  points_back.push(new THREE.Vector3(-1, 1, 2));
  const geometry_back = new THREE.BufferGeometry().setFromPoints(points_back);
  const back = new THREE.Line(geometry_back, material);
  parent.add(back);

  const points_line1: THREE.Vector3[] = [];
  points_line1.push(new THREE.Vector3(-1, 1, 0));
  points_line1.push(new THREE.Vector3(-1, 1, 2));
  const geometry_line1 = new THREE.BufferGeometry().setFromPoints(points_line1);
  const line1 = new THREE.Line(geometry_line1, material);
  parent.add(line1);

  const points_line2: THREE.Vector3[] = [];
  points_line2.push(new THREE.Vector3(-1, -1, 0));
  points_line2.push(new THREE.Vector3(-1, -1, 2));
  const geometry_line2 = new THREE.BufferGeometry().setFromPoints(points_line2);
  const line2 = new THREE.Line(geometry_line2, material);
  parent.add(line2);

  const points_line3: THREE.Vector3[] = [];
  points_line3.push(new THREE.Vector3(1, -1, 0));
  points_line3.push(new THREE.Vector3(1, -1, 2));
  const geometry_line3 = new THREE.BufferGeometry().setFromPoints(points_line3);
  const line3 = new THREE.Line(geometry_line3, material);
  parent.add(line3);

  const points_line4: THREE.Vector3[] = [];
  points_line4.push(new THREE.Vector3(1, 1, 0));
  points_line4.push(new THREE.Vector3(1, 1, 2));
  const geometry_line4 = new THREE.BufferGeometry().setFromPoints(points_line4);
  const line4 = new THREE.Line(geometry_line4, material);
  parent.add(line4);
  return parent;
}

function addObject() {
  const line = createCube();

  for (let i = 0; i < 100; i++) {
    let clone = line.clone();
    clone.position.x = (Math.random() * 2 - 1) * 5;
    clone.position.y = (Math.random() * 2 - 1) * 5;
    clone.position.z = (Math.random() * 2 - 1) * 5;
    clone.scale.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    scene.add(clone);
  }
}

function addGUI() {
  gui = new GUI();
  const folder = gui.addFolder('bloomParams');
  gui.width = 300;

  folder.add(params, 'Strength', 0, 4.0).onChange((value) => {
    bloomPass.strength = value;
  });
  folder.add(params, 'Threshold', 0, 1.0).onChange((value) => {
    bloomPass.threshold = value;
  });
  folder.add(params, 'Radius', 0, 0.5).onChange((value) => {
    bloomPass.radius = value;
  });
}

function update() {
  requestAnimationFrame(update);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    composer.setSize(canvas.width, canvas.height);
  }

  composer.render(clock.getDelta());
  //renderer.render(scene, camera);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

(function () {
  init();
  addCamera();
  addObject();
  addEffect();
  addGUI();
  update();
})();
