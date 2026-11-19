import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface DigitalAssetsSectionProps {
  /** Section heading (rendered as the section's <h2>). */
  heading?: string;
  /** One-sentence intro under the heading. */
  intro?: string;
}

interface Layer {
  name: string;
  description: string;
  path: string;
}

const LAYERS: Layer[] = [
  {
    name: 'Shared rules',
    description:
      'One source of truth for accessibility, Tailwind v4, Three.js performance and the React 19 compiler. Written once, inherited by every agent the moment a workspace opens.',
    path: '.agent/rules/',
  },
  {
    name: 'Spec-driven development',
    description:
      'Every feature starts as a spec that agrees the technical approach before any code exists. The agent gets a checklist it has to satisfy, not a vague prompt.',
    path: 'src/components/*/*.spec.md',
  },
  {
    name: 'Agent skills',
    description:
      'The workflows the agent runs already know about your specs, so it plans and checks its own work against what you wrote together.',
    path: '.agent/workflows/',
  },
];

const OUTCOMES: { title: string; detail: string }[] = [
  {
    title: 'Accessibility by default',
    detail: 'Rules like “respect reduced motion” are enforced, not optional.',
  },
  {
    title: 'Performance built in',
    detail: 'Asset budgets and critical CSS are part of the agent’s instructions.',
  },
  {
    title: 'Faster onboarding',
    detail: 'New people learn one workflow, not every nuance of the stack.',
  },
];

const GUIDE_URL =
  'https://github.com/ericthayer/agentic-orchestrator/blob/main/AGENTIC_ORCHESTRATION.md';

const INK = '#080c18';
const CUE = '#ffb547';
const SIGNAL = '#7aa2ff';

export const DigitalAssetsSection: React.FC<DigitalAssetsSectionProps> = ({
  heading = 'Three layers every agent reads from',
  intro = 'Agents stop guessing when they build from the same rules, specs and skills every time. Each layer lives in the repo, so you can read it too.',
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(INK, 6, 16);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.setClearColor(INK, 0);

    // 2. Wireframe forms, pushed to the edges so they sit behind margins, not text
    const geometry = new THREE.IcosahedronGeometry(1.1, 0);
    const amberMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(CUE),
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const blueMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(SIGNAL),
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });

    const forms = new THREE.Group();
    forms.name = 'wireframeForms';
    const formData: { pos: [number, number, number]; scale: number; material: THREE.Material }[] = [
      { pos: [6.5, 2.6, -2], scale: 1.1, material: amberMaterial },
      { pos: [-7, -2.8, -3], scale: 1.4, material: blueMaterial },
      { pos: [7.5, -3.4, -5], scale: 0.8, material: blueMaterial },
    ];
    formData.forEach(({ pos, scale, material }) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...pos);
      mesh.scale.setScalar(scale);
      forms.add(mesh);
    });
    scene.add(forms);

    // 3. Sparse particle field (dust in the hall)
    const count = 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.025,
      color: new THREE.Color(SIGNAL),
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.name = 'particleField';
    scene.add(particles);

    // 4. Render loop: frame-rate independent, paused off-screen, still under reduced motion
    const clock = new THREE.Clock();
    let isVisible = true;

    const renderFrame = () => renderer.render(scene, camera);

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const t = clock.elapsedTime;

      forms.children.forEach((mesh, i) => {
        mesh.rotation.x += delta * 0.08;
        mesh.rotation.y += delta * 0.12;
        mesh.position.y = formData[i].pos[1] + Math.sin(t * 0.3 + i) * 0.25;
      });
      particles.rotation.y += delta * 0.01;

      renderFrame();
      requestRef.current = requestAnimationFrame(animate);
    };

    const start = () => {
      cancelAnimationFrame(requestRef.current);
      if (reducedMotion.matches) {
        renderFrame();
        return;
      }
      clock.getDelta();
      requestRef.current = requestAnimationFrame(animate);
    };
    const stop = () => cancelAnimationFrame(requestRef.current);

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
      else stop();
    });
    observer.observe(container);

    const handleMotionChange = () => {
      if (isVisible) start();
    };
    reducedMotion.addEventListener('change', handleMotionChange);

    // 5. Resize with the section, not just the window
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (reducedMotion.matches || !isVisible) renderFrame();
    });
    resizeObserver.observe(container);

    start();

    // 6. Cleanup (per .agent/rules/three-js-react.md)
    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      reducedMotion.removeEventListener('change', handleMotionChange);
      geometry.dispose();
      amberMaterial.dispose();
      blueMaterial.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="pillars"
      aria-labelledby="pillars-heading"
      className="relative overflow-hidden bg-ink text-paper px-4 py-20 sm:px-6 lg:px-12 lg:py-28"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 h-full w-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <header className="max-w-[60ch]">
          <h2
            id="pillars-heading"
            className="font-display text-4xl font-semibold leading-[1.05] tracking-tight [font-stretch:85%] sm:text-5xl lg:text-6xl"
          >
            {heading}
          </h2>
          <p className="mt-5 text-lg text-mute">{intro}</p>
        </header>

        {/* The layers, drawn as parallel staves */}
        <ol className="mt-14 border-t border-staff lg:mt-20" aria-label="The three layers, in the order agents apply them">
          {LAYERS.map((layer) => (
            <li
              key={layer.name}
              className="grid gap-3 border-b border-staff py-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:py-10"
            >
              <h3 className="font-display text-2xl font-medium leading-tight [font-stretch:90%] lg:text-3xl">
                {layer.name}
              </h3>
              <div className="max-w-[60ch]">
                <p className="text-base leading-relaxed text-paper/90">{layer.description}</p>
                <p className="mt-4 text-sm text-mute">
                  Lives in{' '}
                  <code className="rounded-md border border-staff bg-ink-raised px-1.5 py-0.5 font-mono text-[0.8125rem] text-paper">
                    {layer.path}
                  </code>
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Outcomes: quieter, compact */}
        <div className="mt-14 lg:mt-16">
          <h3 className="text-sm font-medium text-mute">What teams get from it</h3>
          <ul className="mt-4 grid gap-x-10 gap-y-5 sm:grid-cols-3">
            {OUTCOMES.map((outcome) => (
              <li key={outcome.title} className="border-l border-staff pl-4">
                <p className="font-medium text-paper">{outcome.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-mute">{outcome.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-12">
          <a
            href={GUIDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-signal underline decoration-signal/40 underline-offset-4 transition-colors hover:decoration-signal"
          >
            Read the orchestration guide
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </div>
    </section>
  );
};

export default DigitalAssetsSection;
