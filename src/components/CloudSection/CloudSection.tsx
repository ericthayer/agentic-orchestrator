import React, { useEffect, useRef, useState } from 'react';

import * as THREE from 'three';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Midnight ink sky with low amber light rising from below and cool blue from above.
// Brightness is deliberately capped so paper text keeps >= 4.5:1 over any frame.
const fragmentShader = /* glsl */ `
  uniform float time;
  uniform float opacity;
  varying vec2 vUv;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float smoothNoise(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    f = f * f * (3.0 - 2.0 * f);
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 uv) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
      total += smoothNoise(uv) * amplitude;
      uv *= 2.1;
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 uv = vUv;

    float n = fbm(uv * 2.0 + time * 0.05);
    float n2 = fbm(uv * 4.0 - time * 0.02);
    float finalNoise = mix(n, n2, 0.5);

    vec3 ink = vec3(0.031, 0.047, 0.094);     // #080c18
    vec3 raised = vec3(0.059, 0.082, 0.149);  // #0f1526
    vec3 amber = vec3(1.0, 0.71, 0.278);      // #ffb547
    vec3 blue = vec3(0.478, 0.635, 1.0);      // #7aa2ff

    // Sky: ink base, blue light from above, amber light from below
    vec3 sky = ink;
    sky += blue * 0.10 * smoothstep(0.45, 1.0, uv.y);
    sky += amber * 0.12 * (1.0 - smoothstep(0.0, 0.45, uv.y));

    // Cloud bodies: raised ink lit amber near the floor, blue near the top
    float clouds = smoothstep(0.35, 0.8, finalNoise * (1.2 - uv.y * 0.5));
    vec3 lit = mix(amber * 0.30, blue * 0.22, smoothstep(0.2, 0.9, uv.y));
    vec3 cloudColor = mix(raised * 1.6, lit, 0.55);

    vec3 finalColor = mix(sky, cloudColor, clouds * 0.8);

    gl_FragColor = vec4(finalColor, opacity);
  }
`;

const getReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;

export const CloudSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(getReducedMotion);

  // Track the reduced-motion preference so the text layer can skip its reveal.
  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = () => setReducedMotion(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color('#080c18'), 0);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'cloudPlane';
    scene.add(mesh);

    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    let reduced = mql.matches;
    let isVisible = false;
    let animationFrameId = 0;

    const renderFrame = () => renderer.render(scene, camera);

    const animate = (time: number) => {
      material.uniforms.time.value = time * 0.001;
      renderFrame();
      animationFrameId = requestAnimationFrame(animate);
    };

    const stopLoop = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = 0;
    };

    const startLoop = () => {
      if (animationFrameId || reduced || !isVisible) return;
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      if (!canvasRef.current) return;
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      renderer.setSize(width, height, false);
      if (reduced) renderFrame();
    };

    // Scroll drives shader opacity and the text reveal. Reduced motion: a still,
    // fully opaque frame and fully visible text.
    const handleScroll = () => {
      if (!containerRef.current) return;
      if (reduced) {
        material.uniforms.opacity.value = 1;
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(1, (windowHeight - rect.top) / (rect.height + windowHeight)),
      );
      setScrollProgress(progress);

      let currentOpacity = 1;
      if (progress < 0.2) currentOpacity = progress / 0.2;
      else if (progress > 0.8) currentOpacity = (1 - progress) / 0.2;
      material.uniforms.opacity.value = currentOpacity;
    };

    const applyMotionPreference = () => {
      reduced = mql.matches;
      if (reduced) {
        stopLoop();
        material.uniforms.time.value = 12.0; // a settled, representative frame
        material.uniforms.opacity.value = 1;
        renderFrame();
      } else {
        handleScroll();
        startLoop();
      }
    };

    // Only animate while the section is on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startLoop();
        else stopLoop();
      },
      { threshold: 0 },
    );
    if (containerRef.current) observer.observe(containerRef.current);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    mql.addEventListener('change', applyMotionPreference);

    handleResize();
    applyMotionPreference();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      mql.removeEventListener('change', applyMotionPreference);
      stopLoop();
      observer.disconnect();
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const reveal = (threshold: number) =>
    reducedMotion || (scrollProgress > threshold && scrollProgress < 0.9)
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-4';

  const transition =
    'transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none';

  return (
    <section
      id="cloud-section"
      ref={containerRef}
      aria-labelledby="cloud-section-heading"
      className="relative w-full overflow-hidden bg-ink"
    >
      <div className="sticky top-0 h-screen min-h-[40rem] w-full">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />

        {/* Ink scrim: keeps paper and mute text >= 4.5:1 over the brightest cloud */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-radial-[ellipse_70%_60%_at_50%_50%] from-ink/85 via-ink/65 to-ink/20"
        />

        {/* Top seam: fades the clouds in from the Hero's ink edge so there is no visible band */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-b from-ink to-transparent"
        />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6">
          <h2
            id="cloud-section-heading"
            className={`mb-6 font-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.02] tracking-tight text-paper font-stretch-[78%] ${transition} ${reveal(0.2)}`}
          >
            Vibe coding hopes. Orchestration checks.
          </h2>

          <p
            className={`mx-auto mb-10 max-w-[60ch] text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed text-paper delay-100 ${transition} ${reveal(0.25)}`}
          >
            Vague prompts give you different code every time. Orchestration gives agents the
            same rules, a written spec and the right tools, so the output is repeatable, and
            reviewable, before it ships.
          </p>

          <dl
            className={`mb-10 grid w-full max-w-2xl grid-cols-1 border-t border-staff text-left sm:grid-cols-2 delay-200 ${transition} ${reveal(0.3)}`}
          >
            <div className="border-b border-staff py-4 sm:border-b-0 sm:border-r sm:pr-6">
              <dt className="text-sm text-mute">Vibe coding</dt>
              <dd className="mt-1 text-paper">A prompt, then hope.</dd>
            </div>
            <div className="py-4 sm:pl-6">
              <dt className="text-sm text-mute">Orchestration</dt>
              <dd className="mt-1 text-paper">Rules, a spec and skills, then verified output.</dd>
            </div>
          </dl>

          <a
            href="#pillars"
            className={`inline-flex items-center rounded-md border border-staff px-5 py-3 font-medium text-paper hover:border-signal hover:text-signal delay-300 ${transition} ${reveal(0.35)}`}
          >
            Meet the three pillars
          </a>
        </div>
      </div>
    </section>
  );
};

export default CloudSection;
