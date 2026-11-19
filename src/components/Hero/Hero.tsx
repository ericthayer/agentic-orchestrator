import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const coreShader = {

  vertexShader: `
    attribute float size;
    attribute vec3 customColor;
    attribute float phase;
    varying vec3 vColor;
    varying float vPhase;
    uniform float time;

    void main() {
        vColor = customColor;
        vPhase = phase;

        vec3 pos = position;

        float angle = atan(pos.y, pos.x);
        float distance = length(pos.xy);
        float spiralFactor = sin(distance * 0.5 + time * 2.0 + phase) * 0.1;

        pos.x += cos(angle + spiralFactor) * 0.2;
        pos.y += sin(angle + spiralFactor) * 0.2;
        pos.z += sin(distance + time + phase) * 0.1;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`,
  fragmentShader: `
    varying vec3 vColor;
    varying float vPhase;
    uniform float time;

    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        float alpha = smoothstep(0.5, 0.2, dist);

        float pulse = 0.8 + 0.2 * sin(time * 4.0 + vPhase);
        gl_FragColor = vec4(vColor * pulse, alpha);
    }
`
};

// Brand colours for the scene (mirrors --color-cue / --color-signal / --color-ink).
const CUE = new THREE.Color('#ffb547');
const SIGNAL = new THREE.Color('#7aa2ff');
const INK = new THREE.Color('#080c18');

const GITHUB_URL = 'https://github.com/ericthayer/agentic-orchestrator';

const NAV_LINKS = [
  { label: 'Why orchestrate', href: '#cloud-section' },
  { label: 'Pillars', href: '#pillars' },
  { label: 'Use the template', href: '#template' },
];

/** Camera distance at rest and during the "See how it works" zoom-out. */
const CAMERA_REST_Z = 60;
const CAMERA_ZOOM_Z = 300;

/** On landscape viewports the core sits right of centre so the headline reads on clear midnight. */
const coreOffsetX = (aspect: number) => (aspect > 1.1 ? Math.min(26, (aspect - 1) * 30) : 0);

