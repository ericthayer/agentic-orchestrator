import type { ComponentType } from 'react';
import { TransitionOverlay, TransitionProvider, useTransition } from './site/transition';
import { Footer, Nav } from './site/ui';
import { vars } from './site/vars';
import { CaseStudy, Components, Contact, Home, Method } from './site/pages';
import { Play } from './site/play/Play';
import type { RouteId, TransitionKind } from './site/routes';

const PAGES: Record<RouteId, ComponentType> = {
  home: Home,
  method: Method,
  'case-study': CaseStudy,
  components: Components,
  contact: Contact,
  play: Play,
};

/** How long a new page waits before its lines rise, so they arrive as the transition clears. */
const ENTER_DELAY: Record<TransitionKind, number> = {
  curtain: 420,
  morph: 380,
  dive: 420,
  surface: 280,
};

function Site() {
  const { route, phase, kind } = useTransition();
  const Page = PAGES[route.id];
  const enter = phase === 'idle' ? 320 : ENTER_DELAY[kind];
  return (
    <div className="site" data-phase={phase} data-kind={kind} data-route={route.id}>
      <Nav />
      <main id="top" tabIndex={-1} className="page" key={route.id} style={vars({ '--enter': `${enter}ms` })}>
        <Page />
      </main>
      {route.id !== 'play' && <Footer from={route.id} />}
      <TransitionOverlay />
    </div>
  );
}

function App() {
  return (
    <TransitionProvider>
      <Site />
    </TransitionProvider>
  );
}

export default App;
