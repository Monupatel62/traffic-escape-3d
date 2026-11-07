import * as THREE from "three";
import "./style.css";

type Axis = "horizontal" | "vertical";
type Vehicle = { id: string; name: string; x: number; y: number; length: number; axis: Axis; color: string; target?: boolean };
type Snapshot = { vehicles: Vehicle[]; moves: number };

const GRID = 6;
const CELL = 1;
const initialVehicles: Vehicle[] = [
  { id: "red", name: "Player car", x: 0, y: 2, length: 2, axis: "horizontal", color: "#f04452", target: true },
  { id: "blue", name: "Blue car", x: 2, y: 0, length: 2, axis: "vertical", color: "#3998f5" },
  { id: "green", name: "Green van", x: 4, y: 0, length: 3, axis: "vertical", color: "#28b989" },
  { id: "yellow", name: "Yellow car", x: 0, y: 1, length: 2, axis: "horizontal", color: "#ffc247" },
  { id: "purple", name: "Purple car", x: 3, y: 3, length: 2, axis: "vertical", color: "#9874e8" },
  { id: "orange", name: "Orange van", x: 1, y: 5, length: 2, axis: "horizontal", color: "#f28b45" }
];

const canvasHost = document.querySelector<HTMLDivElement>("#game-canvas")!;
const statusMessage = document.querySelector<HTMLDivElement>("#status-message")!;
const moveCount = document.querySelector<HTMLElement>("#move-count")!;
const winModal = document.querySelector<HTMLDivElement>("#win-modal")!;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#17253a");
scene.fog = new THREE.Fog("#17253a", 14, 28);
const camera = new THREE.OrthographicCamera(-5.9, 5.9, 5.9, -5.9, 0.1, 100);
camera.position.set(8, 10, 9);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
canvasHost.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc8e4ff, 0x26344a, 2.1));
const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(-5, 10, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const board = new THREE.Group();
scene.add(board);
const boardBase = new THREE.Mesh(new THREE.BoxGeometry(6.35, 0.34, 6.35), new THREE.MeshStandardMaterial({ color: "#26364b", roughness: 0.88 }));
boardBase.position.set(0, -0.22, 0);
boardBase.receiveShadow = true;
board.add(boardBase);

const tileMaterial = new THREE.MeshStandardMaterial({ color: "#35465b", roughness: 0.92 });
for (let row = 0; row < GRID; row++) {
  for (let col = 0; col < GRID; col++) {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.035, 0.96), tileMaterial);
    tile.position.set(col - 2.5, -0.025, row - 2.5);
    tile.receiveShadow = true;
    board.add(tile);
  }
}
const laneLineMaterial = new THREE.MeshStandardMaterial({ color: "#8292a6", roughness: 1, transparent: true, opacity: 0.28 });
for (let i = 0; i < GRID - 1; i++) {
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.012, 5.8), laneLineMaterial);
  line.position.set(i - 2, 0.002, 0);
  board.add(line);
}
const exitGlow = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 1), new THREE.MeshStandardMaterial({ color: "#4ff0bd", emissive: "#13b981", emissiveIntensity: 2.1 }));
exitGlow.position.set(3.15, 0.1, -0.5);
board.add(exitGlow);

const vehicleGroup = new THREE.Group();
board.add(vehicleGroup);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const dragPoint = new THREE.Vector3();
let vehicles: Vehicle[] = structuredClone(initialVehicles);
let meshes = new Map<string, THREE.Group>();
let selectedId: string | null = null;
let dragOffset = 0;
let dragStartPosition = 0;
let dragMoved = false;
let moves = 0;
let history: Snapshot[] = [];
let completed = false;

function worldPosition(v: Vehicle): THREE.Vector3 {
  const center = v.axis === "horizontal" ? v.x + v.length / 2 - 3 : v.x - 3;
  const depth = v.axis === "horizontal" ? v.y - 2.5 : v.y + v.length / 2 - 3;
  return v.axis === "horizontal" ? new THREE.Vector3(center, 0.18, depth) : new THREE.Vector3(depth, 0.18, center);
}

