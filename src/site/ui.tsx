import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { vars } from './vars';
import { Link, useTransition } from './transition';
import { REPO_URL, ROUTES, nextRoute, type RouteId } from './routes';

export function Arrow() {
  return (
    <svg className="m-arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d="M12 3 21 7.5 12 12 3 7.5 12 3Z" fill="currentColor" />
      <path d="m3 12 9 4.5 9-4.5M3 16.5 12 21l9-4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** A headline that arrives line by line when its page enters. */
export function Lines({ lines, as: Tag = 'h1', className, start = 0, id }: { lines: string[]; as?: 'h1' | 'h2'; className?: string; start?: number; id?: string }) {
  return (
    <Tag className={className} id={id} aria-label={lines.join(' ')}>
      {lines.map((line, i) => (
        <span className="line" key={line} aria-hidden="true">
          <span className="rise" style={vars({ '--i': start + i })}>
            {line}{' '}
          </span>
        </span>
      ))}
    </Tag>
  );
}

export function Rise({ i, children, className }: { i: number; children: ReactNode; className?: string }) {
  return (
    <div className={`rise-soft${className ? ` ${className}` : ''}`} style={vars({ '--i': i })}>
      {children}
    </div>
  );
}

/** A slow band of words between sections. Decorative, large screens only, still under reduced motion. */
export function Ticker({ words }: { words: string[] }) {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {[0, 1].map((copy) => (
          <ul className="ticker__set" key={copy}>
            {words.concat(words).map((w, i) => (
              <li key={`${w}-${i}`}>{w}</li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function TemplateButton() {
  return (
    <a className="btn btn--primary" href={REPO_URL} target="_blank" rel="noreferrer">
      Get the template
      <span className="sr-only"> (opens GitHub in a new tab)</span>
      <Arrow />
    </a>
  );
}

export function Nav() {
  const { route, phase } = useTransition();
  const [open, setOpen] = useState(false);
  const words = ROUTES.filter((r) => r.id !== 'home');

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    return () => document.documentElement.classList.remove('menu-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="nav" data-busy={phase !== 'idle'}>
      <div className="wrap nav__row">
        <a className="skip-link" href="#top">
          Skip to content
        </a>
        <Link className="nav__logo" to="/" onClick={() => setOpen(false)}>
          <Mark />
          <span>Agentic Orchestrator</span>
        </Link>
        <nav className="nav__words" aria-label="Main">
          {words.map((r) => (
            <Link key={r.id} to={r.path} className="nav__word" aria-current={route.id === r.id ? 'page' : undefined}>
              {r.label}
            </Link>
          ))}
        </nav>
        <div className="nav__end">
          <TemplateButton />
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="menu-sheet"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? 'Close the menu' : 'Open the menu'}</span>
            <span className="nav__bars" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="sheet" id="menu-sheet" hidden={!open}>
        <nav className="wrap sheet__list" aria-label="Menu">
          {ROUTES.map((r) => (
            <Link key={r.id} to={r.path} className="sheet__row" onClick={() => setOpen(false)} aria-current={route.id === r.id ? 'page' : undefined}>
              <span className="mono">{r.index}</span>
              {r.label}
            </Link>
          ))}
          <TemplateButton />
        </nav>
      </div>
    </header>
  );
}

/**
 * The closing section: row 1 the next page's name, set as large as the screen
 * allows (the dealt close-word); row 2 the directory.
 */
export function Footer({ from }: { from: RouteId }) {
  const next = nextRoute(from);
  const kind = next.id === 'play' ? 'dive' : 'morph';
  const { setClosing } = useTransition();
  const close = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = close.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setClosing(entry.isIntersecting), { threshold: 0.6 });
    io.observe(el);
    return () => {
      io.disconnect();
      setClosing(false);
    };
  }, [setClosing]);

  return (
    <footer className="footer closing">
      <div className="wrap footer__wrap">
        <div className="close" ref={close}>
          <p className="label">
            <span className="mono">{next.index}</span> Next page
          </p>
          <Link to={next.path} kind={kind} className="close__link">
            <h2 className="close__word">{next.label}</h2>
            <span className="close__arrow" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="64" height="64">
                <path d="M8 32h46M36 14l18 18-18 18" fill="none" stroke="currentColor" strokeWidth="3" />
              </svg>
            </span>
          </Link>
        </div>
        <div className="footer__dir">
          <div className="footer__grid">
            <div className="footer__brand">
              <p className="footer__name">Agentic Orchestrator</p>
              <p className="footer__line">A template for spec-driven development with coding agents.</p>
            </div>
            <div className="footer__col footer__col--site">
              <h3 className="label">Site</h3>
              <ul>
                {ROUTES.filter((r) => r.id !== 'home').map((r) => (
                  <li key={r.id}>
                    <Link to={r.path} className="footer__link">
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer__col footer__col--template">
              <h3 className="label">Template</h3>
              <ul>
                <li>
                  <a className="footer__link" href={REPO_URL} target="_blank" rel="noreferrer">
                    GitHub repository
                  </a>
                </li>
                <li>
                  <a className="footer__link" href={`${REPO_URL}/blob/main/CHANGELOG.md`} target="_blank" rel="noreferrer">
                    Changelog
                  </a>
                </li>
                <li>
                  <a className="footer__link" href={`${REPO_URL}/blob/main/TEMPLATE_GUIDE.md`} target="_blank" rel="noreferrer">
                    Template guide
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="footer__legal">
            © 2026 Agentic Orchestrator, <span className="mono">v{__APP_VERSION__}</span>. Product names and logos are trademarks of
            their owners.
          </p>
        </div>
      </div>
    </footer>
  );
}

/** A software window: one radius, one line, a title in the bar. */
export function Window({ title, children, className, label }: { title: string; children: ReactNode; className?: string; label: string }) {
  return (
    <div className={`window${className ? ` ${className}` : ''}`} role="img" aria-label={label}>
      <div className="window__bar" aria-hidden="true">
        <span className="window__dot" />
        <span className="window__title mono">{title}</span>
      </div>
      <div className="window__body" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

const STACK: { file: string; name: string }[] = [
  { file: 'react', name: 'React 19' },
  { file: 'threejs', name: 'Three.js' },
  { file: 'tailwindcss', name: 'Tailwind v4' },
  { file: 'storybook', name: 'Storybook 10' },
  { file: 'vitejs', name: 'Vite' },
  { file: 'typescript', name: 'TypeScript' },
];

export function StackRow() {
  return (
    <ul className="stack-row">
      {STACK.map((s) => (
        <li key={s.file} className="stack-row__item">
          <span className="stack-row__tile">
            <img src={`/icons/${s.file}.svg`} alt="" width="22" height="22" />
          </span>
          {s.name}
        </li>
      ))}
    </ul>
  );
}

/**
 * Moment: liquid type. The statement ripples like type under water where a
 * fine pointer crosses it, and is crisp again within a second.
 */
export function LiquidType({ lines, id }: { lines: string[]; id: string }) {
  const { reduced } = useTransition();
  const filterId = `liquid-${useId().replace(/:/g, '')}`;
  const heading = useRef<HTMLHeadingElement>(null);
  const displace = useRef<SVGFEDisplacementMapElement>(null);
  const noise = useRef<SVGFETurbulenceElement>(null);

  useEffect(() => {
    const el = heading.current;
    if (!el || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let energy = 0;
    let raf = 0;
    let frame = 0;
    let last = { x: 0, y: 0, t: 0 };
    const tick = (now: number) => {
      // Settles on the clock, not the frame count: crisp again about a second after the pointer rests.
      const dt = Math.min(0.05, (now - (frame || now)) / 1000);
      frame = now;
      energy *= Math.exp(-dt * 4.2);
      if (energy < 0.012) {
        el.style.filter = '';
        raf = 0;
        frame = 0;
        return;
      }
      displace.current?.setAttribute('scale', String(energy * 30));
      noise.current?.setAttribute('baseFrequency', `${0.006 + Math.sin(now / 900) * 0.0015} ${0.013 + Math.cos(now / 700) * 0.003}`);
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const dt = Math.max(1, e.timeStamp - last.t);
      const speed = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt;
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      energy = Math.min(1, energy + speed * 0.09);
      if (!raf && energy > 0.01) {
        el.style.filter = `url(#${filterId})`;
        raf = requestAnimationFrame(tick);
      }
    };
    el.addEventListener('pointermove', onMove);
    return () => {
      el.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      el.style.filter = '';
    };
  }, [filterId, reduced]);

  return (
    <>
      <svg className="liquid__defs" width="0" height="0" aria-hidden="true" focusable="false">
        <filter id={filterId} x="-10%" y="-25%" width="120%" height="150%">
          <feTurbulence ref={noise} type="fractalNoise" baseFrequency="0.006 0.013" numOctaves="1" seed="4" result="n" />
          <feDisplacementMap ref={displace} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <h2 className="liquid" id={id} ref={heading} data-moment="liquid-type">
        {lines.map((l) => (
          <span key={l} className="liquid__line">
            {l}{' '}
          </span>
        ))}
      </h2>
    </>
  );
}

export interface Chapter {
  title: string;
  body: string;
  visual: ReactNode;
}

/**
 * Moment: pinned chapters. The section holds for two screens of native
 * scroll while its steps open one at a time and one frame changes with them.
 * Narrow screens and reduced motion get the steps as plain rows.
 */
export function PinnedChapters({ heading, lead, chapters, id }: { heading: string; lead: string; chapters: Chapter[]; id: string }) {
  const { reduced } = useTransition();
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (min-height: 640px)');
    const update = () => setPinned(mq.matches && !reduced);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [reduced]);

  useEffect(() => {
    const el = section.current;
    if (!el || !pinned) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? Math.min(0.999, Math.max(0, -rect.top / travel)) : 0;
      setActive(Math.floor(p * chapters.length));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pinned, chapters.length]);

  const jump = (i: number) => {
    const el = section.current;
    if (!el || !pinned) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (travel * (i + 0.5)) / chapters.length, behavior: 'smooth' });
  };

  return (
    <section className="sec sec--surface chapters" data-moment="pinned-chapters" data-pinned={pinned} ref={section} aria-labelledby={id} style={vars({ '--steps': chapters.length })}>
      <div className="chapters__stick">
        <div className="wrap chapters__grid">
          <div className="chapters__text">
            <h2 id={id}>{heading}</h2>
            <p className="lead measure">{lead}</p>
            <ol className="chapters__list">
              {chapters.map((c, i) => (
                <li key={c.title} className="chapters__step" data-active={!pinned || active === i}>
                  <button type="button" className="chapters__head" onClick={() => jump(i)} aria-current={pinned && active === i ? 'step' : undefined} disabled={!pinned}>
                    <span className="mono">0{i + 1}</span>
                    <span className="chapters__title">{c.title}</span>
                  </button>
                  <div className="chapters__body">
                    <p>{c.body}</p>
                    {!pinned && <div className="chapters__inline">{c.visual}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
          {pinned && (
            <div className="chapters__frame">
              {chapters.map((c, i) => (
                <div key={c.title} className="chapters__panel" data-active={active === i} aria-hidden={active !== i}>
                  {c.visual}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
