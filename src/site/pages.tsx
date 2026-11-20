import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useTransition } from './transition';
import { Arrow, Lines, LiquidType, PinnedChapters, Rise, StackRow, TemplateButton, Ticker, Window, type Chapter } from './ui';
import { vars } from './vars';
import { REPO_URL } from './routes';

/* ------------------------------------------------------------------ Home */

const RULES = [
  'accessibility.md',
  'component-architecture.md',
  'react-19-compiler.md',
  'spec-driven-development.md',
  'supabase.md',
  'tailwind-v4.md',
  'three-js-react.md',
  'vite-rolldown.md',
  'web-performance.md',
];

const HOLDS = [
  { figure: '9', name: 'rule files', line: 'Accessibility, performance, React 19, Tailwind v4 and Three.js standards.' },
  { figure: '7', name: 'component specs', line: 'One spec file beside every demo component.' },
  { figure: '2', name: 'agent workflows', line: 'Set up the workspace, then write a spec.' },
];

function RepoTree() {
  return (
    <Window title="agentic-orchestrator" label="The template's file tree: nine rule files, two workflows, an init script and seven component specs" className="tree">
      <ul className="tree__list mono">
        <li>.agent</li>
        <li className="tree__in1">
          rules <span className="tree__count">9 files</span>
        </li>
        {RULES.slice(0, 5).map((r, i) => (
          <li key={r} className="tree__in2 tree__file" style={vars({ '--n': i })}>
            {r}
          </li>
        ))}
        <li className="tree__in2 tree__more">4 more</li>
        <li className="tree__in1">
          workflows <span className="tree__count">2 files</span>
        </li>
        <li>scripts</li>
        <li className="tree__in1">init-orchestration.sh</li>
        <li>src/components</li>
        <li className="tree__in1">
          Hero/Hero.spec.md <span className="tree__count">1 of 7</span>
        </li>
      </ul>
    </Window>
  );
}

