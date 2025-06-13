const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
const pointLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(ambientLight, pointLight);

// Stars
function addStars(count = 1000) {
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  const positions = [];

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 3000;
    const y = (Math.random() - 0.5) * 3000;
    const z = (Math.random() - 0.5) * 3000;
    positions.push(x, y, z);
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}
addStars(5000);

// Sun
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(new THREE.SphereGeometry(2.5, 32, 32), sunMaterial);
scene.add(sun);
pointLight.position.copy(sun.position);

// Planets
const aestheticColors = {
  Mercury: { color: 0xc0c0c0, emissive: 0x555555 },
  Venus: { color: 0xd4af37, emissive: 0xa47e1b },
  Earth: { color: 0x4682b4, emissive: 0x0e4d92 },
  Mars: { color: 0xe2725b, emissive: 0xaa443f },
  Jupiter: { color: 0xf4a460, emissive: 0xa0522d },
  Saturn: { color: 0xf5deb3, emissive: 0xcdba96 },
  Uranus: { color: 0xafeeee, emissive: 0x5f9ea0 },
  Neptune: { color: 0x4169e1, emissive: 0x1c39bb },
};

const planets = [
  { name: "Mercury", distance: 5, size: 0.4, speed: 0.04 },
  { name: "Venus", distance: 7, size: 0.6, speed: 0.015 },
  { name: "Earth", distance: 9, size: 0.7, speed: 0.01 },
  { name: "Mars", distance: 11, size: 0.6, speed: 0.008 },
  { name: "Jupiter", distance: 14, size: 1.5, speed: 0.005 },
  { name: "Saturn", distance: 18, size: 1.3, speed: 0.003 },
  { name: "Uranus", distance: 22, size: 1.1, speed: 0.002 },
  { name: "Neptune", distance: 26, size: 1.1, speed: 0.001 }
];

const planetMeshes = [];
const orbitAngles = [];
const speedControls = {};
const controlsDiv = document.getElementById('controls');

planets.forEach(planet => {
  const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: aestheticColors[planet.name].color,
    emissive: aestheticColors[planet.name].emissive,
    metalness: 0.3,
    roughness: 0.5
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  planetMeshes.push(mesh);
  orbitAngles.push(Math.random() * Math.PI * 2);
  speedControls[planet.name] = planet.speed;

  if (["Saturn", "Jupiter", "Uranus", "Neptune"].includes(planet.name)) {
    let innerRadius = planet.size + 0.3;
    let outerRadius = planet.size + 1.2;
    let ringColor = 0xffffff;
    let ringOpacity = 0.2;

    if (planet.name === "Saturn") {
      ringColor = 0xd2b48c;
      ringOpacity = 0.5;
    } else if (planet.name === "Jupiter") {
      ringColor = 0xbbbbbb;
      ringOpacity = 0.1;
    } else if (planet.name === "Uranus") {
      ringColor = 0x8888ff;
      ringOpacity = 0.15;
    } else if (planet.name === "Neptune") {
      ringColor = 0x9999ff;
      ringOpacity = 0.12;
    }

    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: ringColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: ringOpacity
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = planet.name === "Uranus" ? Math.PI / 1.8 : Math.PI / 2.5;
    mesh.add(ring);
  }

  const container = document.createElement("div");
  container.className = "slider-container";
  const label = document.createElement("label");
  label.innerText = `${planet.name} Speed`;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0.001;
  slider.max = 0.05;
  slider.step = 0.001;
  slider.value = planet.speed;
  slider.oninput = () => {
    speedControls[planet.name] = parseFloat(slider.value);
  };

  container.appendChild(label);
  container.appendChild(slider);
  controlsDiv.appendChild(container);
});

// Tooltip
const tooltip = document.getElementById("tooltip");
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planetMeshes);

  if (intersects.length > 0) {
    const index = planetMeshes.indexOf(intersects[0].object);
    tooltip.innerText = planets[index].name;
    tooltip.style.left = event.clientX + 10 + 'px';
    tooltip.style.top = event.clientY + 10 + 'px';
    tooltip.style.display = 'block';
  } else {
    tooltip.style.display = 'none';
  }
});

// Animation
let isPaused = false;
document.getElementById("toggleAnimation").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("toggleAnimation").innerText = isPaused ? "Resume" : "Pause";
});

function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    planets.forEach((planet, i) => {
      orbitAngles[i] += speedControls[planet.name];
      const x = planet.distance * Math.cos(orbitAngles[i]);
      const z = planet.distance * Math.sin(orbitAngles[i]);
      planetMeshes[i].position.set(x, 0, z);
      planetMeshes[i].rotation.y += 0.01;
    });
  }

  renderer.render(scene, camera);
}
camera.position.z = 40;
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
let darkMode = true;

themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
  document.body.classList.toggle("light-mode", !darkMode);
  themeToggle.textContent = darkMode ? "🌙 Dark Mode" : "☀ Light Mode";
  renderer.setClearColor(darkMode ? 0x000000 : 0xf0f0f0);
});
