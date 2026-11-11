

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

// ===================================
// SKONAN RACING - 3D GAME ENGINE
// ===================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080d20);
scene.fog = new THREE.Fog(0x080d20, 35, 150);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

camera.position.set(0, 6, 12);
camera.lookAt(0, 0, -15);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: "low-power"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = false;
document.body.appendChild(renderer.domElement);

// ===================================
// LIGHTING
// ===================================

scene.add(new THREE.HemisphereLight(0x809dff, 0x11111c, 2));

const mainLight = new THREE.DirectionalLight(0xffffff, 2);
mainLight.position.set(-5, 12, 8);
scene.add(mainLight);

// ===================================
// MATERIALS
// ===================================

const roadMat = new THREE.MeshStandardMaterial({
  color: 0x171b27,
  roughness: 0.9
});

const lineMat = new THREE.MeshBasicMaterial({
  color: 0xe7eaff
});

const buildingMats = [
  0x151e38,
  0x202943,
  0x10182c,
  0x25233c
].map(color => new THREE.MeshStandardMaterial({
  color
}));

// ===================================
// ROAD
// ===================================

const road = new THREE.Mesh(
  new THREE.PlaneGeometry(13, 180),
  roadMat
);

road.rotation.x = -Math.PI / 2;
road.position.set(0, 0, -70);
scene.add(road);

// Road edges
for (const x of [-6.5, 6.5]) {
  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.03, 180),
    new THREE.MeshBasicMaterial({ color: 0x00cfff })
  );

  edge.position.set(x, 0.025, -70);
  scene.add(edge);
}

// ===================================
// MOVING LANE MARKINGS
// ===================================

const dashes = [];

for (let lane = -1; lane <= 1; lane++) {
  for (let i = 0; i < 15; i++) {

    if (lane === 0 && i % 1 !== 0) continue;

    const dash = new THREE.Mesh(
      new BoxGeometry(0.09, 0.025, 3),
      lineMat
    );

    dash.position.set(lane * 2.15, 0.035, -i * 9);
    scene.add(dash);
    dashes.push(dash);
  }
}

// ===================================
// CITY BUILDINGS
// ===================================

for (let side of [-1, 1]) {

  for (let i = 0; i < 20; i++) {

    const height = 5 + Math.random() * 15;
    const width = 3 + Math.random() * 4;

    const building = new THREE.Mesh(
      new BoxGeometry(width, height, 5 + Math.random() * 5),
      buildingMats[i % buildingMats.length]
    );

    building.position.set(
      side * (11 + Math.random() * 9),
      height / 2,
      -i * 10 - 5
    );

    scene.add(building);

    // Building windows
    const windows = new THREE.Mesh(
      new BoxGeometry(width * 0.65, 0.12, 0.04),
      new THREE.MeshBasicMaterial({
        color: i % 2 ? 0x00cfff : 0xffc857
      })
    );

    windows.position.set(
      building.position.x,
      height * 0.65,
      building.position.z + 2.53
    );

    scene.add(windows);
  }
}

// ===================================
// PLAYER CAR
// ===================================

const car = new THREE.Group();
scene.add(car);
car.position.set(0, 0, 3);

// Main body
const body = new THREE.Mesh(
  new BoxGeometry(1.9, 0.55, 4),
  new THREE.MeshStandardMaterial({
    color: 0xd90032,
    metalness: 0.65,
    roughness: 0.3
  })
);

body.position.y = 0.65;
car.add(body);

// Hood
const hood = new THREE.Mesh(
  new BoxGeometry(1.8, 0.2, 1.2),
  new THREE.MeshStandardMaterial({
    color: 0xff174c,
    metalness: 0.6
  })
);

hood.position.set(0, 0.92, -1.15);
car.add(hood);

// Roof
const roof = new THREE.Mesh(
  new BoxGeometry(1.5, 0.7, 1.8),
  new THREE.MeshStandardMaterial({
    color: 0x111b2e,
    metalness: 0.4,
    roughness: 0.25
  })
);

roof.position.set(0, 1.2, 0.05);
car.add(roof);

// Front windscreen
const windshield = new THREE.Mesh(
  new BoxGeometry(1.42, 0.48, 0.06),
  new THREE.MeshBasicMaterial({
    color: 0x72b8d9
  })
);

windshield.position.set(0, 1.2, -0.87);
car.add(windshield);

