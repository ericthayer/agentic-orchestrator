import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type { CoreField, Pose } from './gl/CoreField';
import { ROUTES, routeFromPath, type RouteDef, type RouteId, type TransitionKind } from './routes';

type Phase = 'idle' | 'out' | 'in';

interface TransitionState {
  route: RouteDef;
  phase: Phase;
  kind: TransitionKind;
  target: RouteDef | null;
  /** -1 when the target sits before the current page in the nav, else 1. */
  direction: 1 | -1;
  go: (path: string, kind?: TransitionKind) => void;
  pulse: (amount?: number) => void;
  /** The closing section is on screen: the object rises behind the next page's name. */
  setClosing: (on: boolean) => void;
  reduced: boolean;
}

const TransitionContext = createContext<TransitionState | null>(null);

/** Milliseconds each kind spends leaving and arriving. */
const TIMING: Record<TransitionKind, { out: number; in: number }> = {
  curtain: { out: 640, in: 760 },
  morph: { out: 460, in: 900 },
  dive: { out: 980, in: 800 },
  surface: { out: 560, in: 800 },
};

const POSES: Record<RouteId, { wide: Pose; narrow: Pose }> = {
  home: { wide: { x: 0, y: -0.37, size: 0.46, alpha: 1 }, narrow: { x: 0, y: -0.46, size: 0.44, alpha: 1 } },
  method: { wide: { x: 0.46, y: 0, size: 0.37, alpha: 0.95 }, narrow: { x: 0, y: -0.5, size: 0.42, alpha: 0.8 } },
  'case-study': { wide: { x: 0, y: -0.36, size: 0.38, alpha: 0.95 }, narrow: { x: 0, y: -0.52, size: 0.3, alpha: 0.8 } },
  components: { wide: { x: 0.56, y: 0.5, size: 0.26, alpha: 0.9 }, narrow: { x: 0, y: -0.78, size: 0.3, alpha: 0 } },
  contact: { wide: { x: -0.56, y: -0.58, size: 0.3, alpha: 0.9 }, narrow: { x: 0, y: -0.82, size: 0.34, alpha: 0 } },
  play: { wide: { x: 0, y: 0, size: 0.72, alpha: 1 }, narrow: { x: 0, y: 0, size: 0.72, alpha: 1 } },
};

/** Where the object stands while a page's closing section is on screen. */
const CLOSE_POSE: { wide: Pose; narrow: Pose } = {
  wide: { x: 0.34, y: 0.34, size: 0.3, alpha: 1 },
  narrow: { x: 0.2, y: 0.42, size: 0.34, alpha: 0.9 },
};

