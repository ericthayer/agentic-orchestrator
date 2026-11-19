# SPEC: Hero

## 1. Goal & Intent
The Hero is the first screen of the Agentic Orchestrator landing page and its signature moment. In a few seconds it has to say what the template is and why it exists: AI agents that build from the same shared rules, written specs and reusable skills every time, instead of vibe coding. It owns the page's only `<h1>` and the main navigation, and offers two next steps: read how it works, or take the interactive tour.

## 2. Usage & Interface
The entry point component for the landing page.

```tsx
<Hero onStartJourney={() => setView('journey')} />
```

| Prop | Type | Description |
| --- | --- | --- |
| `onStartJourney` | `() => void` (optional) | Called by "Take the interactive tour"; App switches to `InteractiveJourney`. |

## 3. Copy
- **Brand mark (nav):** Agentic Orchestrator
- **Nav:** Why orchestrate (`#cloud-section`) · Pillars (`#pillars`) · Use the template (`#template`) · GitHub (external, new tab)
- **Headline (`h1`):** Agents that play from the same score.
- **Subhead:** Agentic Orchestrator is a React + Three.js template where AI agents build from shared rules, written specs and reusable skills — so every learning app and demo ships accessible, fast and consistent.
- **Primary CTA:** See how it works → zooms the core out and scrolls to `#cloud-section`.
- **Secondary CTA:** Take the interactive tour → `onStartJourney`.

The section ids `#pillars` and `#template` are owned by the sections below the Hero.

## 4. Technical Implementation
- **Three.js particle core**: 12,000 points in a volumetric spherical spiral using a custom `ShaderMaterial` (vertex-shader spiral, fragment pulse).
- **Post-processing**: `EffectComposer` with a low-strength `UnrealBloomPass` (0.4) and `FXAAShader`.
- **Composition**: on landscape viewports the core is offset right of centre (`coreOffsetX`) so the headline sits on clear midnight; a left scrim and a bottom blend into `ink` keep text legible and hand off to the next section.
- **Zoom transition**: driven by a ref (`isTransitioningRef`) read inside the render loop. The camera eases to `z = 300` and the core scales down while scrolling, then both ease back to rest.
- **Entry**: one orchestrated moment — headline, subhead and actions rise in sequence with framer-motion; skipped when reduced motion is requested.

## 5. Visuals & Interaction
- **Palette**: `bg-ink` page and Three.js clear/fog colour `#080c18`; particles blend from signal blue (`#7aa2ff`) to cue amber (`#ffb547`), with some falling back towards midnight for depth. No purple/pink, no gradient text.
- **Type**: headline in Bricolage Grotesque (`font-display`) at `font-stretch: 75%`, `clamp(3.25rem, 11vw, 9rem)`, leading 0.88, left-aligned and bottom-anchored. Body in Instrument Sans, max ~58ch.
- **Motif**: five thin `bg-staff` hairlines above the headline — the stave every agent reads from.
- **Actions**: primary `bg-cue text-ink` (hover `bg-cue-deep`); secondary hairline `border-staff` button (hover `signal`). Both `rounded-md`.
- **Pointer**: mouse movement gently rotates the core (not in reduced motion).
- No scroll-cue arrow.

## 6. Accessibility (WCAG 2.1)
- [x] Single page `<h1>`; nav is `<nav aria-label="Main">` with a list of real links to in-page anchors.
- [x] External GitHub link opens in a new tab with `rel="noopener noreferrer"` and an sr-only "(opens in a new tab)".
- [x] Mobile menu toggle is a `<button>` with `aria-expanded`, `aria-controls="mobile-nav"` and `aria-label`; close is a `<button>`.
- [x] Menu: Escape closes it, links close it, focus moves to the close button on open and back to the toggle on close; the closed panel is `inert`.
- [x] Visible focus via the global `:focus-visible` ring (signal blue).
- [x] Decorative canvas, scrims and staff lines are `aria-hidden`.
- [x] `prefers-reduced-motion`: the scene renders a single still frame (re-rendered on resize) with no spin, pointer rotation or zoom; text entry animation and menu slide are disabled; CTA scroll is instant.
- [x] Text contrast ≥ 4.5:1 (paper on ink; ink on cue).

## 7. Performance
- [x] High-performance vertex shader for particle math.
- [x] Proper resource disposal on unmount (geometry, material, bloom pass, FXAA material, composer, renderer).
- [x] Pixel ratio capped at 2; `powerPreference: "high-performance"`.
- [x] No per-frame allocations in the animation loop.
- [x] Reduced motion skips the render loop entirely.

## 8. Implementation Checklist
- [x] Particle system foundation
- [x] Custom shaders & Bloom
- [x] Responsive navigation with accessible mobile menu
- [x] Brand copy, type and palette
- [x] Reduced-motion still frame
- [x] Smooth view-transition to CloudSection

## 9. Changelog
- **2026-01-24**: Initial spec, legacy "Stellar" particle hero; purple/pink theme, bloom/camera tuning, 12k particles, zoom scroll transition, `onStartJourney` prop.
- **2026-11-18**: Rebrand to Agentic Orchestrator. New mission headline and copy, condensed Bricolage Grotesque headline, amber/blue core on midnight, in-page nav anchors + GitHub link, accessible mobile menu (button toggle, Escape, focus return), reduced-motion still frame, removed bouncing arrow, fixed stale-closure bug that stopped the zoom transition from running, staff-line motif. Stories import moved to `@storybook/react-vite`.