// Headlights and rear lights
for (let x of [-0.65, 0.65]) {

  const headlight = new THREE.Mesh(
    new BoxGeometry(0.38, 0.16, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xc9f5ff })
  );

  headlight.position.set(x, 0.73, -2.02);
  car.add(headlight);

  const rearLight = new THREE.Mesh(
    new BoxGeometry(0.4, 0.15, 0.08),
    new THREE.MeshBasicMaterial({ color: 0xff001c })
  );

  rearLight.position.set(x, 0.72, 2.02);
  car.add(rearLight);
}

// Wheels
const wheels = [];

for (let x of [-1, 1]) {
  for (let z of [-1.3, 1.3]) {

    const wheel = new THREE.Mesh(
      new CylinderGeometry(0.42, 0.42, 0.28, 12),
      new THREE.MeshStandardMaterial({
        color: 0x090a0d,
        roughness: 0.8
      })
    );

    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.43, z);
    car.add(wheel);
    wheels.push(wheel);
  }
}

// ===================================
// GAME VARIABLES
// ===================================

let speed = 0;
let distance = 0;
let carX = 0;

let accelerating = false;
let braking = false;
let nitro = false;

const maxSpeed = 240;
const keys = {};

const speedDisplay = document.getElementById("speed");
const distanceDisplay = document.getElementById("distance");
const gearDisplay = document.getElementById("gear");
const loading = document.getElementById("loading");

// ===================================
// KEYBOARD CONTROLS
// ===================================

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
    e.preventDefault();
  }
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// ===================================
// MOBILE BUTTON CONTROLS
// ===================================

function bindButton(id, callback) {
  const button = document.getElementById(id);

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    callback(true);
  });

  button.addEventListener("pointerup", () => callback(false));
  button.addEventListener("pointerleave", () => callback(false));
  button.addEventListener("pointercancel", () => callback(false));
}

bindButton("left", v => keys["a"] = v);
bindButton("right", v => keys["d"] = v);
bindButton("nitro", v => nitro = v);

// ===================================
// RESIZE
// ===================================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===================================
// MAIN GAME LOOP
// ===================================

let previousTime = 0;

function animate(time) {

  requestAnimationFrame(animate);

  const delta = Math.min((time - previousTime) / 1000 || 0, 0.05);
  previousTime = time;

  const forward =
    keys["w"] || keys["arrowup"] || accelerating;

  const reverse =
    keys["s"] || keys["arrowdown"] || braking;

  const left =
    keys["a"] || keys["arrowleft"];

  const right =
    keys["d"] || keys["arrowright"];

  // Acceleration
  if (forward) speed += 90 * delta;
  else speed -= 30 * delta;

  // Braking
  if (reverse) speed -= 120 * delta;

  // Nitro
  if (nitro && speed > 0) speed += 130 * delta;

  speed = THREE.MathUtils.clamp(speed, 0, nitro ? 290 : maxSpeed);

  // Steering
  const steeringPower = (0.9 + speed / 100) * delta;

  if (left) carX -= steeringPower;
  if (right) carX += steeringPower;

  carX = THREE.MathUtils.clamp(carX, -4.5, 4.5);

  car.position.x = THREE.MathUtils.lerp(
    car.position.x,
    carX,
    0.15
  );

  // Car body movement
  car.rotation.z = THREE.MathUtils.lerp(
    car.rotation.z,
    left ? 0.08 : right ? -0.08 : 0,
    0.1
  );

  // Wheel rotation
  wheels.forEach(wheel => {
    wheel.rotation.x += speed * delta * 0.025;
  });

  // Road animation
  const movement = speed * delta * 0.12;

  dashes.forEach(dash => {
    dash.position.z += movement;

    if (dash.position.z > 12) {
      dash.position.z -= 135;
    }
  });

  // Distance
  distance += speed * delta / 3.6;

  // Camera follows steering
  camera.position.x = THREE.MathUtils.lerp(
    camera.position.x,
    car.position.x * 0.3,
    0.04
  );

  camera.lookAt(car.position.x * 0.2, 0.8, -15);

  // HUD
  speedDisplay.textContent = Math.round(speed);
  distanceDisplay.textContent = Math.floor(distance);

  gearDisplay.textContent =
    speed < 40 ? "1" :
    speed < 90 ? "2" :
    speed < 150 ? "3" :
    speed < 210 ? "4" : "5";

  renderer.render(scene, camera);
}

// ===================================
// START
// ===================================

loading.style.display = "none";
requestAnimationFrame(animate);