export function Home() {
  return (
    <>
      <section className="sec hero hero--stage" aria-labelledby="hero-title" data-enter>
        <div className="wrap hero__wrap">
          <div className="hero__head hero-text">
            <Lines id="hero-title" className="h1 hero__title" lines={['Agentic orchestration', 'for frontend teams']} start={1} />
            <div className="hero__aside">
              <Rise i={2} className="hero__stamp">
                <p className="stamp mono">Template v{__APP_VERSION__}</p>
              </Rise>
              <Rise i={3} className="hero__lead">
                <p className="lead">
                  A Vite and React 19 starter where nine rule files and a spec for every component tell your coding agent how to
                  build, before it writes a line.
                </p>
              </Rise>
              <Rise i={4} className="btn-row">
                <TemplateButton />
                <Link className="btn btn--secondary" to="/case-study">
                  Read the case study
                </Link>
              </Rise>
            </div>
          </div>
          <div className="hero__stage" data-visual aria-hidden="true" />
        </div>
      </section>

      <Ticker words={['Rules', 'Specs', 'Skills', 'Agents', 'Components']} />

      <section className="sec sec--surface ships" aria-labelledby="holds">
        <div className="wrap">
          <div className="ships__head">
            <h2 id="holds">What ships in the template</h2>
            <p className="lead measure">Clone it and your agent starts with your team's standards already loaded.</p>
          </div>
          <div className="ships__body">
            <ul className="plates">
              {HOLDS.map((h, i) => (
                <li className={`plate plate--${['blue', 'gold', 'paper'][i]}`} key={h.name}>
                  <div className="plate__head">
                    <span className="plate__figure">{h.figure}</span>
                    <h3 className="plate__name">{h.name}</h3>
                  </div>
                  <p>{h.line}</p>
                </li>
              ))}
            </ul>
            <div className="ships__tree">
              <RepoTree />
            </div>
          </div>
          <StackRow />
        </div>
      </section>

      <section className="sec statement" aria-labelledby="statement">
        <div className="wrap statement__grid">
          <LiquidType id="statement" lines={['Infrastructure', 'is the ultimate', 'accelerant.']} />
          <div className="statement__foot">
            <p className="lead measure">
              The lesson from building a 3D design system with an agent: the sturdiest context beats the fastest prompt.
            </p>
            <Link className="btn btn--secondary" to="/method">
              See the method
              <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- Method */

const CHAPTERS: Chapter[] = [
  {
    title: 'Global rule engine',
    body: 'Nine rule files hold the standards once: accessibility, performance, Tailwind v4, React 19 and Three.js memory care. The agent reads them when a workspace opens.',
    visual: (
      <Window title=".agent/rules" label="The nine rule files in the .agent/rules folder" className="code">
        <ol className="code__lines mono">
          {RULES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
        <p className="code__foot mono">9 files, read when the workspace opens</p>
      </Window>
    ),
  },
  {
    title: 'Spec-driven development',
    body: 'Every feature starts as a spec file: the goal, the props, the 3D disposal plan and an accessibility checklist the agent must satisfy.',
    visual: (
      <Window title="Hero.spec.md" label="An excerpt of the Hero component's spec with its accessibility and performance checklists" className="code">
        <ol className="code__lines mono">
          <li className="code__h"># SPEC: Hero</li>
          <li className="code__h">## 3. Technical implementation</li>
          <li>Three.js particle system, custom ShaderMaterial</li>
          <li>Bloom and FXAA through EffectComposer</li>
          <li className="code__h">## 5. Accessibility (WCAG 2.1)</li>
          <li>[ ] Keyboard focus states for links and buttons</li>
          <li>[ ] Reduced motion support</li>
          <li className="code__h">## 6. Performance</li>
          <li className="code__ok">[x] Proper resource disposal on unmount</li>
          <li className="code__ok">[x] Pixel ratio limiting for Retina displays</li>
        </ol>
        <p className="code__foot mono">The spec is written before the component</p>
      </Window>
    ),
  },
  {
    title: 'Integrated agent skills',
    body: 'Skills such as scaffold_component know the spec rules, so the agent creates the spec, the story and the component together.',
    visual: (
      <Window title="agent session" label="An agent session running the setup and spec workflows, then scaffolding three files for a component" className="code">
        <ol className="code__lines mono">
          <li className="code__h">/setup-orchestration</li>
          <li>Rules loaded from .agent/rules</li>
          <li className="code__h">/sdd-workflow</li>
          <li>SPEC: ContactForm</li>
          <li className="code__h">scaffold_component ContactForm</li>
          <li className="code__ok">ContactForm.spec.md</li>
          <li className="code__ok">ContactForm.stories.tsx</li>
          <li className="code__ok">ContactForm.tsx</li>
        </ol>
        <p className="code__foot mono">One skill, three files</p>
      </Window>
    ),
  },
];

const GAINS = [
  { title: 'Guarantees accessibility', body: 'Rules such as respecting reduced motion are enforced on every component, not left to review.' },
  { title: 'Keeps performance budgets', body: 'Asset budgets and critical CSS paths are part of what the agent checks.' },
  { title: 'Shortens onboarding', body: "New developers learn the workflow, and the rules carry the stack's details." },
];

export function Method() {
  return (
    <>
      <section className="sec hero hero--side" aria-labelledby="hero-title" data-enter>
        <div className="wrap hero__side">
          <Lines id="hero-title" className="h1" lines={['Three layers that', 'direct a coding agent']} start={1} />
          <Rise i={3}>
            <p className="lead measure">
              Orchestration coordinates agents, rule sets and workflows so the output is repeatable. The template splits that
              job into rules, specs and skills.
            </p>
          </Rise>
          <Rise i={4} className="btn-row">
            <a className="btn btn--secondary" href="#setup">
              See the setup steps
              <Arrow />
            </a>
          </Rise>
        </div>
      </section>

      <PinnedChapters
        id="layers"
        heading="Rules, specs and skills"
        lead="Each layer answers one question the agent would otherwise guess at."
        chapters={CHAPTERS}
      />

      <section className="sec sec--accent" id="setup" aria-labelledby="setup-title">
        <div className="wrap split split--even">
          <div className="split__text">
            <h2 id="setup-title">Start a project in four commands</h2>
            <p className="lead measure">The init script copies your global rules into the new project, so every repository shares them.</p>
            <Window title="terminal" label="Four commands: clone the repository, enter it, run the init script, install dependencies" className="code code--cmd">
              <ol className="code__lines mono">
                <li>git clone {REPO_URL.replace('https://', '')}.git my-project</li>
                <li>cd my-project</li>
                <li>sh scripts/init-orchestration.sh</li>
                <li>npm install</li>
              </ol>
            </Window>
          </div>
          <ul className="gains">
            {GAINS.map((g, i) => (
              <li className="card plate" key={g.title}>
                <span className="mono card__n">0{i + 1}</span>
                <h3 className="card__title">{g.title}</h3>
                <p>{g.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------ Case study */

const STAGES = [
  { title: 'The vibe era', body: 'Early on we relied on vague prompts and hopeful results. The code worked, but it was chaotic and unoptimised.' },
  { title: 'The agentic brain', body: "We wrote .agent/rules, a conscience for the AI. The agent now knows the team's accessibility, performance and design-token standards." },
  { title: 'Spec-driven development', body: 'Every feature begins with a .spec.md, so human intent and machine execution agree before a line is written.' },
  { title: 'Orchestrated components', body: "Fast, accessible components, made by a designer's judgment and an agent's precision." },
];

const PHI = (1 + Math.sqrt(5)) / 2;
type V3 = [number, number, number];
const CUBE: V3[] = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [x * 0.72, y * 0.72, z * 0.72] as V3)));
const ICOSA: V3[] = [-1, 1].flatMap((a) =>
  [-PHI, PHI].flatMap((b) => [[0, a, b] as V3, [a, b, 0] as V3, [b, 0, a] as V3]),
).map(([x, y, z]) => [x * 0.62, y * 0.62, z * 0.62] as V3);
const NOISE: V3[] = Array.from({ length: 96 }, (_, i) => {
  const r = (k: number) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1) * 1.15;
  return [r(1) * 0.8, r(2) * 0.8, r(3) * 0.8] as V3;
});

function pairs(points: V3[], length: number) {
  const out: [number, number][] = [];
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++) {
      const d = Math.hypot(points[i][0] - points[j][0], points[i][1] - points[j][1], points[i][2] - points[j][2]);
      if (Math.abs(d - length) < 0.01) out.push([i, j]);
    }
  return out;
}
const CUBE_EDGES = pairs(CUBE, 1.44);
const ICOSA_EDGES = pairs(ICOSA, 1.24);
const ICOSA_FACES = (() => {
  const set = new Set(ICOSA_EDGES.map(([a, b]) => `${a}-${b}`));
  const has = (a: number, b: number) => set.has(`${Math.min(a, b)}-${Math.max(a, b)}`);
  const out: [number, number, number][] = [];
  for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) for (let c = b + 1; c < 12; c++) if (has(a, b) && has(b, c) && has(a, c)) out.push([a, b, c]);
  return out;
})();

/** The stage's shape, drawn from the same turn each time: noise, a frame, a faceted form, a solid. */
function StageShape({ step, angle }: { step: number; angle: number }) {
  const project = ([x, y, z]: V3) => {
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    const x1 = x * ca + z * sa;
    const z1 = -x * sa + z * ca;
    const y1 = y * Math.cos(0.5) - z1 * Math.sin(0.5);
    const z2 = y * Math.sin(0.5) + z1 * Math.cos(0.5);
    const s = 150 / (3.4 - z2);
    return [160 + x1 * s * 2, 160 + y1 * s * 2, z2] as V3;
  };
  const points = (step === 0 ? NOISE : step === 1 ? CUBE : ICOSA).map(project);
  const edges = step === 1 ? CUBE_EDGES : step >= 2 ? ICOSA_EDGES : [];
  return (
    <svg className="shape" viewBox="0 0 320 320" role="img" aria-label={`Stage ${step + 1} of 4: ${STAGES[step].title}`}>
      {step === 3 &&
        ICOSA_FACES.map(([a, b, c]) => {
          const depth = (points[a][2] + points[b][2] + points[c][2]) / 3;
          return (
            <polygon
              key={`${a}-${b}-${c}`}
              points={`${points[a][0]},${points[a][1]} ${points[b][0]},${points[b][1]} ${points[c][0]},${points[c][1]}`}
              className="shape__face"
              style={{ opacity: 0.1 + Math.max(0, depth + 0.6) * 0.32 }}
            />
          );
        })}
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]} className="shape__edge" />
      ))}
      {points.map((p, i) => (
        <rect key={i} x={p[0] - 2} y={p[1] - 2} width="4" height="4" className={step === 0 ? 'shape__dust' : 'shape__node'} />
      ))}
    </svg>
  );
}

