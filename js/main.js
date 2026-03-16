// Import Three.js core and modules
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// ── Scene ───────────────────────────────────────────────
const scene = new THREE.Scene();

// ── Camera ──────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 1.6);

// ── Renderer ────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById("container3D").appendChild(renderer.domElement);

// ── Lighting ────────────────────────────────────────────
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
dirLight2.position.set(-5, 3, -5);
scene.add(dirLight2);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// ── Load GLTF Model ────────────────────────────────────
let model;
const loader = new GLTFLoader();

loader.load(
  "./models/monster/scene.gltf",
  (gltf) => {
    model = gltf.scene;

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const desiredHeight = 0.6;
    const scaleFactor = desiredHeight / maxDim;
    model.scale.setScalar(scaleFactor);

    const scaledBox = new THREE.Box3().setFromObject(model);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    model.position.sub(scaledCenter);

    // Tilt the can
    model.rotation.x = THREE.MathUtils.degToRad(15);
    model.rotation.y = Math.PI;
    model.rotation.z = THREE.MathUtils.degToRad(-10);

    scene.add(model);
  },
  (xhr) => {
    console.log(`Loading: ${((xhr.loaded / xhr.total) * 100).toFixed(1)}%`);
  },
  (error) => {
    console.error("Error loading model:", error);
  }
);

// ── OrbitControls (drag only, no zoom) ──────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 2.0;

// ── Logo Parallax ───────────────────────────────────────
const logoBg = document.getElementById("logo-bg");

let targetRotX = 0;
let targetRotY = 0;
let currentRotX = 0;
let currentRotY = 0;
const DEPTH_STRENGTH = 20;

document.addEventListener("mousemove", (e) => {
  const nx = (e.clientX / window.innerWidth - 0.5) * 2;
  const ny = (e.clientY / window.innerHeight - 0.5) * 2;
  targetRotY = nx * DEPTH_STRENGTH;
  targetRotX = -ny * DEPTH_STRENGTH;
});

function updateLogoDepth() {
  currentRotX += (targetRotX - currentRotX) * 0.06;
  currentRotY += (targetRotY - currentRotY) * 0.06;
  logoBg.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
  requestAnimationFrame(updateLogoDepth);
}
updateLogoDepth();

// ── Scroll-driven animation (3 sections) ────────────────
const container3D = document.getElementById("container3D");
const flavorInfo = document.getElementById("flavor-info");
const caffeineInfo = document.getElementById("caffeine-info");
const logoWrapper = document.getElementById("logo-depth-wrapper");
const heroTextLeft = document.getElementById("hero-text-left");
const heroTextRight = document.getElementById("hero-text-right");

// ── Random neon flicker on hero words ───────────────────
const heroSpans = document.querySelectorAll(".hero-text span");

function randomFlicker() {
  // Pick a random word
  const span = heroSpans[Math.floor(Math.random() * heroSpans.length)];

  // Add glow class (triggers CSS animation)
  span.classList.add("glow");

  // Remove glow after a random short duration (150–500ms)
  const glowDuration = 150 + Math.random() * 350;
  setTimeout(() => {
    span.classList.remove("glow");
  }, glowDuration);

  // Schedule the next flicker at a random interval (400–1200ms)
  const nextDelay = 400 + Math.random() * 800;
  setTimeout(randomFlicker, nextDelay);
}

// Start the flicker loop
randomFlicker();

const sectionHeight = window.innerHeight; // each section = 1 viewport

// Helper: clamp and map a value from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

// Easing for smoother transitions
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  // ── Hero text: jump up and disappear quickly ────────
  const heroFadeEnd = sectionHeight * 0.3; // vanish within first 30% of scroll
  const heroProgress = Math.min(scrollY / heroFadeEnd, 1);
  const heroEased = easeInOutCubic(heroProgress);

  const heroShiftY = -50 - heroEased * 80; // from -50% to -130% (jumps up)
  const heroOpacity = 1 - heroEased;

  heroTextLeft.style.transform = `translateY(${heroShiftY}%)`;
  heroTextLeft.style.opacity = heroOpacity;
  heroTextRight.style.transform = `translateY(${heroShiftY}%)`;
  heroTextRight.style.opacity = heroOpacity;

  // ── Section boundaries ──────────────────────────────
  const sec1Start = 0;                       // hero
  const sec1End = sectionHeight;             // end of hero
  const sec2Start = sectionHeight;           // flavor section
  const sec2End = sectionHeight * 2;         // end of flavor
  const sec3Start = sectionHeight * 2;       // caffeine section
  const sec3End = sectionHeight * 3;         // end of caffeine

  let canShiftX = 0;
  let logoShiftX = 0;

  // ── SECTION 1 → 2: Hero → Flavor ───────────────────
  // Can moves from center (0) to right (+28vw)
  // Flavor text fades in on the left
  if (scrollY <= sec2End) {
    const progress = easeInOutCubic(
      mapRange(scrollY, sec1End * 0.3, sec2Start, 0, 1)
    );
    canShiftX = progress * 28;
    logoShiftX = progress * 15;

    if (progress > 0.2) {
      flavorInfo.classList.add("visible");
    } else {
      flavorInfo.classList.remove("visible");
    }
  }

  // ── SECTION 2 → 3: Flavor → Caffeine ───────────────
  // Can moves from right (+28vw) through center to left (-28vw)
  // Flavor text fades out, caffeine text fades in
  if (scrollY > sec2Start) {
    const progress = easeInOutCubic(
      mapRange(scrollY, sec2Start, sec3Start, 0, 1)
    );

    // Blend from +28 to -28
    canShiftX = 28 - progress * 56;
    logoShiftX = 15 - progress * 30;

    // Fade out flavor text
    if (progress > 0.3) {
      flavorInfo.classList.remove("visible");
    }

    // Fade in caffeine text
    if (progress > 0.5) {
      caffeineInfo.classList.add("visible");
    } else {
      caffeineInfo.classList.remove("visible");
    }
  }

  // ── Beyond section 3: keep can on the left ──────────
  if (scrollY > sec3Start) {
    canShiftX = -28;
    logoShiftX = -15;
    caffeineInfo.classList.add("visible");
    flavorInfo.classList.remove("visible");
  }

  // ── Apply transforms ───────────────────────────────
  container3D.style.transform = `translateX(${canShiftX}vw)`;
  logoWrapper.style.transform = `translateX(${logoShiftX}vw)`;
});

// ── Animation Loop ──────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// ── Responsive Resize ───────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Menu Toggle ─────────────────────────────────────────
const menuBtn = document.getElementById("menu-btn");
const menuOverlay = document.getElementById("menu-overlay");

let menuOpen = false;

function toggleMenu() {
  menuOpen = !menuOpen;

  if (menuOpen) {
    menuOverlay.classList.add("open");
    menuBtn.classList.add("active");
    document.body.classList.add("menu-open");
    controls.autoRotate = false; // pause rotation while menu is open
  } else {
    menuOverlay.classList.remove("open");
    menuBtn.classList.remove("active");
    document.body.classList.remove("menu-open");
    controls.autoRotate = true;
  }
}

menuBtn.addEventListener("click", toggleMenu);

// Close menu with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) {
    toggleMenu();
  }
});

// Close menu when clicking a menu link
document.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    if (menuOpen) toggleMenu();
  });
});
