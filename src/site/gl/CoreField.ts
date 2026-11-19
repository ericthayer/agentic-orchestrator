import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  Points,
  Color,
  Sphere,
  Vector3,
} from 'three';

/**
 * CoreField: one persistent particle object for the whole site.
 * Each route has a formation; a route change morphs the same particles
 * into the next shape, so the object carries the page transition.
 */

export type Formation = 'core' | 'stack' | 'path' | 'blocks' | 'ring' | 'gate';

export interface Pose {
  /** Centre of the object as a fraction of the half viewport (-1..1). */
  x: number;
  y: number;
  /** Radius of the object as a fraction of the viewport's shorter half. */
  size: number;
  alpha: number;
}

const TAU = Math.PI * 2;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Writer = (i: number, x: number, y: number, z: number) => void;

function cubePoint(rand: () => number, half: number): [number, number, number] {
  // A point on a cube's edges (70%) or faces (30%), so the block reads as a drawn solid.
  const p: [number, number, number] = [0, 0, 0];
  const onEdge = rand() < 0.7;
  const free = Math.floor(rand() * 3);
  for (let a = 0; a < 3; a++) {
    if (a === free) p[a] = (rand() * 2 - 1) * half;
    else if (onEdge) p[a] = rand() < 0.5 ? -half : half;
    else p[a] = (rand() * 2 - 1) * half;
  }
  if (!onEdge) p[(free + 1) % 3] = rand() < 0.5 ? -half : half;
  return p;
}