interface HeroProps {
  onStartJourney?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartJourney }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  // Read inside the animation loop, so it must be a ref (state would be a stale closure).
  const isTransitioningRef = useRef(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!canvasRef.current) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Size the scene from the header, not the window: the header can grow taller
    // than the viewport (min-h-svh + content), and the canvas must fill all of it.
    const host = canvasRef.current.parentElement ?? document.body;
    const hostSize = () => ({
      width: host.clientWidth || window.innerWidth,
      height: host.clientHeight || window.innerHeight,
    });
    const initial = hostSize();

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = INK;
    scene.fog = new THREE.FogExp2(INK.getHex(), 0.01);

    const camera = new THREE.PerspectiveCamera(60, initial.width / initial.height, 0.1, 1000);
    camera.position.z = CAMERA_REST_Z;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // updateStyle=false: CSS (h-full w-full) owns the canvas's display size.
    renderer.setSize(initial.width, initial.height, false);
    renderer.setClearColor(INK, 1);

    // --- Post-processing ---
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(initial.width, initial.height),
      0.4, // strength (kept low so the headline stays legible)
      0.4, // radius
      0.25 // threshold
    );
    composer.addPass(bloomPass);

    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (initial.width * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (initial.height * pixelRatio);
    composer.addPass(fxaaPass);

    // --- Particle System ---
    const createParticleSystem = (numParticles: number, radius: number) => {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const sizes = [];
      const phases = [];
      const color = new THREE.Color();

      for (let i = 0; i < numParticles; i++) {
        const phi = Math.acos(-1 + (2 * i) / numParticles);
        const theta = Math.sqrt(numParticles * Math.PI) * phi;

        const r = radius * (0.7 + Math.random() * 0.6); // volumetric spread
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        positions.push(x, y, z);

        // Mostly signal blue, warming to cue amber across one side of the core.
        const t = THREE.MathUtils.smoothstep((x / radius + 1.0) / 2.0, 0.45, 0.95);
        color.copy(SIGNAL).lerp(CUE, t);
        // Some particles fall back towards midnight so the core has depth, not a flat glow.
        color.lerp(INK, Math.random() * 0.45);
        colors.push(color.r, color.g, color.b);

        sizes.push(Math.random() * 1.0 + 0.3);
        phases.push(Math.random() * Math.PI * 2);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
      geometry.setAttribute('phase', new THREE.Float32BufferAttribute(phases, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: coreShader.vertexShader,
        fragmentShader: coreShader.fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const points = new THREE.Points(geometry, material);
      points.name = 'orchestratorCore';
      return points;
    };

    const particleSystem = createParticleSystem(12000, 45);
    particleSystem.position.x = coreOffsetX(camera.aspect);
    // A composed, slightly tilted resting pose (also the still frame for reduced motion).
    particleSystem.rotation.set(0.35, -0.5, 0.2);
    scene.add(particleSystem);

    // --- Animation & Interaction ---
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      const mouseY = (event.clientY / window.innerHeight) * 2 - 1;
      targetRotationX = mouseY * 0.6;
      targetRotationY = mouseX * 0.6;
    };

    let time = 0;
    let requestRef = 0;

    const animate = () => {
      time += 0.002;

      currentRotationX += (targetRotationX - currentRotationX) * 0.08;
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;

      particleSystem.rotation.x = 0.35 + currentRotationX;
      particleSystem.rotation.y = -0.5 + currentRotationY;
      particleSystem.rotation.z += 0.0005;

      // Cinematic zoom-out while "See how it works" scrolls away, easing back afterwards.
      const transitioning = isTransitioningRef.current;
      const targetZ = transitioning ? CAMERA_ZOOM_Z : CAMERA_REST_Z;
      const targetScale = transitioning ? 0.4 : 1;
      camera.position.z += (targetZ - camera.position.z) * 0.05;
      const scale = particleSystem.scale.x + (targetScale - particleSystem.scale.x) * 0.05;
      particleSystem.scale.setScalar(scale);

      particleSystem.material.uniforms.time.value = time;

      composer.render();
      requestRef = requestAnimationFrame(animate);
    };

    if (reduceMotion) {
      // Still frame: no spin, no pointer-driven rotation, no shader drift.
      composer.render();
    } else {
      window.addEventListener('mousemove', handleMouseMove);
      requestRef = requestAnimationFrame(animate);
    }

    // --- Resize Handling ---
    const handleResize = () => {
      const { width, height } = hostSize();

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      particleSystem.position.x = coreOffsetX(camera.aspect);

      renderer.setSize(width, height, false);
      composer.setSize(width, height);

      const pxRatio = renderer.getPixelRatio();
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pxRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pxRatio);

      if (reduceMotion) composer.render();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(host);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      cancelAnimationFrame(requestRef);
      // Clean up Three.js resources
      particleSystem.geometry.dispose();
      (particleSystem.material as THREE.ShaderMaterial).dispose();
      bloomPass.dispose();
      fxaaPass.material.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  // Mobile menu: Escape closes it; focus moves into the panel on open and back to the toggle on close.
  const wasMenuOpenRef = useRef(false);
  useEffect(() => {
    if (isMobileMenuOpen) {
      menuCloseRef.current?.focus();
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') setIsMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      wasMenuOpenRef.current = true;
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
    if (wasMenuOpenRef.current) {
      menuToggleRef.current?.focus();
      wasMenuOpenRef.current = false;
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleGetStarted = () => {
    const cloudSection = document.getElementById('cloud-section');
    if (!cloudSection) return;

    if (prefersReducedMotion) {
      cloudSection.scrollIntoView({ behavior: 'auto' });
      return;
    }

    isTransitioningRef.current = true;
    setTimeout(() => {
      cloudSection.scrollIntoView({ behavior: 'smooth' });
      // Let the camera ease back to rest once the scroll has carried the hero away.
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 1500);
    }, 100);
  };

  const navLinkClass =
    'rounded-sm text-sm text-mute no-underline transition-colors duration-200 hover:text-paper';

  const enter = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <header id="top" className="relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-ink text-paper">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 -z-10 block h-full w-full" />

      {/* Left scrim keeps the headline on clear midnight where it overlaps the core */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-full bg-linear-to-r from-ink/85 via-ink/40 to-transparent md:w-2/3"
      />

      <nav
        aria-label="Main"
        className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-12"
      >
        <a
          href="#top"
          className="rounded-sm font-display text-lg font-semibold tracking-tight text-paper no-underline [font-stretch:85%] md:text-xl"
        >
          Agentic Orchestrator
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={navLinkClass}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${navLinkClass} inline-flex items-center gap-1`}
            >
              GitHub
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        </ul>

        <button
          ref={menuToggleRef}
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-paper md:hidden"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
          aria-label="Open menu"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu aria-hidden="true" className="h-6 w-6" />
        </button>
      </nav>

      {/* Mobile menu panel */}
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        inert={!isMobileMenuOpen}
        className={`fixed inset-y-0 right-0 z-30 flex w-[80%] max-w-xs flex-col border-l border-staff bg-ink-raised px-6 py-6 transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end">
          <button
            ref={menuCloseRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-paper"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          >
            <X aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <ul className="mt-6 flex flex-col">
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="border-b border-staff">
              <a
                href={link.href}
                onClick={closeMobileMenu}
                className="block py-4 font-display text-2xl font-semibold text-paper no-underline [font-stretch:85%]"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="border-b border-staff">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 py-4 font-display text-2xl font-semibold text-paper no-underline [font-stretch:85%]"
            >
              GitHub
              <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </nav>
      {isMobileMenuOpen && (
        <div aria-hidden="true" className="fixed inset-0 z-25 bg-ink/60 md:hidden" onClick={closeMobileMenu} />
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24">
        <div className="max-w-4xl">
          {/* The motif: five staff lines every agent reads from */}
          <div aria-hidden="true" className="mb-8 flex w-40 flex-col gap-1.5 md:w-56">
            {[0, 1, 2, 3, 4].map((line) => (
              <span key={line} className="block h-px w-full bg-staff" />
            ))}
          </div>

          <motion.h1
            {...enter(0)}
            className="max-w-[12ch] font-display text-[clamp(3.25rem,11vw,9rem)] font-bold leading-[0.88] tracking-[-0.02em] text-paper [font-stretch:75%] text-balance"
          >
            Agents that play from the same score.
          </motion.h1>

          <motion.p
            {...enter(0.15)}
            className="mt-8 max-w-[58ch] text-lg leading-relaxed text-paper/80 md:text-xl"
          >
            Agentic Orchestrator is a React + Three.js template where AI agents build from shared rules,
            written specs and reusable skills — so every learning app and demo ships accessible, fast
            and consistent.
          </motion.p>

          <motion.div {...enter(0.3)} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <button
              type="button"
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center rounded-md bg-cue px-6 py-3.5 text-base font-semibold text-ink transition-colors duration-200 hover:bg-cue-deep"
            >
              See how it works
            </button>
            <button
              type="button"
              onClick={onStartJourney}
              className="inline-flex items-center justify-center rounded-md border border-staff px-6 py-3.5 text-base font-semibold text-paper transition-colors duration-200 hover:border-signal hover:text-signal"
            >
              Take the interactive tour
            </button>
          </motion.div>
        </div>
      </div>

      {/* Blend the hero into the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 -z-10 h-40 w-full bg-linear-to-t from-ink to-transparent"
      />
    </header>
  );
};

export default Hero;
