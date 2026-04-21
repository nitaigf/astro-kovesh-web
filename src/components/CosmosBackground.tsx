import { createSignal, onCleanup, onMount } from "solid-js";
import * as THREE from "three";

const COSMOS_ENABLED = import.meta.env.VITE_COSMOS_ENABLED !== "false";
const BASE_STAR_COUNT = Number(import.meta.env.VITE_COSMOS_STARS || "1800");

const STAR_COLORS = [
  new THREE.Color("#d8e9ff"),
  new THREE.Color("#b9d4ff"),
  new THREE.Color("#f4e8d0"),
  new THREE.Color("#9fd6ff"),
];

const NEBULA_COLORS = ["#4d8dff", "#61c6ff", "#ff9c72", "#ffd28f", "#7a6dff"];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomStarColor(): THREE.Color {
  const base = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)].clone();
  const shift = randomInRange(-0.06, 0.06);
  base.offsetHSL(shift, randomInRange(-0.03, 0.03), randomInRange(-0.08, 0.08));
  return base;
}

function createNebulaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    fallback.needsUpdate = true;
    return fallback;
  }

  ctx.clearRect(0, 0, 512, 512);

  for (let i = 0; i < 7; i += 1) {
    const x = randomInRange(120, 392);
    const y = randomInRange(120, 392);
    const radius = randomInRange(90, 190);
    const color = NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)];
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `${color}cc`);
    grad.addColorStop(0.45, `${color}66`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function CosmosBackground() {
  let containerRef: HTMLDivElement | undefined;
  const [fallbackMode, setFallbackMode] = createSignal(false);

  onMount(() => {
    if (!COSMOS_ENABLED) {
      setFallbackMode(true);
      return;
    }

    if (!containerRef) {
      setFallbackMode(true);
      return;
    }

    const webglCheck = document.createElement("canvas");
    const webglContext = webglCheck.getContext("webgl") || webglCheck.getContext("experimental-webgl");
    if (!webglContext) {
      setFallbackMode(true);
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const densityFactor = width < 720 ? 0.58 : width < 1100 ? 0.82 : 1;
    const starCount = Math.max(1300, Math.min(3600, Math.floor(BASE_STAR_COUNT * densityFactor)));

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    containerRef.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060b1a, 0.00042);
    const camera = new THREE.PerspectiveCamera(64, width / height, 0.1, 3200);
    camera.position.z = 330;

    const baseCamera = new THREE.Vector3(0, 0, 330);
    const targetParallax = new THREE.Vector2(0, 0);
    const currentParallax = new THREE.Vector2(0, 0);

    const layers: Array<{
      points: THREE.Points;
      speed: number;
      twinkleSpeed: number;
      baseOpacity: number;
      phase: number;
      nearZ: number;
      farZ: number;
      spreadX: number;
      spreadY: number;
    }> = [];

    const nebulaSprites: Array<{
      sprite: THREE.Sprite;
      drift: THREE.Vector3;
    }> = [];

    const nebulaTexture = createNebulaTexture();

    for (let i = 0; i < 8; i += 1) {
      const color = new THREE.Color(NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)]);
      color.offsetHSL(randomInRange(-0.03, 0.03), randomInRange(-0.05, 0.05), randomInRange(-0.1, 0.08));

      const material = new THREE.SpriteMaterial({
        map: nebulaTexture,
        color,
        transparent: true,
        opacity: randomInRange(0.14, 0.24),
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const sprite = new THREE.Sprite(material);
      const z = randomInRange(-1700, -420);
      const scale = randomInRange(780, 1250);
      sprite.position.set(randomInRange(-920, 920), randomInRange(-640, 640), z);
      sprite.scale.set(scale, scale * randomInRange(0.72, 1.15), 1);
      sprite.material.rotation = randomInRange(-Math.PI, Math.PI);
      scene.add(sprite);

      nebulaSprites.push({
        sprite,
        drift: new THREE.Vector3(randomInRange(-0.012, 0.012), randomInRange(-0.01, 0.01), randomInRange(0.01, 0.03)),
      });
    }

    function createStarLayer(
      count: number,
      size: number,
      opacity: number,
      speed: number,
      nearZ: number,
      farZ: number,
      spreadX: number,
      spreadY: number,
    ): void {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i += 1) {
        const i3 = i * 3;
        positions[i3] = randomInRange(-spreadX, spreadX);
        positions[i3 + 1] = randomInRange(-spreadY, spreadY);
        positions[i3 + 2] = randomInRange(farZ, nearZ);

        const color = randomStarColor();
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        vertexColors: true,
        size,
        sizeAttenuation: true,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);
      layers.push({
        points,
        speed,
        twinkleSpeed: randomInRange(0.35, 0.7),
        baseOpacity: opacity,
        phase: Math.random() * Math.PI * 2,
        nearZ,
        farZ,
        spreadX,
        spreadY,
      });
    }

    createStarLayer(Math.floor(starCount * 0.58), 1.0, 0.33, 0.12, 290, -1700, 1450, 980);
    createStarLayer(Math.floor(starCount * 0.24), 1.45, 0.43, 0.18, 310, -1900, 1250, 900);
    createStarLayer(Math.floor(starCount * 0.13), 2.0, 0.52, 0.27, 330, -2100, 1020, 760);
    createStarLayer(Math.floor(starCount * 0.05), 2.8, 0.62, 0.38, 350, -2300, 900, 680);

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const animate = (now: number) => {
      const delta = Math.min((now - lastTime) / 16.66, 2.0);
      lastTime = now;
      elapsed += delta * 0.016;

      currentParallax.lerp(targetParallax, 0.035 * delta);
      camera.position.x = baseCamera.x + currentParallax.x;
      camera.position.y = baseCamera.y + currentParallax.y;
      camera.position.z = baseCamera.z;

      for (const layer of layers) {
        const geometry = layer.points.geometry as THREE.BufferGeometry;
        const positionAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
        const material = layer.points.material as THREE.PointsMaterial;

        const twinkle = Math.sin(elapsed * layer.twinkleSpeed + layer.phase) * 0.12;
        material.opacity = Math.max(0.18, Math.min(0.92, layer.baseOpacity + twinkle));

        for (let i = 0; i < positionAttr.count; i += 1) {
          const z = positionAttr.getZ(i) + layer.speed * delta;
          if (z > layer.nearZ) {
            positionAttr.setX(i, randomInRange(-layer.spreadX, layer.spreadX));
            positionAttr.setY(i, randomInRange(-layer.spreadY, layer.spreadY));
            positionAttr.setZ(i, randomInRange(layer.farZ, layer.farZ * 0.78));
          } else {
            positionAttr.setZ(i, z);
          }
        }

        positionAttr.needsUpdate = true;
      }

      for (const item of nebulaSprites) {
        item.sprite.position.x += item.drift.x * delta;
        item.sprite.position.y += item.drift.y * delta;
        item.sprite.position.z += item.drift.z * delta;

        if (item.sprite.position.z > -300) {
          item.sprite.position.z = randomInRange(-1850, -1200);
          item.sprite.position.x = randomInRange(-980, 980);
          item.sprite.position.y = randomInRange(-700, 700);
        }
      }

      scene.rotation.y += 0.00014;
      scene.rotation.x += 0.00005;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      targetParallax.x = nx * 14;
      targetParallax.y = -ny * 10;
    };

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    onCleanup(() => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(rafId);

      for (const layer of layers) {
        const geometry = layer.points.geometry as THREE.BufferGeometry;
        const material = layer.points.material as THREE.PointsMaterial;
        geometry.dispose();
        material.dispose();
        scene.remove(layer.points);
      }

      for (const item of nebulaSprites) {
        const material = item.sprite.material as THREE.SpriteMaterial;
        material.dispose();
        scene.remove(item.sprite);
      }

      nebulaTexture.dispose();

      renderer.dispose();
      if (containerRef?.contains(renderer.domElement)) {
        containerRef.removeChild(renderer.domElement);
      }
    });
  });

  return (
    <div class="cosmos-bg" aria-hidden="true" ref={containerRef}>
      {fallbackMode() ? <div class="cosmos-fallback" /> : null}
    </div>
  );
}
