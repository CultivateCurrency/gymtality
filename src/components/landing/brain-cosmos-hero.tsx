"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BrainClipPath } from "./brain-clip-path";

const STAR_COUNT = 8000;
const NEBULA_SCALE = 15;

// GLSL fragment shader for nebula
const nebulaSFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  // Simple Perlin noise approximation
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

    // Multi-layer perlin noise for cloud effect
    float n1 = smoothnoise(uv * 3.0 + uTime * 0.05);
    float n2 = smoothnoise(uv * 6.0 - uTime * 0.03);
    float n3 = smoothnoise(uv * 12.0 + uTime * 0.02);
    float n = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    // Color mixing: electric blue to violet
    vec3 blue = vec3(0.0, 0.83, 1.0);      // #00D4FF
    vec3 violet = vec3(0.48, 0.18, 1.0);   // #7B2FFF
    vec3 gold = vec3(1.0, 0.85, 0.0);      // #FFD900

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
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    // ─── Setup Three.js ───────────────────────────────────────────────────
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

    sceneRef.current = scene;
    rendererRef.current = renderer;

    camera.position.z = 3;

    // ─── Star field ────────────────────────────────────────────────────────
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

    // ─── Nebula layers ─────────────────────────────────────────────────────
    const nebulaGeo = new THREE.PlaneGeometry(NEBULA_SCALE, NEBULA_SCALE);
    const nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: nebulaVertexShader,
      fragmentShader: nebulaSFragmentShader,
      transparent: true,
      depthWrite: false,
    });

    // 3 nebula layers at different depths for parallax effect
    for (let i = 0; i < 3; i++) {
      const nebula = new THREE.Mesh(nebulaGeo, nebulaMaterial.clone());
      nebula.position.z = -2 - i * 0.5;
      scene.add(nebula);
    }

    // ─── Point lights for glow ─────────────────────────────────────────────
    const lightColors = [0x00d4ff, 0x7b2fff, 0xffd900];
    for (let i = 0; i < 3; i++) {
      const light = new THREE.PointLight(lightColors[i], 0.5);
      light.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4
      );
      scene.add(light);
    }

    // ─── Animation loop ────────────────────────────────────────────────────
    let time = 0;
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Pause if tab is hidden
      if (document.hidden) {
        return;
      }

      time += 0.001;

      // Rotate stars slowly
      stars.rotation.z += 0.00005;
      stars.rotation.x += 0.000025;

      // Camera slight drift
      camera.position.x = Math.sin(time * 0.3) * 0.3;
      camera.position.y = Math.cos(time * 0.4) * 0.2;

      // Update shader uniforms for all nebula layers
      scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          (child.material as any).uniforms.uTime.value = time;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // ─── Resize handler ────────────────────────────────────────────────────
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // ─── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      starsGeometry.dispose();
      starsMaterial.dispose();
      nebulaGeo.dispose();
      nebulaMaterial.dispose();
      renderer.dispose();
    };
  }, [isClient]);

  if (!isClient) return null;

  return (
    <>
      <BrainClipPath />
      <div
        className="fixed inset-0 z-0"
        style={{
          clipPath: "url(#brain-clip)",
          filter: "drop-shadow(0 0 60px rgba(0, 212, 255, 0.6))",
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: "block" }}
        />
      </div>

      {/* Floating affirmations */}
      <div className="fixed inset-0 z-5 pointer-events-none">
        <AffirmationText text="STRENGTH" delay="0s" />
        <AffirmationText text="RESILIENCE" delay="2s" />
        <AffirmationText text="UNSTOPPABLE" delay="4s" />
      </div>
    </>
  );
}

/**
 * Floating affirmation text component
 */
function AffirmationText({ text, delay }: { text: string; delay: string }) {
  return (
    <div
      className="absolute text-[10px] md:text-[12px] uppercase font-bold tracking-widest"
      style={{
        color: "#00D4FF",
        left: `${30 + Math.random() * 40}%`,
        top: `${35 + Math.random() * 30}%`,
        animation: `float-fade 6s ease-in-out infinite`,
        animationDelay: delay,
        opacity: 0.4,
      }}
    >
      {text}
    </div>
  );
}

// CSS animation for floating text
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes float-fade {
      0%, 100% { opacity: 0; transform: translateY(20px); }
      50% { opacity: 0.6; transform: translateY(-20px); }
    }
  `;
  document.head.appendChild(style);
}