function makeVehicle(v: Vehicle): THREE.Group {
  const group = new THREE.Group();
  group.userData.vehicleId = v.id;
  const width = v.axis === "horizontal" ? v.length * 0.88 : 0.72;
  const depth = v.axis === "horizontal" ? 0.72 : v.length * 0.88;
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, 0.48, depth), new THREE.MeshStandardMaterial({ color: v.color, roughness: 0.34, metalness: 0.12 }));
  body.position.y = 0.31;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.52, 0.25, depth * 0.72), new THREE.MeshStandardMaterial({ color: "#c8e7f5", roughness: 0.2, metalness: 0.18, transparent: true, opacity: 0.92 }));
  cabin.position.set(0, 0.65, 0);
  group.add(cabin);
  const bumperMat = new THREE.MeshStandardMaterial({ color: "#182536", roughness: 0.55 });
  for (const side of [-1, 1]) {
    const wheel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.18), bumperMat);
    wheel.position.set(v.axis === "horizontal" ? side * (width * 0.31) : 0.38, 0.12, v.axis === "horizontal" ? 0.38 : side * (depth * 0.31));
    group.add(wheel);
  }
  if (v.target) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(width * 0.55, 0.025, 0.08), new THREE.MeshStandardMaterial({ color: "#ffe7a3", emissive: "#ffb52e", emissiveIntensity: 0.35 }));
    stripe.position.set(0, 0.56, 0);
    group.add(stripe);
  }
  group.position.copy(worldPosition(v));
  group.userData.baseY = 0.18;
  return group;
}

function rebuildVehicles(): void {
  vehicleGroup.clear();
  meshes.clear();
  for (const v of vehicles) {
    const mesh = makeVehicle(v);
    vehicleGroup.add(mesh);
    meshes.set(v.id, mesh);
  }
}

function occupiedByOther(v: Vehicle, x: number, y: number): boolean {
  return vehicles.some(other => {
    if (other.id === v.id) return false;
    for (let i = 0; i < other.length; i++) {
      const ox = other.axis === "horizontal" ? other.x + i : other.x;
      const oy = other.axis === "vertical" ? other.y + i : other.y;
      for (let j = 0; j < v.length; j++) {
        const vx = v.axis === "horizontal" ? x + j : x;
        const vy = v.axis === "vertical" ? y + j : y;
        if (ox === vx && oy === vy) return true;
      }
    }
    return false;
  });
}

function canPlace(v: Vehicle, x: number, y: number): boolean {
  if (v.axis === "horizontal") {
    if (y !== v.y || x < 0 || x + v.length > GRID) return false;
  } else if (x !== v.x || y < 0 || y + v.length > GRID) return false;
  return !occupiedByOther(v, x, y);
}

function setStatus(message: string): void { statusMessage.textContent = message; }

function saveSnapshot(): void { history.push({ vehicles: structuredClone(vehicles), moves }); }

function renderMoveCount(): void { moveCount.textContent = String(moves); }

function finishIfSolved(): void {
  const target = vehicles.find(v => v.target);
  if (target && target.x + target.length >= GRID) {
    completed = true;
    winModal.classList.remove("hidden");
    setStatus("Road cleared! You did it.");
  }
}

function moveVehicle(v: Vehicle, axisPosition: number): boolean {
  const next = Math.round(axisPosition);
  const x = v.axis === "horizontal" ? next : v.x;
  const y = v.axis === "vertical" ? next : v.y;
  if (x === v.x && y === v.y) return false;
  if (v.target && v.axis === "horizontal" && next > GRID - v.length) {
    const exitX = GRID - v.length;
    if (!canPlace(v, exitX, v.y)) return false;
    saveSnapshot();
    v.x = GRID - v.length;
    moves++;
    renderMoveCount();
    rebuildVehicles();
    finishIfSolved();
    return true;
  }
  if (!canPlace(v, x, y)) return false;
  saveSnapshot();
  v.x = x; v.y = y;
  moves++;
  renderMoveCount();
  rebuildVehicles();
  return true;
}

function pickVehicle(event: PointerEvent): void {
  if (completed) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(vehicleGroup.children, true);
  const root = hits.map(hit => {
    let object: THREE.Object3D | null = hit.object;
    while (object && !object.userData.vehicleId) object = object.parent;
    return object;
  }).find(Boolean);
  if (!root) return;
  const id = root!.userData.vehicleId as string;
  const v = vehicles.find(item => item.id === id);
  if (!v) return;
  selectedId = id;
  dragStartPosition = v.axis === "horizontal" ? v.x : v.y;
  dragMoved = false;
  raycaster.ray.intersectPlane(dragPlane, dragPoint);
  const p = worldPosition(v);
  const pointerAxis = v.axis === "horizontal" ? dragPoint.x : dragPoint.z;
  const vehicleAxis = v.axis === "horizontal" ? p.x : p.z;
  dragOffset = pointerAxis - vehicleAxis;
  renderer.domElement.setPointerCapture(event.pointerId);
  setStatus(v.target ? "Move the red car toward the exit" : "Slide along the vehicle's lane");
  const mesh = meshes.get(id);
  if (mesh) mesh.position.y = 0.34;
}

