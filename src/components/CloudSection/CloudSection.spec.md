# SPEC: CloudSection

## 1. Goal & Intent
The mission section, "the shift": from vibe coding (vague prompts, hoping for good output) to orchestration (shared rules, a written spec and agent skills, so output is repeatable and reviewable). A full-screen cloud shader in midnight ink with amber and blue light sits behind a short statement and a link onward to the three pillars.

## 2. Usage & Interface
A standalone section directly after `Hero`. No props.

```tsx
<CloudSection />
```

- Section `id="cloud-section"` is the scroll target of the Hero; do not rename it.
- The link targets `#pillars` (the pillars section must own that id).

## 3. Content
- **h2** (`font-display`, condensed `font-stretch-[78%]`): "Vibe coding hopes. Orchestration checks."
- **Body** (≤ 60ch): "Vague prompts give you different code every time. Orchestration gives agents the same rules, a written spec and the right tools, so the output is repeatable, and reviewable, before it ships."
- **Contrast pair** (`<dl>`, hairline `border-staff` structure, not cards):
  - Vibe coding: "A prompt, then hope."
  - Orchestration: "Rules, a spec and skills, then verified output."
- **Link** (secondary style, `rounded-md border-staff text-paper`, hover `signal`): "Meet the three pillars" → `#pillars`. Amber (`cue`) is reserved for the Hero CTA.

## 4. Technical Implementation
- **Shader**: orthographic camera + 2x2 plane; layered FBM noise for slow cloud drift.
- **Palette** (in GLSL, matching `@theme`): ink `#080c18` base, ink-raised `#0f1526` cloud bodies, amber `#ffb547` light from below, blue `#7aa2ff` light from above. Brightness capped so no frame exceeds ~0.06 relative luminance. No pure black, no purple/pink.
- **Scroll logic**: viewport position (0–1) maps to shader opacity (fade in/out at the edges) and a staggered opacity/translate reveal of the text (single orchestrated moment).
- **Visibility**: `IntersectionObserver` starts the rAF loop only while the section is on screen and stops it otherwise.

## 5. Accessibility (WCAG 2.1)
- [x] Canvas and scrim are `aria-hidden`; section is labelled by its `h2` (`aria-labelledby`). Only the Hero owns the page `h1`.
- [x] Contrast: an ink radial scrim (`from-ink/85 via-ink/65 to-ink/20`) sits over the shader so `text-paper` and `text-mute` stay ≥ 4.5:1 at the brightest cloud.
- [x] `prefers-reduced-motion: reduce`: no animation loop (one still, fully opaque frame, re-rendered on resize), no scroll-driven reveal (text always visible, `motion-reduce:transition-none`). Preference changes are handled live.
- [x] Real `<a>` link with the global `:focus-visible` ring.

## 6. Performance
- [x] Single plane geometry; pixel ratio capped at 2; `powerPreference: 'high-performance'`.
- [x] rAF paused off screen; passive scroll listener.
- [x] Cleanup removes listeners, cancels rAF, disconnects the observer and disposes geometry, material and renderer.

## 7. Implementation Checklist
- [x] Shader retuned to ink / amber / blue
- [x] Mission copy and contrast pair
- [x] Working link to `#pillars` (replaces dead "Open App" button)
- [x] Reduced-motion still frame and static text
- [x] Contrast scrim
- [x] Responsive to 375px (contrast pair stacks below `sm`)

## 8. Changelog
- **2026-01-24**: Initial spec creation to document existing component.
- **2026-01-24**: [MANUAL SYNC] Design update: Applied `rounded-xl` to button for brand consistency.
- **2026-11-18**: Repurposed as the mission / "the shift" section for the Agentic Orchestrator rebrand. New copy, ink/amber/blue shader, `#pillars` link (`rounded-md`), reduced-motion support, contrast scrim, off-screen loop pause. Stories import from `@storybook/react-vite`.
