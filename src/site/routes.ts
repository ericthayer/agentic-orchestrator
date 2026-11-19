import type { Formation } from './gl/CoreField';

export type RouteId = 'home' | 'method' | 'case-study' | 'components' | 'contact' | 'play';

/** How a page change is shown: a curtain (nav), a morph in the open (the page chain), or the game's iris. */
export type TransitionKind = 'curtain' | 'morph' | 'dive' | 'surface';

export interface RouteDef {
  id: RouteId;
  path: string;
  /** The nav word and the giant word that closes the page before it. */
  label: string;
  index: string;
  title: string;
  formation: Formation;
}

export const ROUTES: RouteDef[] = [
  {
    id: 'home',
    path: '/',
    label: 'Home',
    index: '00',
    title: 'Agentic Orchestrator: a spec-driven template for AI coding agents',
    formation: 'core',
  },
  {
    id: 'method',
    path: '/method',
    label: 'Method',
    index: '01',
    title: 'Method: rules, specs and skills | Agentic Orchestrator',
    formation: 'stack',
  },
  {
    id: 'case-study',
    path: '/case-study',
    label: 'Case study',
    index: '02',
    title: 'Case study: a 3D design system built with an agent | Agentic Orchestrator',
    formation: 'path',
  },
  {
    id: 'components',
    path: '/components',
    label: 'Components',
    index: '03',
    title: 'Components: seven specced demos | Agentic Orchestrator',
    formation: 'blocks',
  },
  {
    id: 'contact',
    path: '/contact',
    label: 'Contact',
    index: '04',
    title: 'Contact: consulting enquiries | Agentic Orchestrator',
    formation: 'ring',
  },
  {
    id: 'play',
    path: '/play',
    label: 'Play',
    index: '05',
    title: 'Play Spec Gate, an arcade game | Agentic Orchestrator',
    formation: 'gate',
  },
];

export const REPO_URL = 'https://github.com/ericthayer/agentic-orchestrator';

export function routeFromPath(pathname: string): RouteDef {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return ROUTES.find((r) => r.path === clean) ?? ROUTES[0];
}

export function routeById(id: RouteId): RouteDef {
  return ROUTES.find((r) => r.id === id) ?? ROUTES[0];
}

/** The page the closing word leads to. */
export function nextRoute(id: RouteId): RouteDef {
  const i = ROUTES.findIndex((r) => r.id === id);
  return ROUTES[(i + 1) % ROUTES.length];
}