function dragVehicle(event: PointerEvent): void {
  if (!selectedId) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (!raycaster.ray.intersectPlane(dragPlane, dragPoint)) return;
  const v = vehicles.find(item => item.id === selectedId);
  const mesh = meshes.get(selectedId);
  if (!v || !mesh) return;
  const axis = v.axis === "horizontal" ? dragPoint.x : dragPoint.z;
  const boardAxis = axis + 3 - dragOffset;
  const next = Math.round(boardAxis);
  const x = v.axis === "horizontal" ? next : v.x;
  const y = v.axis === "vertical" ? next : v.y;
  if (canPlace(v, x, y)) {
    const candidate = worldPosition({ ...v, x, y });
    mesh.position.x = candidate.x;
    mesh.position.z = candidate.z;
    mesh.position.y = 0.34;
    dragMoved = true;
  }
}

function releaseVehicle(): void {
  if (!selectedId) return;
  const v = vehicles.find(item => item.id === selectedId);
  if (v && dragMoved) {
    const mesh = meshes.get(selectedId);
    if (mesh) {
      const axis = v.axis === "horizontal" ? mesh.position.x : mesh.position.z;
      const next = Math.round(axis + 3 - (v.axis === "horizontal" ? v.length / 2 : v.length / 2));
      const candidate = v.axis === "horizontal" ? next : next;
      if (candidate !== dragStartPosition) moveVehicle(v, candidate);
    }
  }
  selectedId = null;
  rebuildVehicles();
  if (!completed) setStatus("Drag a vehicle to move it");
}

renderer.domElement.addEventListener("pointerdown", pickVehicle);
renderer.domElement.addEventListener("pointermove", dragVehicle);
renderer.domElement.addEventListener("pointerup", releaseVehicle);
renderer.domElement.addEventListener("pointercancel", releaseVehicle);

function resize(): void {
  const width = canvasHost.clientWidth;
  const height = canvasHost.clientHeight;
  renderer.setSize(width, height, false);
  const aspect = width / Math.max(height, 1);
  const view = 6.8;
  camera.left = -view * aspect / 2;
  camera.right = view * aspect / 2;
  camera.top = view / 2;
  camera.bottom = -view / 2;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();
rebuildVehicles();

function animate(): void {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

document.querySelector<HTMLButtonElement>("#undo-button")!.addEventListener("click", () => {
  const previous = history.pop();
  if (!previous) { setStatus("No move to undo yet"); return; }
  vehicles = previous.vehicles;
  moves = previous.moves;
  completed = false;
  winModal.classList.add("hidden");
  renderMoveCount();
  rebuildVehicles();
  setStatus("Last move undone");
});
document.querySelector<HTMLButtonElement>("#reset-button")!.addEventListener("click", resetLevel);
document.querySelector<HTMLButtonElement>("#replay-button")!.addEventListener("click", resetLevel);
document.querySelector<HTMLButtonElement>("#next-button")!.addEventListener("click", () => {
  winModal.classList.add("hidden");
  resetLevel();
  setStatus("Level 2 is coming soon — prototype level reset");
});
document.querySelector<HTMLButtonElement>("#hint-button")!.addEventListener("click", () => {
  setStatus("Hint: move the green van down one space to clear the red car's lane.");
  const green = meshes.get("green");
  if (green) {
    green.traverse(object => {
      if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
        object.material.emissive.set("#2be2a4");
        object.material.emissiveIntensity = 0.5;
      }
    });
    window.setTimeout(() => rebuildVehicles(), 1100);
  }
});

function resetLevel(): void {
  vehicles = structuredClone(initialVehicles);
  moves = 0;
  history = [];
  completed = false;
  winModal.classList.add("hidden");
  renderMoveCount();
  rebuildVehicles();
  setStatus("Drag a vehicle to move it");
}

