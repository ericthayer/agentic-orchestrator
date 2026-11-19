# Agentic Orchestrator

Turn AI agents from autocomplete into disciplined collaborators: they build from the same rules, specs and skills every time.

Agentic Orchestrator is a reusable React + Three.js template. Its landing page demonstrates the idea the template is built on, and the repo itself is set up so an AI agent can open it and work to the same standards as the people who wrote it.

## What agentic orchestration is

"Vibe coding" means giving an AI agent a vague, intent-based prompt and hoping the output is good. It works for small experiments. It breaks down when the work has to be accessible, performant and consistent with a design system.

Agentic orchestration is the alternative: you coordinate agents with shared rules, written specs and reusable workflows, so their output is repeatable and ready for production. The agent stops guessing and starts working against a contract you agreed on together.

The full argument is in [AGENTIC_ORCHESTRATION.md](./AGENTIC_ORCHESTRATION.md).

## The three pillars

The pillars are layers, applied in this order: rules, then spec, then skills.

| Pillar | What it does | Where it lives |
| --- | --- | --- |
| Shared rules | One source of truth for standards. Agents inherit them the moment the workspace opens, so you don't repeat instructions per task. | [`.agent/rules/`](./.agent/rules/) |
| Spec-driven development | Every feature starts as a spec. It removes ambiguity, agrees the technical approach before code, and gives the agent a checklist to satisfy. | [`.agent/rules/spec-driven-development.md`](./.agent/rules/spec-driven-development.md), plus a `*.spec.md` beside every component in [`src/components/`](./src/components/) |
| Agent skills | Workflows the agent runs that know about the rules and specs, closing the loop between what you specified and what gets built. | [`.agent/workflows/`](./.agent/workflows/) |

Rules in [`.agent/rules/`](./.agent/rules/):

- `accessibility.md`: accessibility standards for Three.js and React
- `component-architecture.md`: directory and file structure for components
- `react-19-compiler.md`: writing code for the React Compiler
- `spec-driven-development.md`: the spec-first methodology
- `supabase.md`: auth, database and asset storage with Supabase
- `tailwind-v4.md`: Tailwind CSS v4 in a performance-oriented app
- `three-js-react.md`: production-ready Three.js in React
- `vite-rolldown.md`: the Rolldown-based Vite bundler
- `web-performance.md`: Core Web Vitals and performance (always on)

Workflows in [`.agent/workflows/`](./.agent/workflows/):

- `setup-orchestration.md` (`/setup-orchestration`): checks the rules are present, runs the init script if they're missing, loads the project philosophy, then asks for the first spec
- `sdd-workflow.md` (`/sdd-workflow`): the spec template (goal, interface, implementation, visuals, accessibility, performance, checklist, changelog)

## Outcomes

For teams, the bottleneck is rarely typing code. It's maintenance, consistency and compliance.

- **Accessibility by default.** Rules such as "respect reduced motion" are enforced, not optional.
- **Performance built in.** Asset budgets and critical CSS are part of the agent's instructions.
- **Faster onboarding.** New people learn one workflow, not every nuance of the stack.

## Use as a template

This repo is the starting point for learning apps and demo sites for education. For example, [Design Great Prompts](https://design-great-prompts.netlify.app/) was built from it.

1. Clone the template and install dependencies.

   ```bash
   git clone https://github.com/ericthayer/agentic-orchestrator.git my-project
   cd my-project
   npm install
   ```

2. Pull your shared rules into the project.

   ```bash
   sh scripts/init-orchestration.sh
   ```

   The script copies every `*.md` file from `~/.antigravity/rules/` into `.agent/rules/` (a copy, not a symlink), and exits with a warning if that directory doesn't exist. The repo already ships a full set of rules in `.agent/rules/`, so this step is only needed when you keep organisation-wide rules in that global folder.

3. Ask your agent to run `/setup-orchestration` to load the rules and workflows.
4. Write a spec with `/sdd-workflow`, then build your scene: a Three.js learning app, an interactive demo or a case study.

More detail, including system requirements (Bash on macOS or Linux, Node 18+), is in [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md).

## Tech stack

- React 19 with TypeScript. The React Compiler is enabled (`babel-plugin-react-compiler` in [`vite.config.ts`](./vite.config.ts)).
- Vite, using the Rolldown-based build (`rolldown-vite`)
- Tailwind CSS v4, configured CSS-first with `@theme` in [`src/index.css`](./src/index.css)
- Three.js for the 3D scenes, framer-motion for UI motion, lucide-react for icons
- Storybook 10 with the accessibility, docs and Vitest addons; Chromatic for visual review
- semantic-release with Conventional Commits, run by GitHub Actions on pushes to `main` (see [SEMANTIC_VERSIONING.md](./SEMANTIC_VERSIONING.md))

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run ESLint across the project |
| `npm run preview` | Serve the production build locally |
| `npm run storybook` | Start Storybook on port 6006 |
| `npm run build-storybook` | Build a static Storybook |
| `npm run chromatic` | Publish Storybook to Chromatic for visual review |

## Project map

```text
.agent/
  rules/            Shared rules every agent inherits
  workflows/        Agent workflows: /setup-orchestration, /sdd-workflow
.github/
  workflows/        release.yml (semantic-release on main)
  pull_request_template.md
.storybook/         Storybook config
scripts/
  init-orchestration.sh   Copies global rules into .agent/rules
src/
  App.tsx           Switches between the landing page and the journey view
  index.css         Tailwind v4 theme tokens
  components/       One folder per component: Component.tsx, .spec.md, .stories.tsx
```

Components in [`src/components/`](./src/components/), each with a sibling spec and stories file:

- `Hero`: opening section with the page headline, a Three.js particle scene and the entry point to the journey
- `CloudSection`: scroll-driven section rendered with fragment-shader clouds
- `DigitalAssetsSection`: feature section with floating 3D elements around a central UI composition
- `ContactBanner`: closing call-to-action banner that hosts the contact form
- `ContactForm`: validated contact form with a submission handler
- `AppFooter`: site footer over a cursor-responsive Three.js background
- `InteractiveJourney`: step-by-step demo that walks from vibe coding to spec-driven development

Docs at the repo root:

- [AGENTIC_ORCHESTRATION.md](./AGENTIC_ORCHESTRATION.md): the philosophy
- [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md): setting up a new project from the template
- [CASE_STUDY.md](./CASE_STUDY.md): how this project was built with an agent
- [SPEC-STORYBOOK-CHROMATIC.md](./SPEC-STORYBOOK-CHROMATIC.md): the Storybook, Chromatic and release pipeline spec
- [SEMANTIC_VERSIONING.md](./SEMANTIC_VERSIONING.md): commit format and release rules
- [CHANGELOG.md](./CHANGELOG.md): release history

## Further reading

- [Beyond vibe coding: agentic orchestration](./AGENTIC_ORCHESTRATION.md)
- [Template guide](./TEMPLATE_GUIDE.md)
- [Case study](./CASE_STUDY.md)
- [Spec template](./.agent/workflows/sdd-workflow.md)
- [Example site: Design Great Prompts](https://design-great-prompts.netlify.app/)
