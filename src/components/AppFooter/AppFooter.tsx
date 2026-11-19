import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Github } from 'lucide-react';

const REPO_URL = 'https://github.com/ericthayer/agentic-orchestrator';
const BLOB_URL = `${REPO_URL}/blob/main`;

interface FooterLink {
  label: string;
  href: string;
}

const docsLinks: FooterLink[] = [
  { label: 'Orchestration guide', href: `${BLOB_URL}/AGENTIC_ORCHESTRATION.md` },
  { label: 'Template guide', href: `${BLOB_URL}/TEMPLATE_GUIDE.md` },
  { label: 'Case study', href: `${BLOB_URL}/CASE_STUDY.md` },
  { label: 'Changelog', href: `${BLOB_URL}/CHANGELOG.md` },
];

const projectLinks: FooterLink[] = [
  { label: 'GitHub repo', href: REPO_URL },
  { label: 'Example: Design Great Prompts', href: 'https://design-great-prompts.netlify.app/' },
];

// Amber cue + blue signal on midnight ink, per the design tokens in src/index.css.
const BLOB_COLORS = ['#ffb547', '#7aa2ff', '#7aa2ff', '#ffb547'];

const FooterColumn: React.FC<{ id: string; heading: string; links: FooterLink[] }> = ({
  id,
  heading,
  links,
}) => (
  <nav aria-labelledby={id}>
    <h2 id={id} className="mb-4 text-sm font-semibold text-paper">
      {heading}
    </h2>
    <ul role="list" className="space-y-3 text-sm">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mute transition-colors hover:text-signal"
          >
            {link.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

export const AppFooter: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor('#080c18', 0);

    // 2. Lava-lamp blobs: one shared geometry, a material per colour.
    const blobs: THREE.Mesh[] = [];
    const baseGeometry = new THREE.SphereGeometry(1, 32, 32);

    BLOB_COLORS.forEach((hex, i) => {
      const color = new THREE.Color(hex);
      const material = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.22,
        roughness: 0.6,
        metalness: 0,
        emissive: color,
        emissiveIntensity: 0.35,
      });
      const blob = new THREE.Mesh(baseGeometry, material);
      blob.scale.setScalar(3 + i * 0.5);
      blob.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
      );
      scene.add(blob);
      blobs.push(blob);
    });

    // 3. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pointLight = new THREE.PointLight(0xffffff, 60);
    pointLight.position.set(5, 5, 10);
    scene.add(pointLight);

    // 4. Gentle mouse attraction (skipped entirely for reduced motion)
    const onMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    if (!reduceMotion) window.addEventListener('mousemove', onMouseMove);

    // 5. Animation (reduced motion: render one still frame, no loop)
    let requestFrame = 0;
    const startTime = performance.now();

    const step = () => {
      const elapsed = (performance.now() - startTime) * 0.001;
      const targetX = mouse.current.x * 10;
      const targetY = mouse.current.y * 5;

      blobs.forEach((blob, i) => {
        blob.position.x += Math.sin(elapsed * 0.2 + i) * 0.01;
        blob.position.y += Math.cos(elapsed * 0.2 + i) * 0.01;
        blob.position.x += (targetX - blob.position.x) * 0.01;
        blob.position.y += (targetY - blob.position.y) * 0.01;

        const dist = Math.hypot(blob.position.x - targetX, blob.position.y - targetY);
        const proximity = Math.max(0, 1.5 - dist / 6);
        blob.scale.setScalar(3 + i * 0.5 + proximity + Math.sin(elapsed * 0.5 + i) * 0.25);
      });

      renderer.render(scene, camera);
    };

    const animate = () => {
      step();
      requestFrame = requestAnimationFrame(animate);
    };

    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      animate();
    }

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      if (reduceMotion) renderer.render(scene, camera);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestFrame);
      baseGeometry.dispose();
      blobs.forEach((b) => (b.material as THREE.Material).dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <footer
      ref={containerRef}
      className="relative w-full overflow-hidden border-t border-staff bg-ink pt-16 pb-10"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-40 blur-[100px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-2xl font-semibold tracking-tight text-paper [font-stretch:85%]">
              Agentic Orchestrator
            </p>
            <p className="mt-4 max-w-[48ch] leading-relaxed text-mute">
              Turn AI agents from autocomplete into disciplined collaborators: they build from
              the same rules, specs and skills every time.
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Agentic Orchestrator on GitHub (opens in a new tab)"
              className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-md border border-staff text-mute transition-colors hover:border-signal hover:text-signal"
            >
              <Github size={18} aria-hidden="true" />
            </a>
          </div>

          <FooterColumn id="footer-docs" heading="Docs" links={docsLinks} />
          <FooterColumn id="footer-project" heading="Project" links={projectLinks} />
        </div>

        <div className="mt-16 border-t border-staff pt-8">
          <p className="text-sm text-mute">
            Agentic Orchestrator v{__APP_VERSION__} — an open template for learning with AI
            agents.
          </p>
        </div>
      </div>
    </footer>
  );
};