const BUILDERS: Record<Formation, (n: number, rand: () => number, put: Writer) => void> = {
  // A shell, a dense nucleus and two orbits: the orchestrator.
  core(n, rand, put) {
    const shell = Math.floor(n * 0.6);
    const nucleus = Math.floor(n * 0.12);
    for (let i = 0; i < n; i++) {
      if (i < shell) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / shell);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = 1 + (rand() - 0.5) * 0.05;
        put(i, r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
      } else if (i < shell + nucleus) {
        const r = Math.pow(rand(), 0.6) * 0.34;
        const u = rand() * 2 - 1;
        const t = rand() * TAU;
        const s = Math.sqrt(1 - u * u);
        put(i, r * s * Math.cos(t), r * u, r * s * Math.sin(t));
      } else {
        // Three wide, flat orbits: the object spans the stage, not just its middle.
        const ring = Math.floor(rand() * 3);
        const r = [1.5, 1.9, 2.3][ring] + (rand() - 0.5) * 0.015;
        const tilt = [0.1, -0.07, 0.16][ring];
        const t = rand() * TAU;
        const x = r * Math.cos(t);
        const z = r * Math.sin(t);
        put(i, x, z * Math.sin(tilt), z * Math.cos(tilt));
      }
    }
  },
  // Three layers: rules, specs, skills.
  stack(n, rand, put) {
    const side = Math.floor(Math.sqrt((n * 0.9) / 3));
    const perLayer = side * side;
    for (let i = 0; i < n; i++) {
      const layer = Math.floor(i / perLayer);
      if (layer < 3) {
        const k = i % perLayer;
        const gx = (k % side) / (side - 1) - 0.5;
        const gz = Math.floor(k / side) / (side - 1) - 0.5;
        put(i, gx * 2.1, (layer - 1) * 0.62, gz * 2.1);
      } else {
        // Connectors between the layers.
        const cx = rand() < 0.5 ? -0.7 : 0.7;
        const cz = rand() < 0.5 ? -0.7 : 0.7;
        put(i, cx, (rand() * 2 - 1) * 0.62, cz);
      }
    }
  },
  // Four stages along one line: noise, a frame, a faceted form, a solid.
  path(n, rand, put) {
    const stream = Math.floor(n * 0.3);
    const per = Math.floor((n - stream) / 4);
    const centre = (k: number): [number, number] => {
      const x = -2.25 + k * 1.5;
      return [x, Math.sin(x * 1.1) * 0.32];
    };
    for (let i = 0; i < n; i++) {
      if (i < stream) {
        const x = -2.9 + rand() * 5.8;
        put(i, x, Math.sin(x * 1.1) * 0.32 + (rand() - 0.5) * 0.03, (rand() - 0.5) * 0.03);
        continue;
      }
      const k = Math.min(3, Math.floor((i - stream) / per));
      const [cx, cy] = centre(k);
      if (k === 0) {
        put(i, cx + (rand() - 0.5) * 1.1, cy + (rand() - 0.5) * 1.1, (rand() - 0.5) * 1.1);
      } else if (k === 1) {
        // Edges only: a bare frame.
        const p = [0, 0, 0];
        const free = Math.floor(rand() * 3);
        for (let a = 0; a < 3; a++) p[a] = a === free ? (rand() * 2 - 1) * 0.36 : rand() < 0.5 ? -0.36 : 0.36;
        put(i, cx + p[0], cy + p[1], p[2]);
      } else {
        const u = rand() * 2 - 1;
        const t = rand() * TAU;
        const s = Math.sqrt(1 - u * u);
        const facets = k === 2 ? 5 : 0;
        const q = (v: number) => (facets ? Math.round(v * facets) / facets : v);
        const r = k === 2 ? 0.44 : 0.44 * Math.pow(rand(), 0.33);
        put(i, cx + r * q(s * Math.cos(t)), cy + r * q(u), r * q(s * Math.sin(t)));
      }
    }
  },
  // Seven blocks of different heights on one floor: the component set.
  blocks(n, rand, put) {
    const slots: [number, number, number][] = [
      [-1.2, -0.62, 0.52],
      [-0.4, -0.62, 0.86],
      [0.4, -0.62, 0.4],
      [1.2, -0.62, 0.7],
      [-0.8, 0.3, 0.64],
      [0, 0.3, 0.34],
      [0.8, 0.3, 0.98],
    ];
    const half = 0.33;
    for (let i = 0; i < n; i++) {
      const [sx, sz, h] = slots[i % slots.length];
      const p = cubePoint(rand, half);
      const y = ((p[1] / half + 1) / 2) * h - 0.45;
      put(i, sx + p[0], y, sz + p[2]);
    }
  },
  // A ring to send a message through.
  ring(n, rand, put) {
    for (let i = 0; i < n; i++) {
      const t = rand() * TAU;
      const inner = rand() < 0.16;
      const R = inner ? 0.62 : 1.18;
      const r = inner ? 0.01 : 0.13 * Math.sqrt(rand());
      const a = rand() * TAU;
      put(i, (R + r * Math.cos(a)) * Math.cos(t), (R + r * Math.cos(a)) * Math.sin(t), r * Math.sin(a));
    }
  },
  // The game's arena: a thin ring, the rest far dust.
  gate(n, rand, put) {
    for (let i = 0; i < n; i++) {
      const t = rand() * TAU;
      if (rand() < 0.55) {
        const r = 1 + (rand() - 0.5) * 0.012;
        put(i, r * Math.cos(t), r * Math.sin(t), 0);
      } else {
        const r = 1.5 + rand() * 3.4;
        put(i, r * Math.cos(t), r * Math.sin(t), -rand() * 3);
      }
    }
  },
};

/** How each formation sits and turns. spin: 'y' orbits, 'z' wheels, 'sway' holds an isometric view. */
const ATTITUDE: Record<Formation, { rx: number; ry: number; spin: 'y' | 'z' | 'sway' | 'none' }> = {
  core: { rx: 0.18, ry: 0, spin: 'y' },
  stack: { rx: 0.52, ry: 0.74, spin: 'sway' },
  path: { rx: 0.1, ry: 0, spin: 'none' },
  blocks: { rx: 0.6, ry: 0.72, spin: 'sway' },
  ring: { rx: 0.5, ry: -0.5, spin: 'z' },
  gate: { rx: 0, ry: 0, spin: 'z' },
};

