"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const STAR_COUNT = 8000;
const NEBULA_SCALE = 15;

// GLSL shaders (identical to previous)
const nebulaSFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float smoothnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n00 = noise(i);
    float n10 = noise(i + vec2(1.0, 0.0));
    float n01 = noise(i + vec2(0.0, 1.0));
    float n11 = noise(i + vec2(1.0, 1.0));
    float nx0 = mix(n00, n10, f.x);
    float nx1 = mix(n01, n11, f.x);
    return mix(nx0, nx1, f.y);
  }

  void main() {
    vec2 uv = vUv;
    float n1 = smoothnoise(uv * 3.0 + uTime * 0.05);
    float n2 = smoothnoise(uv * 6.0 - uTime * 0.03);
    float n3 = smoothnoise(uv * 12.0 + uTime * 0.02);
    float n = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    vec3 blue = vec3(0.0, 0.83, 1.0);
    vec3 violet = vec3(0.48, 0.18, 1.0);
    vec3 gold = vec3(1.0, 0.85, 0.0);

    vec3 color = mix(blue, violet, smoothstep(0.2, 0.8, n2));
    color = mix(color, gold * 0.3, smoothstep(0.6, 1.0, n1) * 0.4);

    float alpha = smoothstep(0.25, 0.75, n) * 0.25;
    gl_FragColor = vec4(color, alpha);
  }
