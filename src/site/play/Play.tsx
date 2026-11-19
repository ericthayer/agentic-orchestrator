import { useCallback, useEffect, useRef, useState } from 'react';
import { GATE_RADIUS, Link, useTransition } from '../transition';
import { vars } from '../vars';

/**
 * Spec Gate: turn a shield round the core. Specs must reach the core,
 * vibes must not. Twelve specs ship a release; five vibes end the run.
 * The arena's ring is the site's particle field in its "gate" formation.
 */

type Kind = 'spec' | 'vibe';
interface Packet {
  angle: number;
  dist: number;
  speed: number;
  kind: Kind;
  phase: number;
}
interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  accent: boolean;
}
type Status = 'ready' | 'running' | 'paused' | 'over';

const TAU = Math.PI * 2;
const SPECS_PER_RELEASE = 12;
const MAX_INTEGRITY = 5;
const VERSIONS = ['v1.0.0', 'v1.1.0', 'v1.2.0', 'v2.0.0', 'v2.1.0', 'v2.2.0', 'v3.0.0'];
const versionAt = (level: number) => VERSIONS[level] ?? `v3.${level - VERSIONS.length + 1}.0`;
const INK = '#e9edf3';
const MUTED = '#8891a1';
const ACCENT = '#5ab9fc';