function Journey() {
  const { reduced } = useTransition();
  const [step, setStep] = useState(0);
  const [angle, setAngle] = useState(0.6);
  const raf = useRef(0);

  const choose = (next: number) => {
    if (next === step) return;
    setStep(next);
    cancelAnimationFrame(raf.current);
    if (reduced) return;
    // Each step turns the shape a quarter and stops: the motion marks the change, then rests.
    const from = angle;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / 900);
      setAngle(from + (1 - Math.pow(1 - t, 4)) * (Math.PI / 2));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div className="journey">
      <div className="journey__steps" role="tablist" aria-label="Stages of the project">
        {STAGES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            role="tab"
            id={`stage-tab-${i}`}
            aria-selected={step === i}
            aria-controls="stage-panel"
            tabIndex={step === i ? 0 : -1}
            className="journey__tab"
            onClick={() => choose(i)}
            onKeyDown={(e) => {
              const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
              if (!delta) return;
              e.preventDefault();
              const next = (step + delta + STAGES.length) % STAGES.length;
              choose(next);
              document.getElementById(`stage-tab-${next}`)?.focus();
            }}
          >
            <span className="mono journey__n">0{i + 1}</span>
            <span className="journey__t">{s.title}</span>
          </button>
        ))}
      </div>
      <div className="journey__panel plate" role="tabpanel" id="stage-panel" aria-labelledby={`stage-tab-${step}`}>
        <div className="journey__plot">
          <StageShape step={step} angle={angle} />
        </div>
        <p className="journey__body" key={step}>
          {STAGES[step].body}
        </p>
      </div>
    </div>
  );
}