const VERT = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec4 aSeed; // phase, size, tint, delay
  uniform float uT;
  uniform float uTime;
  uniform float uPx;
  uniform float uBurst;
  varying float vTint;
  varying float vDepth;

  void main() {
    float t = clamp((uT - aSeed.w * 0.3) / 0.7, 0.0, 1.0);
    float e = t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
    vec3 p = mix(aFrom, aTo, e);
    float ph = aSeed.x * 6.2831853;
    vec3 swirl = vec3(sin(ph + uTime * 0.7), cos(ph * 1.7 + uTime * 0.6), sin(ph * 2.3 + uTime * 0.5));
    p += swirl * (sin(3.14159265 * t) * 0.42 + uBurst * 0.5);
    p += normalize(p + 0.0001) * sin(uTime * 0.8 + ph) * 0.012;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPx * (0.55 + aSeed.y) * (7.0 / -mv.z);
    vTint = aSeed.z;
    vDepth = smoothstep(9.5, 5.6, -mv.z);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uAlpha;
  varying float vTint;
  varying float vDepth;

  void main() {
    vec3 c = mix(uInk, uAccent, vTint);
    float a = uAlpha * mix(0.28, 0.95, vDepth) * mix(0.78, 1.0, vTint);
    gl_FragColor = vec4(c, a);
  }
`;

export class CoreField {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(35, 1, 0.1, 50);
  private group = new Group();
  private geometry = new BufferGeometry();
  private material: ShaderMaterial;
  private count: number;
  private from: Float32Array;
  private to: Float32Array;
  private seeds: Float32Array;
  private cache = new Map<Formation, Float32Array>();

  private formation: Formation = 'core';
  private t = 1;
  private duration = 1.5;
  private time = 0;
  private spin = 0;
  private burst = 0;
  private pose: Pose = { x: 0, y: 0, size: 0.6, alpha: 1 };
  private live = { x: 0, y: 0, scale: 1, alpha: 0, rx: 0.18, ry: 0, rz: 0 };
  private pointer = { x: 0, y: 0 };
  private width = 1;
  private height = 1;
  private raf = 0;
  private last = 0;
  private reduced: boolean;
  private running = false;

  constructor(canvas: HTMLCanvasElement, opts: { reduced: boolean; compact: boolean }) {
    this.reduced = opts.reduced;
    this.count = opts.compact ? 5200 : 9800;
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    // A GPU that rejects the shader gets the still CSS ground instead of an empty canvas.
    this.renderer.debug.onShaderError = () => {
      canvas.dataset.failed = 'true';
    };
    this.camera.position.z = 7;

    this.from = new Float32Array(this.count * 3);
    this.to = new Float32Array(this.count * 3);
    this.seeds = new Float32Array(this.count * 4);
    const rand = mulberry32(7);
    for (let i = 0; i < this.count; i++) {
      this.seeds[i * 4] = rand();
      this.seeds[i * 4 + 1] = rand();
      this.seeds[i * 4 + 2] = rand() < 0.12 ? 1 : 0;
      this.seeds[i * 4 + 3] = rand();
      // First paint: scattered wide, so the object assembles on load.
      const r = 2.5 + rand() * 4;
      const a = rand() * TAU;
      const u = rand() * 2 - 1;
      const s = Math.sqrt(1 - u * u);
      this.from[i * 3] = r * s * Math.cos(a);
      this.from[i * 3 + 1] = r * u;
      this.from[i * 3 + 2] = r * s * Math.sin(a) - 2;
    }
    this.to.set(this.build('core'));

    this.geometry.setAttribute('position', new BufferAttribute(this.to, 3));
    this.geometry.setAttribute('aFrom', new BufferAttribute(this.from, 3));
    this.geometry.setAttribute('aTo', new BufferAttribute(this.to, 3));
    this.geometry.setAttribute('aSeed', new BufferAttribute(this.seeds, 4));
    this.geometry.boundingSphere = new Sphere(new Vector3(), 20);

    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uT: { value: 0 },
        uTime: { value: 0 },
        uPx: { value: 2 },
        uBurst: { value: 0 },
        uAlpha: { value: 0 },
        uInk: { value: new Color('#e9edf3') },
        uAccent: { value: new Color('#5ab9fc') },
      },
    });
    this.group.add(new Points(this.geometry, this.material));
    this.scene.add(this.group);
    this.t = this.reduced ? 1 : 0;
    this.duration = 1.9;
  }

  private build(name: Formation) {
    let buf = this.cache.get(name);
    if (!buf) {
      buf = new Float32Array(this.count * 3);
      const out = buf;
      BUILDERS[name](this.count, mulberry32(name.length * 97 + name.charCodeAt(0)), (i, x, y, z) => {
        out[i * 3] = x;
        out[i * 3 + 1] = y;
        out[i * 3 + 2] = z;
      });
      this.cache.set(name, buf);
    }
    return buf;
  }

  /** Morph every particle to the next shape, starting from wherever it is now. */
  setFormation(name: Formation, seconds = 1.5) {
    if (name === this.formation && this.t >= 1) return;
    const t = this.t;
    for (let i = 0; i < this.count; i++) {
      const local = Math.min(1, Math.max(0, (t - this.seeds[i * 4 + 3] * 0.3) / 0.7));
      const e = local < 0.5 ? 4 * local * local * local : 1 - Math.pow(-2 * local + 2, 3) / 2;
      for (let a = 0; a < 3; a++) {
        const k = i * 3 + a;
        this.from[k] = this.from[k] + (this.to[k] - this.from[k]) * e;
      }
    }
    this.to.set(this.build(name));
    this.geometry.attributes.aFrom.needsUpdate = true;
    this.geometry.attributes.aTo.needsUpdate = true;
    this.formation = name;
    this.duration = seconds;
    this.t = this.reduced ? 1 : 0;
    this.kick();
  }

  setPose(pose: Pose) {
    this.pose = pose;
    this.kick();
  }

  setPointer(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
  }

  /** A short shake of the whole field, for a hit in the game or a click. */
  pulse(amount = 0.35) {
    if (this.reduced) return;
    this.burst = Math.min(1, this.burst + amount);
  }

  resize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uPx.value = (this.height / 900) * 1.7 * dpr;
    this.kick();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private kick() {
    // Under reduced motion nothing loops: draw the settled state once.
    if (this.reduced) requestAnimationFrame(() => this.draw(0, true));
  }

  private frame = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (!this.reduced) this.draw(dt, false);
    this.raf = requestAnimationFrame(this.frame);
  };

  private draw(dt: number, snap: boolean) {
    const u = this.material.uniforms;
    this.time += dt;
    this.t = Math.min(1, this.t + dt / this.duration);
    this.burst *= Math.pow(0.02, dt);
    u.uT.value = this.t;
    u.uTime.value = this.time;
    u.uBurst.value = this.burst;

    const visH = 2 * this.camera.position.z * Math.tan((this.camera.fov * Math.PI) / 360);
    const visW = visH * this.camera.aspect;
    const shortHalf = Math.min(visW, visH) / 2;
    const att = ATTITUDE[this.formation];
    const k = snap ? 1 : 1 - Math.pow(0.012, dt);
    const L = this.live;
    L.x += ((this.pose.x * visW) / 2 - L.x) * k;
    L.y += ((this.pose.y * visH) / 2 - L.y) * k;
    L.scale += (this.pose.size * shortHalf - L.scale) * k;
    L.alpha += (this.pose.alpha - L.alpha) * (snap ? 1 : 1 - Math.pow(0.05, dt));

    if (att.spin === 'y') this.spin += dt * 0.11;
    else if (att.spin === 'z') this.spin += dt * 0.06;
    const sway = att.spin === 'sway' ? Math.sin(this.time * 0.25) * 0.16 : 0;
    const targetRx = att.rx + this.pointer.y * 0.1;
    const targetRy = att.ry + sway + this.pointer.x * 0.16 + (att.spin === 'y' ? this.spin : 0);
    const targetRz = att.spin === 'z' ? this.spin : 0;
    L.rx += (targetRx - L.rx) * k;
    // Take the short way round when a formation stops orbiting.
    let dy = targetRy - L.ry;
    dy = ((((dy + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
    L.ry += dy * k;
    let dz = targetRz - L.rz;
    dz = ((((dz + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
    L.rz += dz * k;

    this.group.position.set(L.x, L.y, 0);
    this.group.scale.setScalar(L.scale);
    this.group.rotation.set(L.rx, L.ry, L.rz);
    u.uAlpha.value = L.alpha;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