function angleDiff(a: number, b: number) {
  return ((((a - b + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
}

interface Hud {
  status: Status;
  level: number;
  specs: number;
  merged: number;
  integrity: number;
  note: string;
}

const FRESH: Hud = { status: 'ready', level: 0, specs: 0, merged: 0, integrity: MAX_INTEGRITY, note: '' };

export function Play() {
  const { pulse, reduced } = useTransition();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hud, setHud] = useState<Hud>(FRESH);
  const game = useRef({
    ...FRESH,
    packets: [] as Packet[],
    sparks: [] as Spark[],
    shield: -Math.PI / 2,
    aim: -Math.PI / 2,
    turn: 0,
    spawnIn: 0.6,
    flash: 0,
    hurt: 0,
    banner: 0,
    w: 1,
    h: 1,
    time: 0,
  });
  const raf = useRef(0);
  const last = useRef(0);

  const sync = useCallback((note?: string) => {
    const g = game.current;
    if (note !== undefined) g.note = note;
    setHud({ status: g.status, level: g.level, specs: g.specs, merged: g.merged, integrity: g.integrity, note: g.note });
  }, []);

  const draw = useCallback(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const g = game.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const R = GATE_RADIUS * Math.min(g.w, g.h);
    const arc = Math.max(0.4, 0.62 - g.level * 0.035);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, g.w, g.h);
    const shake = g.hurt > 0 && !reduced ? Math.sin(g.time * 90) * g.hurt * 6 : 0;
    ctx.translate(g.w / 2 + shake, g.h / 2);

    // Shield.
    ctx.lineCap = 'butt';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, R, g.shield - arc, g.shield + arc);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(0, 0, R - 9, g.shield - arc, g.shield + arc);
    ctx.stroke();

    // Core, with integrity pips round it.
    const coreSize = 16 + g.flash * 10;
    ctx.save();
    ctx.rotate(g.time * 0.4);
    ctx.fillStyle = g.hurt > 0.4 ? INK : ACCENT;
    ctx.fillRect(-coreSize / 2, -coreSize / 2, coreSize, coreSize);
    ctx.restore();
    for (let i = 0; i < MAX_INTEGRITY; i++) {
      const a = -Math.PI / 2 + (i / MAX_INTEGRITY) * TAU;
      ctx.fillStyle = i < g.integrity ? INK : 'rgba(233,237,243,0.18)';
      ctx.fillRect(Math.cos(a) * 34 - 2.5, Math.sin(a) * 34 - 2.5, 5, 5);
    }

    // Packets.
    for (const p of g.packets) {
      const wobble = p.kind === 'vibe' ? Math.sin(g.time * 7 + p.phase) * 0.035 : 0;
      const a = p.angle + wobble;
      const x = Math.cos(a) * p.dist;
      const y = Math.sin(a) * p.dist;
      const tx = Math.cos(a) * (p.dist + 26);
      const ty = Math.sin(a) * (p.dist + 26);
      ctx.lineWidth = 1;
      ctx.strokeStyle = p.kind === 'spec' ? 'rgba(90,185,252,0.45)' : 'rgba(136,145,161,0.4)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.save();
      ctx.translate(x, y);
      if (p.kind === 'spec') {
        ctx.rotate(a);
        ctx.fillStyle = ACCENT;
        ctx.fillRect(-5, -5, 10, 10);
      } else {
        ctx.rotate(a + Math.PI / 4 + g.time * 2);
        ctx.strokeStyle = MUTED;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-6, -6, 12, 12);
      }
      ctx.restore();
    }

    for (const s of g.sparks) {
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.accent ? ACCENT : INK;
      ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;
  }, [reduced]);

  const burst = (x: number, y: number, accent: boolean, n = 8) => {
    if (reduced) return;
    const g = game.current;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU;
      const v = 60 + Math.random() * 160;
      g.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, accent });
    }
  };

  const step = useCallback(
    (dt: number) => {
      const g = game.current;
      const R = GATE_RADIUS * Math.min(g.w, g.h);
      const arc = Math.max(0.4, 0.62 - g.level * 0.035);
      const scale = R / 324;
      g.time += dt;
      g.flash = Math.max(0, g.flash - dt * 3);
      g.hurt = Math.max(0, g.hurt - dt * 2.2);
      g.banner = Math.max(0, g.banner - dt);

      if (g.turn) g.aim += g.turn * 3.4 * dt;
      g.shield += angleDiff(g.aim, g.shield) * Math.min(1, dt * 18);

      g.spawnIn -= dt;
      if (g.spawnIn <= 0 && g.banner <= 0) {
        const vibe = Math.random() < Math.min(0.6, 0.44 + g.level * 0.025);
        g.packets.push({
          angle: Math.random() * TAU,
          dist: Math.hypot(g.w, g.h) / 2 + 30,
          speed: (128 + g.level * 22 + Math.random() * 36) * scale,
          kind: vibe ? 'vibe' : 'spec',
          phase: Math.random() * TAU,
        });
        g.spawnIn = Math.max(0.4, 1.25 - g.level * 0.11) * (0.75 + Math.random() * 0.5);
      }

      let changed = false;
      g.packets = g.packets.filter((p) => {
        const before = p.dist;
        p.dist -= p.speed * dt;
        if (before > R && p.dist <= R && Math.abs(angleDiff(p.angle, g.shield)) <= arc) {
          burst(Math.cos(p.angle) * R, Math.sin(p.angle) * R, p.kind === 'spec');
          if (p.kind === 'vibe') pulse(0.1);
          else {
            g.note = 'A spec was blocked.';
            changed = true;
          }
          return false;
        }
        if (p.dist <= 14) {
          if (p.kind === 'spec') {
            g.specs += 1;
            g.merged += 1;
            g.flash = 1;
            if (g.specs >= SPECS_PER_RELEASE) {
              g.note = `Shipped ${versionAt(g.level)}.`;
              g.level += 1;
              g.specs = 0;
              g.integrity = Math.min(MAX_INTEGRITY, g.integrity + 1);
              g.banner = 1.8;
              g.packets = [];
              pulse(0.7);
            }
          } else {
            g.integrity -= 1;
            g.hurt = 1;
            g.note = 'A vibe reached the core.';
            pulse(0.45);
            if (g.integrity <= 0) g.status = 'over';
          }
          changed = true;
          return false;
        }
        return true;
      });
      g.sparks = g.sparks.filter((s) => {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt * 2.2;
        return s.life > 0;
      });
      if (changed) sync();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pulse, sync, reduced],
  );

  const loop = useCallback(
    (now: number) => {
      const g = game.current;
      const dt = Math.min(0.04, (now - last.current) / 1000);
      last.current = now;
      if (g.status === 'running') step(dt);
      draw();
      if (g.status === 'running') raf.current = requestAnimationFrame(loop);
    },
    [draw, step],
  );

  const resume = useCallback(() => {
    cancelAnimationFrame(raf.current);
    last.current = performance.now();
    raf.current = requestAnimationFrame(loop);
  }, [loop]);

  const start = () => {
    const g = game.current;
    Object.assign(g, FRESH, { status: 'running', packets: [], sparks: [], spawnIn: 0.6, banner: 0, flash: 0, hurt: 0 });
    sync('The run has started.');
    resume();
    canvas.current?.focus();
  };

  const togglePause = useCallback(() => {
    const g = game.current;
    if (g.status === 'running') g.status = 'paused';
    else if (g.status === 'paused') g.status = 'running';
    else return;
    sync(g.status === 'paused' ? 'Paused.' : 'Running.');
    if (g.status === 'running') resume();
  }, [resume, sync]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const g = game.current;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      g.w = window.innerWidth;
      g.h = window.innerHeight;
      el.width = Math.round(g.w * dpr);
      el.height = Math.round(g.h * dpr);
      draw();
    };
    const onPointer = (e: PointerEvent) => {
      g.aim = Math.atan2(e.clientY - g.h / 2, e.clientX - g.w / 2);
      g.turn = 0;
      if (g.status !== 'running') {
        g.shield = g.aim;
        draw();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      const down = e.type === 'keydown';
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') g.turn = down ? -1 : g.turn === -1 ? 0 : g.turn;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') g.turn = down ? 1 : g.turn === 1 ? 0 : g.turn;
      else if (down && (e.key === 'p' || e.key === 'P' || e.key === 'Escape')) togglePause();
      else return;
      if (g.status !== 'running' && g.turn) {
        g.aim += g.turn * 0.12;
        g.shield = g.aim;
        draw();
      }
    };
    const onHidden = () => {
      if (document.hidden && g.status === 'running') togglePause();
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', fit);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [draw, togglePause]);

  const playing = hud.status === 'running' || hud.status === 'paused';

  return (
    <section className="play" aria-labelledby="play-title">
      <canvas ref={canvas} className="play__canvas" tabIndex={-1} role="img" aria-label="The arena: a shield turning on a ring round the core" />

      <div className="wrap play__hud">
        <div className="play__meter rise-soft" style={vars({ '--i': 1 })}>
          <p className="label">
            Release <span className="mono">{versionAt(hud.level)}</span>
          </p>
          <div className="play__bar" role="img" aria-label={`${hud.specs} of ${SPECS_PER_RELEASE} specs merged`}>
            {Array.from({ length: SPECS_PER_RELEASE }, (_, i) => (
              <span key={i} data-on={i < hud.specs} />
            ))}
          </div>
        </div>
        <div className="play__meter play__meter--end rise-soft" style={vars({ '--i': 2 })}>
          <p className="label">Integrity</p>
          <div className="play__pips" role="img" aria-label={`${hud.integrity} of ${MAX_INTEGRITY} integrity left`}>
            {Array.from({ length: MAX_INTEGRITY }, (_, i) => (
              <span key={i} data-on={i < hud.integrity} />
            ))}
          </div>
        </div>
        <p className="play__keys mono rise-soft" style={vars({ '--i': 3 })}>
          Pointer or arrow keys to turn, P to pause
        </p>
        <div className="play__actions rise-soft" style={vars({ '--i': 3 })}>
          {playing && (
            <button type="button" className="btn btn--secondary" onClick={togglePause}>
              {hud.status === 'paused' ? 'Resume the run' : 'Pause the run'}
            </button>
          )}
          <Link className="btn btn--secondary" to="/">
            Leave the game
          </Link>
        </div>
      </div>

      {!playing && (
        <div className="play__panel rise-soft" style={vars({ '--i': 2 })}>
          {hud.status === 'ready' ? (
            <>
              <h1 className="play__title" id="play-title">
                Spec Gate, an arcade game
              </h1>
              <p>
                Turn the shield to block the grey vibes and let the blue specs through to the core. Twelve specs ship a release;
                five vibes end the run.
              </p>
              <button type="button" className="btn btn--primary" onClick={start}>
                Start the run
              </button>
            </>
          ) : (
            <>
              <h1 className="play__title" id="play-title">
                Integrity lost at {versionAt(hud.level)}
              </h1>
              <p>
                You shipped {hud.level} {hud.level === 1 ? 'release' : 'releases'} and merged {hud.merged}{' '}
                {hud.merged === 1 ? 'spec' : 'specs'}.
              </p>
              <button type="button" className="btn btn--primary" onClick={start}>
                Start a new run
              </button>
            </>
          )}
        </div>
      )}
      {playing && (
        <h1 className="sr-only" id="play-title">
          Spec Gate, an arcade game
        </h1>
      )}
      {hud.status === 'paused' && <p className="play__paused mono">Paused</p>}
      <p className="sr-only" role="status" aria-live="polite">
        {hud.note}
      </p>
    </section>
  );
}