const BUILT = [
  { name: 'DigitalAssetsSection', line: 'A holographic 3D playground' },
  { name: 'ContactBanner', line: 'Glass panels with a pulsing aura' },
  { name: 'ContactForm', line: 'Animated loops with deep validation' },
  { name: 'AppFooter', line: 'A lava-lamp ground that follows the cursor' },
];

export function CaseStudy() {
  return (
    <>
      <section className="sec hero hero--stage" aria-labelledby="hero-title" data-enter>
        <div className="wrap hero__wrap">
          <div className="hero__head hero-text">
            <Lines id="hero-title" className="h1 hero__title" lines={['A 3D design system', 'built with an agent']} start={1} />
            <div className="hero__aside">
              <Rise i={2} className="hero__stamp">
                <p className="stamp mono">A 5-minute read</p>
              </Rise>
              <Rise i={3} className="hero__lead">
                <p className="lead">
                  At CoBank, a designer and a coding agent replaced loose prompts with rule files and specs to ship accessible
                  Three.js components. This is how it went.
                </p>
              </Rise>
            </div>
          </div>
          <div className="hero__stage" data-visual aria-hidden="true" />
        </div>
      </section>

      <section className="sec sec--surface" aria-labelledby="stages">
        <div className="wrap">
          <h2 id="stages">Four stages from prompts to process</h2>
          <Journey />
        </div>
      </section>

      <section className="sec sec--paper" aria-labelledby="result">
        <div className="wrap split split--even">
          <div className="split__text">
            <h2 id="result">Accessibility written into the rules</h2>
            <p className="lead measure">
              Reduced motion and keyboard focus are hard rules in the agent's skills, so even a complex 3D scene stays usable
              for everyone.
            </p>
            <blockquote className="quote">
              <p>“We aren't just giving the AI instructions; we are giving it a conscience.”</p>
            </blockquote>
          </div>
          <div className="split__rows">
            <h3 className="label">Four components shipped this way</h3>
            <ul className="rows tiles">
              {BUILT.map((b) => (
                <li key={b.name} className="rows__row plate">
                  <span className="rows__name mono">{b.name}</span>
                  <span className="rows__value">{b.line}</span>
                </li>
              ))}
            </ul>
            <Link className="link" to="/components">
              See all seven components
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------ Components */

const COMPONENTS = [
  { name: 'Hero', tag: 'Three.js', line: 'A 12,000-particle galaxy with bloom that turns with the pointer.', goal: 'Gives the first impression of the demo app: a particle simulation with a custom ShaderMaterial, bloom and FXAA.' },
  { name: 'CloudSection', tag: 'Shaders', line: 'A sky of shader clouds that moves with the scroll.', goal: 'Introduces the shader editor through an orthographic camera and fragment shaders that render volumetric-style clouds.' },
  { name: 'DigitalAssetsSection', tag: 'Three.js', line: 'Floating 3D pieces around a composition UI.', goal: 'Shows an environment where UI components are shared and versioned, with a central composition panel.' },
  { name: 'ContactBanner', tag: 'Layout', line: 'A high-contrast consulting banner that closes the page.', goal: 'Breaks from the dark 3D sections and reads as the natural conclusion of the page.' },
  { name: 'ContactForm', tag: 'Form', line: 'A four-field enquiry form with validation.', goal: 'Captures consulting enquiries inside the banner: name, email, service type and message.' },
  { name: 'AppFooter', tag: 'Three.js', line: 'A footer over a lava-lamp ground that follows the cursor.', goal: 'A full directory footer on an interactive Three.js background, with the release version shown.' },
  { name: 'InteractiveJourney', tag: 'Story', line: 'A four-step story told with a morphing 3D shape.', goal: 'Walks through the move from vibe coding to spec-driven development, one step and one shape at a time.' },
];

function ReleaseDiagram() {
  const lanes = [
    { y: 36, label: 'Changelog' },
    { y: 110, label: 'Version' },
    { y: 184, label: 'GitHub release' },
  ];
  return (
    <svg className="diagram" viewBox="0 0 500 220" role="img" aria-label="A commit goes into semantic-release, which writes the changelog, the version and a GitHub release">
      {lanes.map((l, i) => (
        <g key={l.label}>
          <path className="diagram__line" d={`M286 110 C 318 110, 318 ${l.y}, 350 ${l.y}`} />
          <rect className="diagram__node" x="350" y={l.y - 22} width="148" height="44" rx="4" />
          <text className="diagram__text" x="424" y={l.y + 5} textAnchor="middle">
            {l.label}
          </text>
          <rect className="diagram__pulse" width="6" height="6" x="-3" y="-3" style={vars({ offsetPath: `path("M286 110 C 318 110, 318 ${l.y}, 350 ${l.y}")`, '--d': `${0.9 + i * 0.25}s` })} />
        </g>
      ))}
      <path className="diagram__line" d="M82 110 H 116" />
      <rect className="diagram__node" x="2" y="88" width="80" height="44" rx="4" />
      <text className="diagram__text" x="42" y="115" textAnchor="middle">
        Commit
      </text>
      <rect className="diagram__node diagram__node--main" x="116" y="82" width="170" height="56" rx="4" />
      <text className="diagram__text" x="201" y="115" textAnchor="middle">
        semantic-release
      </text>
      <rect className="diagram__pulse" width="6" height="6" x="-3" y="-3" style={vars({ offsetPath: 'path("M82 110 H 116")', '--d': '0s' })} />
    </svg>
  );
}

export function Components() {
  const [active, setActive] = useState(0);
  const item = COMPONENTS[active];
  return (
    <>
      <section className="sec hero hero--list" aria-labelledby="hero-title" data-enter>
        <div className="wrap">
          <Lines id="hero-title" className="h1" lines={['Seven components,', 'each with a spec']} start={1} />
          <div className="catalog">
            <ol className="catalog__list">
              {COMPONENTS.map((c, i) => (
                <li key={c.name} className="rise-soft" style={vars({ '--i': 3 + i * 0.5 })}>
                  <button
                    type="button"
                    className="catalog__row"
                    aria-pressed={active === i}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                  >
                    <span className="mono catalog__n">0{i + 1}</span>
                    <span className="catalog__name">{c.name}</span>
                    <span className="catalog__line">{c.line}</span>
                    <span className="mono catalog__tag">{c.tag}</span>
                  </button>
                </li>
              ))}
            </ol>
            <Rise i={5} className="catalog__preview">
              <Window title={`${item.name}.spec.md`} label={`The goal from the ${item.name} spec`} className="code">
                <ol className="code__lines mono" key={item.name}>
                  <li className="code__h"># SPEC: {item.name}</li>
                  <li className="code__h">## 1. Goal and intent</li>
                  <li className="code__wrap">{item.goal}</li>
                </ol>
                <p className="code__foot mono">
                  src/components/{item.name}/{item.name}.spec.md
                </p>
              </Window>
            </Rise>
          </div>
        </div>
      </section>

      <section className="sec sec--surface" aria-labelledby="releases">
        <div className="wrap split split--even">
          <div className="split__text">
            <h2 id="releases">Releases cut from commit messages</h2>
            <p className="lead measure">
              Semantic release reads each conventional commit, then writes the version and the changelog. Every component also
              has a Storybook 10 story, checked with the accessibility add-on.
            </p>
            <ul className="rows">
              <li className="rows__row">
                <span className="rows__name mono">v1.1.0</span>
                <span className="rows__value">Interactive journey and case study, 25 January 2026</span>
              </li>
              <li className="rows__row">
                <span className="rows__name mono">v1.0.0</span>
                <span className="rows__value">Particle hero, cloud section, Storybook and agent rules, 25 January 2026</span>
              </li>
            </ul>
          </div>
          <div className="card card--visual plate">
            <ReleaseDiagram />
          </div>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------- Contact */

const SERVICES = ['Technical consulting', 'Three.js development', 'UI and UX design', 'Other enquiry'];
type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState('');
  const form = useRef<HTMLFormElement>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    const next: Errors = {};
    if (!name) next.name = 'Write your full name.';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Write an email address with an @.';
    if (message.length < 10) next.message = 'Write a message of at least ten characters.';
    setErrors(next);
    const failed = Object.keys(next) as (keyof Errors)[];
    if (failed.length) {
      setStatus(failed.length === 1 ? 'One field needs a change.' : `${failed.length} fields need a change.`);
      form.current?.querySelector<HTMLElement>(`[name="${failed[0]}"]`)?.focus();
      return;
    }
    const subject = encodeURIComponent(`${data.get('service')}: enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n${name}\n${email}`);
    setStatus('Your mail app is opening with the message filled in.');
    window.location.href = `mailto:consulting@agentic.ai?subject=${subject}&body=${body}`;
  };

  const field = (name: keyof Errors) => ({
    name,
    id: `f-${name}`,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `e-${name}` : undefined,
  });

  return (
    <form className="form plate" ref={form} onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="f-name">Full name</label>
        <input type="text" autoComplete="name" {...field('name')} />
        {errors.name && (
          <p className="field__error" id="e-name">
            {errors.name}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor="f-email">Email address</label>
        <input type="email" autoComplete="email" {...field('email')} />
        {errors.email && (
          <p className="field__error" id="e-email">
            {errors.email}
          </p>
        )}
      </div>
      <div className="field">
        <label htmlFor="f-service">Service type</label>
        <select id="f-service" name="service" defaultValue={SERVICES[0]}>
          {SERVICES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="f-message">Message</label>
        <textarea rows={3} {...field('message')} />
        {errors.message && (
          <p className="field__error" id="e-message">
            {errors.message}
          </p>
        )}
      </div>
      <button type="submit" className="btn btn--primary">
        Send the message
        <Arrow />
      </button>
      <p className="form__status" role="status">
        {status}
      </p>
      <p className="form__note">The button opens your mail app with the message filled in.</p>
    </form>
  );
}

export function Contact() {
  return (
    <>
      <section className="sec hero hero--form" aria-labelledby="hero-title" data-enter>
        <div className="wrap split split--even">
          <div className="split__text">
            <Lines id="hero-title" className="h1" lines={['Consulting for your', 'agent workflow']} start={1} />
            <Rise i={3}>
              <p className="lead measure">
                Tell us what you are building. We take on technical consulting, Three.js development and interface design.
              </p>
            </Rise>
          </div>
          <Rise i={4} className="split__form">
            <ContactForm />
          </Rise>
        </div>
      </section>
    </>
  );
}
