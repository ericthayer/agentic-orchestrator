# SPEC: Site (motion-driven, multi-page)

## 1. Goal & Intent
Present the Agentic Orchestrator template as a six-page site whose motion carries the story:
one persistent WebGL particle object re-forms for every page, and each kind of navigation
has its own transition. Inspiration: asklionel.tech (page chain, entry into Play),
dala.craftedbygc.com (a persistent particle form), Contra's 2021 report (window frames),
crosswire.unseen.co (a 3D world). Nothing is copied from them.

## 2. Usage & Interface
```tsx
<TransitionProvider>   // router, transition state, the one WebGL canvas
  <Site />             // Nav, <main key={route}>, Footer, TransitionOverlay
</TransitionProvider>
```
Routes (`src/site/routes.ts`): `/`, `/method`, `/case-study`, `/components`, `/contact`, `/play`.
`<Link to kind>` is a real anchor; `useTransition().go(path, kind)` navigates.

## 3. Technical Implementation
- **Router**: History API in `transition.tsx`; no router dependency. Hosting needs an SPA fallback to `index.html`.
- **CoreField** (`gl/CoreField.ts`): one `THREE.Points` with a custom shader; six formations
  (core, stack, path, blocks, ring, gate) morph by attribute interpolation. Loaded with a
  dynamic import after first paint. One WebGL context for the whole site.
- **Transitions**: `curtain` (nav links, direction-aware), `morph` (the closing word; content
  clears and the object re-forms in the open), `dive` / `surface` (into and out of Play).
- **Moments**: `PinnedChapters` (Method, sticky, native scroll) and `LiquidType` (Home, SVG filter).
- **Play**: `play/Play.tsx`, a 2D canvas game (Spec Gate) whose ring is the particle field's gate formation.

## 4. Visuals & Interaction
- Tokens dealt by taste-skill: palette blue-black-cornflower, Geist + Geist Mono, sharp radius, tonal buttons.
- Sections are one screen (the pinned chapters three); no scroll-reveal on cards or rows.
- Hover layer: buttons step 1px and press, links draw a line, the closing word draws its rule.

## 5. Accessibility (WCAG 2.1)
- [x] Skip link, one h1 per page, headings in order, visible labels and errors on the form.
- [x] `prefers-reduced-motion`: transitions swap instantly, the object draws once and rests, moments stand still.
- [x] The game plays by pointer, touch or arrow keys, pauses with P, and announces events in a live region.
- [x] Focus moves to `main` after a page change; the document title follows the route.

## 6. Performance
- [x] three.js in its own chunk, loaded after first paint; DPR capped at 1.75; fewer particles under 768px.
- [x] Render loop stops when the tab is hidden; geometry, material and renderer disposed on unmount.

## 7. Changelog
- **2026-11-18**: First version. Replaces the single landing page in `App.tsx`; the earlier demo
  components stay in `src/components` with their specs and stories.