`;

const nebulaVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function BrainCosmosHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    // ─── Three.js Setup ───────────────────────────────────────────────────
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    camera.position.z = 3;

    // ─── Star Field ───────────────────────────────────────────────────────
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = window.innerWidth < 768 ? 4000 : STAR_COUNT;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;
      sizes[i / 3] = Math.random() * 1.5 + 0.3;
    }

    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      sizeAttenuation: true,
      opacity: 0.8,
      transparent: true,
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // ─── Nebula Layers ────────────────────────────────────────────────────
    const nebulaGeo = new THREE.PlaneGeometry(NEBULA_SCALE, NEBULA_SCALE);
    const nebulaMaterials: THREE.ShaderMaterial[] = [];

    for (let i = 0; i < 3; i++) {
      const nebulaMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader: nebulaVertexShader,
        fragmentShader: nebulaSFragmentShader,
        transparent: true,
        depthWrite: false,
      });
      nebulaMaterials.push(nebulaMaterial);

      const nebula = new THREE.Mesh(nebulaGeo, nebulaMaterial);
      nebula.position.z = -2 - i * 0.5;
      scene.add(nebula);
    }

    // ─── Brain Group ──────────────────────────────────────────────────────
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Brain wireframe shell
    const brainGeo = new THREE.IcosahedronGeometry(1.2, 32);
    const wireframeGeo = new THREE.WireframeGeometry(brainGeo);
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.8,
      linewidth: 2,
    });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMaterial);
    brainGroup.add(wireframe);

    // Brain inner glow sphere
    const glowMaterial = new THREE.MeshPhongMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });
    const glowMesh = new THREE.Mesh(brainGeo, glowMaterial);
    brainGroup.add(glowMesh);

    // Brain lobe ridges (TorusGeometry rings)
    const ridgeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.12,
    });

    for (let i = 0; i < 5; i++) {
      const ridge = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.08, 8, 20),
        ridgeMaterial.clone()
      );
      ridge.rotation.x = (i / 5) * Math.PI;
      brainGroup.add(ridge);
    }

    // ─── Gym Scene Inside Brain ──────────────────────────────────────────
    const gymGroup = new THREE.Group();
    gymGroup.scale.set(0.5, 0.5, 0.5);
    brainGroup.add(gymGroup);

    // Gym floor
    const floorGeo = new THREE.PlaneGeometry(2, 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.z = -0.5;
    floor.rotation.x = -Math.PI / 2;
    gymGroup.add(floor);

    // Barbell 1 — bar
    const barbellBarMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
    });

    const barbellBar1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.5, 16),
      barbellBarMat
    );
    barbellBar1.position.set(-0.4, 0, 0);
    barbellBar1.rotation.z = Math.PI / 2;
    gymGroup.add(barbellBar1);

    // Barbell 1 — weights
    const weightGeo = new THREE.TorusGeometry(0.1, 0.03, 8, 20);
    for (const offset of [-0.75, 0.75]) {
      const weight = new THREE.Mesh(weightGeo, barbellBarMat);
      weight.position.set(-0.4 + offset, 0, 0);
      weight.rotation.y = Math.PI / 4;
      gymGroup.add(weight);
    }

    // Barbell 2 — on stand
    const barbellBar2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.5, 16),
      barbellBarMat
    );
    barbellBar2.position.set(0.4, 0, 0);
    barbellBar2.rotation.z = Math.PI / 2;
    gymGroup.add(barbellBar2);

    // Pull-up bar
    const pullupBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1.2, 16),
      barbellBarMat
    );
    pullupBar.position.set(0, 0.5, 0);
    pullupBar.rotation.z = Math.PI / 2;
    gymGroup.add(pullupBar);

    // Athlete stick figure 1
    createAthleteStickFigure(gymGroup, -0.6, 0.1, 0, barbellBarMat);

    // Athlete stick figure 2
    createAthleteStickFigure(gymGroup, 0.6, 0.1, 0, barbellBarMat);

    // Gym ambient light
    const gymAmbient = new THREE.AmbientLight(0xffffff, 0.3);
    gymGroup.add(gymAmbient);

    // ─── Affirmation Text (Canvas Textures) ────────────────────────────────
    const affirmations = ["STRENGTH", "RESILIENCE", "UNSTOPPABLE"];
    const affirmationMeshes: THREE.Mesh[] = [];

    affirmations.forEach((text, idx) => {
      const canvas = new OffscreenCanvas(256, 64);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 256, 64);

      ctx.font = "bold 32px Arial, sans-serif";
      ctx.fillStyle = "#00D4FF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 128, 32);

      const texture = new THREE.CanvasTexture(canvas as any);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.5), material);
      mesh.position.set(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4 + 1,
        (Math.random() - 0.5) * 2
      );
      mesh.material.opacity = 0.5;

      scene.add(mesh);
      affirmationMeshes.push(mesh);
    });

    // ─── Lighting ──────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const blueLight = new THREE.PointLight(0x00d4ff, 1.5);
    blueLight.position.set(3, 2, 3);
    scene.add(blueLight);

    const goldLight = new THREE.PointLight(0xffd900, 1.2);
    goldLight.position.set(-3, -2, -3);
    scene.add(goldLight);

    // ─── Post-Processing: UnrealBloomPass ──────────────────────────────────
    let composer: any = null;

    // Dynamic import to avoid SSR errors
    Promise.all([
      import("three/examples/jsm/postprocessing/EffectComposer.js"),
      import("three/examples/jsm/postprocessing/RenderPass.js"),
      import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
    ]).then(([{ EffectComposer: EC }, { RenderPass: RP }, { UnrealBloomPass: UBP }]) => {
      composer = new EC(renderer);
      composer.addPass(new RP(scene, camera));
      composer.addPass(
        new UBP(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          2.5,  // strength
          0.5,  // radius
          0.1   // threshold
        )
      );
    });

    // ─── Animation Loop ───────────────────────────────────────────────────
    let time = 0;
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (document.hidden) {
        return;
      }

      time += 0.005;

      // Rotate stars
      stars.rotation.z += 0.00008;
      stars.rotation.x += 0.000025;

      // Rotate brain
      brainGroup.rotation.y += 0.002;

      // Counter-rotate gym inside
      gymGroup.rotation.y -= 0.001;

      // Camera drift
      camera.position.x = Math.sin(time * 0.2) * 0.5;
      camera.position.y = Math.cos(time * 0.15) * 0.3;

      // Affirmation text drift
      affirmationMeshes.forEach((mesh, i) => {
        mesh.position.y = Math.sin(time + i * 2) * 0.5;
        mesh.position.x = Math.cos(time * 0.5 + i) * 2;
        const opacity = (Math.sin(time * 0.5 + i) + 1) / 2 * 0.6;
        (mesh.material as THREE.Material).opacity = opacity;
      });

      // Update nebula time
      nebulaMaterials.forEach((mat) => {
        mat.uniforms.uTime.value = time;
      });

      // Render with bloom effect if composer is ready
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };

    animate();

    // ─── Resize Handler ───────────────────────────────────────────────────
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (composer) {
        composer.setSize(width, height);
      }
    };

    window.addEventListener("resize", handleResize);

    // ─── Cleanup ──────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);

      starsGeometry.dispose();
      starsMaterial.dispose();
      nebulaGeo.dispose();
      nebulaMaterials.forEach((m) => m.dispose());

      brainGeo.dispose();
      wireframeGeo.dispose();
      wireframeMaterial.dispose();
      glowMaterial.dispose();

      affirmationMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });

      renderer.dispose();
    };
  }, [isClient]);

  if (!isClient) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}

/**
 * Create a simple stick figure athlete inside the gym
 */
function createAthleteStickFigure(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  material: THREE.Material
) {
  const athleteGroup = new THREE.Group();
  athleteGroup.position.set(x, y, z);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), material);
  head.position.y = 0.25;
  athleteGroup.add(head);

  // Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.08), material);
  body.position.y = 0.1;
  athleteGroup.add(body);

  // Left arm
  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8),
    material
  );
  leftArm.position.set(-0.1, 0.15, 0);
  leftArm.rotation.z = Math.PI / 4;
  athleteGroup.add(leftArm);

  // Right arm
  const rightArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8),
    material
  );
  rightArm.position.set(0.1, 0.15, 0);
  rightArm.rotation.z = -Math.PI / 4;
  athleteGroup.add(rightArm);

  // Left leg
  const leftLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8),
    material
  );
  leftLeg.position.set(-0.06, -0.05, 0);
  athleteGroup.add(leftLeg);

  // Right leg
  const rightLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8),
    material
  );
  rightLeg.position.set(0.06, -0.05, 0);
  athleteGroup.add(rightLeg);

  parent.add(athleteGroup);
}