/** The game's ring radius as a share of the viewport's shorter side; the particles' gate matches it. */
export const GATE_RADIUS = POSES.play.wide.size / 2;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<RouteDef>(() => routeFromPath(window.location.pathname));
  const [phase, setPhase] = useState<Phase>('idle');
  const [kind, setKind] = useState<TransitionKind>('curtain');
  const [target, setTarget] = useState<RouteDef | null>(null);
  const [fieldRoute, setFieldRoute] = useState<RouteDef>(route);
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [fieldVersion, setFieldVersion] = useState(0);
  const [closing, setClosing] = useState(false);
  const busy = useRef(false);
  const current = useRef(route);
  const field = useRef<CoreField | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const run = useCallback(
    (next: RouteDef, requested: TransitionKind, push: boolean) => {
      const from = current.current;
      if (busy.current || next.id === from.id) return;
      const how: TransitionKind = next.id === 'play' ? 'dive' : from.id === 'play' ? 'surface' : requested;
      const still = prefersReducedMotion();
      const time = still ? { out: 0, in: 0 } : TIMING[how];
      busy.current = true;
      setTarget(next);
      setKind(how);
      setPhase('out');
      // The curtain hides the stage, so its morph starts when the page swaps; the others morph in the open.
      if (how !== 'curtain') setFieldRoute(next);

      const commit = () => {
        current.current = next;
        setRoute(next);
        setFieldRoute(next);
        setPhase('in');
        if (push) window.history.pushState({}, '', next.path);
        window.scrollTo(0, 0);
        document.title = next.title;
        timers.current.push(
          window.setTimeout(() => {
            setPhase('idle');
            setTarget(null);
            busy.current = false;
            document.getElementById('top')?.focus({ preventScroll: true });
          }, time.in),
        );
      };
      timers.current.push(window.setTimeout(commit, time.out));
    },
    [],
  );

  const go = useCallback(
    (path: string, requested: TransitionKind = 'curtain') => {
      const next = routeFromPath(path);
      if (next.id === current.current.id) {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        return;
      }
      run(next, requested, true);
    },
    [run],
  );

  useEffect(() => {
    const onPop = () => {
      const next = routeFromPath(window.location.pathname);
      if (busy.current) {
        // A second Back during a transition: settle on the address bar's page at once.
        timers.current.forEach(clearTimeout);
        timers.current = [];
        busy.current = false;
        current.current = next;
        setRoute(next);
        setFieldRoute(next);
        setPhase('idle');
        setTarget(null);
        return;
      }
      run(next, 'curtain', false);
    };
    window.addEventListener('popstate', onPop);
    const pending = timers.current;
    return () => {
      window.removeEventListener('popstate', onPop);
      pending.forEach(clearTimeout);
    };
  }, [run]);

  useEffect(() => {
    document.title = current.current.title;
  }, []);

  // The one WebGL context of the site. three.js loads after the first paint, so the words never wait for it.
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let instance: CoreField | null = null;
    let cancelled = false;
    const fit = () => instance?.resize(window.innerWidth, window.innerHeight);
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      instance?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    const onVisible = () => (document.hidden ? instance?.stop() : instance?.start());
    import('./gl/CoreField')
      .then((mod) => {
        if (cancelled) return;
        instance = new mod.CoreField(el, { reduced, compact: window.innerWidth < 768 });
        field.current = instance;
        fit();
        instance.start();
        setFieldVersion((v) => v + 1);
      })
      .catch(() => {
        // No WebGL: the pages are complete without the object.
        el.dataset.failed = 'true';
      });
    window.addEventListener('resize', fit);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', fit);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisible);
      instance?.dispose();
      field.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    const instance = field.current;
    if (!instance) return;
    const apply = () => {
      const pose = (closing ? CLOSE_POSE : POSES[fieldRoute.id])[window.innerWidth < 900 ? 'narrow' : 'wide'];
      instance.setPose(pose);
    };
    instance.setFormation(fieldRoute.formation, fieldRoute.id === 'play' ? 1.3 : 1.6);
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [fieldRoute, fieldVersion, closing]);

  const pulse = useCallback((amount?: number) => field.current?.pulse(amount), []);

  const direction: 1 | -1 =
    target && ROUTES.indexOf(target) < ROUTES.indexOf(route) ? -1 : 1;

  const value = useMemo<TransitionState>(
    () => ({ route, phase, kind, target, direction, go, pulse, setClosing, reduced }),
    [route, phase, kind, target, direction, go, pulse, reduced],
  );

  return (
    <TransitionContext.Provider value={value}>
      <canvas ref={canvas} className="core-field" aria-hidden="true" />
      {children}
    </TransitionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error('useTransition must be used inside TransitionProvider');
  return ctx;
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  kind?: TransitionKind;
}

/** An in-site link: a real anchor that hands the click to the transition. */
export function Link({ to, kind = 'curtain', onClick, children, ...rest }: LinkProps) {
  const { go } = useTransition();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(to, kind);
  };
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  );
}

/** What covers or marks the stage while a page changes. */
export function TransitionOverlay() {
  const { phase, kind, target, direction } = useTransition();
  if (phase === 'idle' || !target) return null;
  if (kind === 'curtain') {
    return (
      <div className="tx tx--curtain" data-phase={phase} data-dir={direction === 1 ? 'up' : 'down'} aria-hidden="true">
        <div className="tx__panel">
          <div className="wrap tx__label">
            <span className="tx__index">{target.index}</span>
            <span className="tx__word">{target.label}</span>
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'morph') {
    return (
      <div className="tx tx--morph" data-phase={phase} aria-hidden="true">
        <span className="tx__bar" />
        <div className="wrap tx__readout">
          <span>{target.index}</span>
          <span>{target.path}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={`tx tx--iris tx--${kind}`} data-phase={phase} aria-hidden="true">
      <span className="tx__ring" />
      <span className="tx__ring tx__ring--late" />
      <span className="tx__note">{kind === 'dive' ? 'Handing you the controls' : 'Back to the site'}</span>
    </div>
  );
}
