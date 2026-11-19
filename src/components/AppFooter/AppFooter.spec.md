# SPEC: AppFooter

## 1. Goal & Intent
Close the page with the brand, the mission and links to real things only: the docs in the repo, the repo itself and an example built from the template. A quiet Three.js "lava-lamp" backdrop in the brand colours ties it to the rest of the page.

## 2. Usage & Interface
The final element of the application. No props.

```tsx
<AppFooter />
```

## 3. Content
- **Brand**: "Agentic Orchestrator" (`font-display`, slightly condensed).
- **Mission**: "Turn AI agents from autocomplete into disciplined collaborators: they build from the same rules, specs and skills every time."
- **GitHub icon link** → repo, with `aria-label`.
- **Docs** column (`<nav aria-labelledby>`), GitHub `blob/main` URLs:
  - Orchestration guide → `AGENTIC_ORCHESTRATION.md`
  - Template guide → `TEMPLATE_GUIDE.md`
  - Case study → `CASE_STUDY.md`
  - Changelog → `CHANGELOG.md`
- **Project** column: GitHub repo; Example: Design Great Prompts (https://design-great-prompts.netlify.app/).
- **Bottom line**: "Agentic Orchestrator v{`__APP_VERSION__`} — an open template for learning with AI agents."
- No newsletter, social links, legal links, fake company or copyright entity.

## 4. Technical Implementation
- **Three.js background**: a canvas (`aria-hidden`, `pointer-events-none`, `opacity-40`, `blur-[100px]`) behind the content.
- 4 blobs sharing one `SphereGeometry`; colours `#ffb547` (amber cue) and `#7aa2ff` (blue signal) via `new THREE.Color`, low opacity (0.22) and emissive intensity (0.35) on transparent clear (page shows `bg-ink` #080c18).
- Slow drift plus a gentle (lerp 0.01) attraction toward the cursor; small proximity swell.
- **Reduced motion**: `matchMedia('(prefers-reduced-motion: reduce)')` → render a single still frame, no rAF loop, no mousemove listener; re-render a still frame on resize.
- Dependencies: three, lucide-react.

## 5. Accessibility (WCAG 2.1 AA)
- [x] Decorative canvas is `aria-hidden`.
- [x] Link groups are `<nav>` landmarks labelled by their `<h2>` headings.
- [x] External links open in a new tab with `rel="noopener noreferrer"` and visually hidden "(opens in a new tab)"; icon link has `aria-label`, icon is `aria-hidden`.
- [x] `text-mute` / `text-paper` on `bg-ink` ≥ 4.5:1; hover uses `text-signal`.
- [x] Reduced motion respected.

## 6. Performance
- [x] Shared geometry across all blobs.
- [x] Full disposal on unmount: geometry, materials, renderer; listeners removed; rAF cancelled.
- [x] Pixel ratio capped at 2.

## 7. Implementation Checklist
- [x] Brand + mission column with GitHub link
- [x] Docs and Project link columns (real URLs only)
- [x] Version line from `__APP_VERSION__`
- [x] Lava-lamp retuned to amber/blue, subtler, reduced-motion aware
- [x] Removed newsletter/alert, fake links and `@ts-ignore`
- [x] Story imports from `@storybook/react-vite`
