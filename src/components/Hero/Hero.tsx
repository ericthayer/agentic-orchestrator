import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import './Hero.css';

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

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.01);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- Post-processing ---
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    bloomPass.threshold = 0.25;
    bloomPass.strength = 0.6;
    bloomPass.radius = 0.4;
    composer.addPass(bloomPass);

    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    composer.addPass(fxaaPass);

    // --- Particle System ---
    const createParticleSystem = (numParticles: number, radius: number) => {
      const geometry = new THREE.BufferGeometry();
      const positions = [];
      const colors = [];
      const sizes = [];
      const phases = [];

      for (let i = 0; i < numParticles; i++) {
        const phi = Math.acos(-1 + (2 * i) / numParticles);
        const theta = Math.sqrt(numParticles * Math.PI) * phi;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        positions.push(x, y, z);

        const color = new THREE.Color();
        const hue = (x / radius + 1.0) / 2.0;
        color.setHSL(0.7 + hue * 0.3, 1.0, 0.6);
        colors.push(color.r, color.g, color.b);

        sizes.push(Math.random() * 1.5 + 0.5);
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

      return new THREE.Points(geometry, material);
    };

    const particleSystem = createParticleSystem(40000, 25);
    scene.add(particleSystem);

    // --- Animation & Interaction ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
      targetRotationX = mouseY * 0.6;
      targetRotationY = mouseX * 0.6;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    let requestRef: number;

    const animate = () => {
      time += 0.005;

      currentRotationX += (targetRotationX - currentRotationX) * 0.08;
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;

      particleSystem.rotation.x = currentRotationX;
      particleSystem.rotation.y = currentRotationY;
      particleSystem.rotation.z += 0.002;

      particleSystem.material.uniforms.time.value = time;

      composer.render();
      requestRef = requestAnimationFrame(animate);
    };

    requestRef = requestAnimationFrame(animate);

    // --- Resize Handling ---
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      composer.setSize(width, height);

      const pxRatio = renderer.getPixelRatio();
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pxRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pxRatio);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef);
      // Clean up Three.js resources
      particleSystem.geometry.dispose();
      (particleSystem.material as THREE.ShaderMaterial).dispose();
      renderer.dispose();
    };
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="hero-wrapper" ref={containerRef}>
      <canvas ref={canvasRef} />

      <nav className="navbar">
        <a href="#" className="logo">Stellar</a>
        <div className="nav-links">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">Features</a>
          <a href="#" className="nav-link">About</a>
          <a href="#" className="nav-link">Contact</a>
        </div>
        <div
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          id="hamburger-menu"
        >
          <span style={isMobileMenuOpen ? { transform: 'rotate(45deg) translate(5px, 6px)' } : {}}></span>
          <span style={isMobileMenuOpen ? { opacity: 0 } : {}}></span>
          <span style={isMobileMenuOpen ? { transform: 'rotate(-45deg) translate(5px, -6px)' } : {}}></span>
        </div>
      </nav>

      <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`} id="mobile-nav">
        <div className="close-btn" id="close-btn" onClick={toggleMobileMenu}></div>
        <a href="#" onClick={toggleMobileMenu}>Home</a>
        <a href="#" onClick={toggleMobileMenu}>Features</a>
        <a href="#" onClick={toggleMobileMenu}>About</a>
        <a href="#" onClick={toggleMobileMenu}>Contact</a>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Explore The Universe</h1>
          <p className="hero-subtitle">Experience the cosmic wonders of our universe through an interactive 3D particle simulation built with Three.js.</p>
          <button className="cta-button">Get Started</button>
        </div>
        <div className="scroll-indicator">↓</div>
      </div>
    </div>
  );
};

export default Hero;
