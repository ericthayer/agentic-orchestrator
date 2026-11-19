# SPEC: DigitalAssetsSection (three layers)

## 1. Goal & Intent
Explain the three layers of agentic orchestration — shared rules, spec-driven development and agent skills — and the outcomes teams get from them. The layers are drawn as parallel horizontal staves (the orchestral score motif): every agent reads from all three, in order. The component keeps its historical name because `App.tsx` imports it; the rendered section is `#pillars`.

## 2. Usage & Interface
```tsx
<DigitalAssetsSection />

<DigitalAssetsSection
  heading="Three layers every agent reads from"
  intro="Agents stop guessing when they build from the same rules, specs and skills every time."
/>
```

| Prop | Type | Default |
| --- | --- | --- |
| `heading` | `string?` | "Three layers every agent reads from" |
| `intro` | `string?` | One-sentence intro about rules, specs and skills living in the repo |

Layer and outcome content is fixed in the component (it describes this repo's real structure).

## 3. Structure
- `<section id="pillars" aria-labelledby="pillars-heading">`
- `<h2 id="pillars-heading">` + intro paragraph (`max-w-[60ch]`)
- `<ol>` of layers, each row separated by `border-staff` hairlines:
  - Shared rules → `.agent/rules/`
  - Spec-driven development → `src/components/*/*.spec.md`
  - Agent skills → `.agent/workflows/`
  - Desktop: two columns (name in `font-display` left; description + `<code>` path right). Mobile: stacked.
- Outcomes (`<h3>` + `<ul>`): accessibility by default, performance built in, faster onboarding — compact, `text-mute`, hairline left rule.
- Single link "Read the orchestration guide" (`text-signal`) → `AGENTIC_ORCHESTRATION.md` on GitHub, new tab with sr-only notice.

## 4. Three.js background
- Three wireframe icosahedrons (one amber `#ffb547`, two blue `#7aa2ff`, low opacity) placed at the edges, plus a sparse blue particle field; fog `#080c18`; transparent clear.
- One shared geometry; slow delta-time drift.
- Canvas is `aria-hidden`, `pointer-events-none`.

## 5. Accessibility (WCAG 2.1)
- [x] Section labelled by its `<h2>`; layers are `<h3>` under it (only Hero owns the `<h1>`).
- [x] Decorative canvas `aria-hidden="true"`.
- [x] `prefers-reduced-motion: reduce` renders a single still frame; listens for changes.
- [x] Text uses `text-paper` / `text-mute` on `bg-ink` (≥ 4.5:1); link uses `text-signal` with underline.
- [x] External link announces that it opens a new tab.

## 6. Performance
- [x] Pixel ratio capped at 2; `powerPreference: "high-performance"`.
- [x] Render loop paused when off-screen (IntersectionObserver).
- [x] Resize via ResizeObserver on the section.
- [x] Dispose geometry, materials, particle buffers and renderer on unmount; cancel rAF; disconnect observers.

## 7. Implementation Checklist
- [x] Replace phone mockup, stock image, floating fake UI and dead buttons
- [x] Layer staves with real repo paths
- [x] Outcomes list + guide link
- [x] Retune Three.js to amber/blue on midnight; reduced-motion still frame
- [x] Story updated (`@storybook/react-vite`, `heading` / `intro` controls)
