# SPEC: ContactBanner ("Use the template" section)

## 1. Goal & Intent
Close the landing page by turning interest into action: tell designers and developers what the template is for and give them the three real steps to start a project from it. The exported name and file stay `ContactBanner` so existing imports keep working; the content is no longer a contact/consulting form.

## 2. Usage & Interface
Placed after the pillars/case-study content, before `AppFooter`.

```tsx
<ContactBanner />
<ContactBanner title="Start your next learning app from here" />
```

| Prop | Type | Default |
| --- | --- | --- |
| `title` | `string?` | `"Start your next learning app from here"` |

Renders `<section id="template" aria-labelledby="template-heading">` so in-page links (e.g. a hero "Use the template" link) can target `#template`.

## 3. Content
- **h2**: "Start your next learning app from here".
- **Lead**: one sentence: a React + Three.js starting point for learning apps, interactive demos and case studies for education, with rules, specs and skills already in place.
- **Steps** (`<ol>`, a true sequence; commands in `<code>`):
  1. Clone the repo and run `sh scripts/init-orchestration.sh` to pull the shared rules in.
  2. Ask your agent to run `/setup-orchestration` to load the rules and workflows.
  3. Write a spec, then build your scene (Three.js learning app, interactive demo, case study).
- **Primary CTA**: "Clone the template" → https://github.com/ericthayer/agentic-orchestrator (`bg-cue text-ink`, the one amber emphasis in the view).
- **Secondary link**: "See an example: Design Great Prompts" → https://design-great-prompts.netlify.app/ (`text-signal`).
- Both links open in a new tab with `rel="noopener noreferrer"` and a visually hidden "(opens in a new tab)".

## 4. Visuals & Interaction
- `bg-ink` with a `border-staff` top hairline; two-column grid on `lg`, stacked below.
- Steps are separated by `border-staff` hairlines (staff-line motif), not cards. Step numbers are `font-display text-mute`, `aria-hidden` (the `<ol>` conveys order).
- Headline: `font-display`, condensed (`font-stretch: 80%`), sentence case.
- Radius: `rounded-md` on the CTA. No gradients, glassmorphism, glows or decorative orbs.

## 5. Motion
- One `whileInView` fade/rise of the section content (`once: true`).
- `useReducedMotion()` from framer-motion: when true, content renders in place with no animation.
- No infinite/ambient animation.

## 6. Accessibility (WCAG 2.1 AA)
- [x] Single `<h2>` labelling the section.
- [x] `<ol role="list">` keeps list semantics despite reset list styles.
- [x] Real `<a>` elements; global `:focus-visible` ring applies.
- [x] Contrast: `text-ink` on `bg-cue`, `text-paper`/`text-mute`/`text-signal` on `bg-ink` all ≥ 4.5:1.
- [x] Reduced motion respected.
- [x] Body copy ≤ 60ch; no horizontal scroll at 375px (`<code>` may wrap).

## 7. Implementation Checklist
- [x] Replace consulting copy, fake email and embedded `ContactForm`
- [x] Template steps as ordered list with `<code>` commands
- [x] Primary + secondary CTAs with real URLs
- [x] Remove pulsing aura and decorative blurs
- [x] Single reveal, reduced-motion aware
- [x] Story imports from `@storybook/react-vite`
