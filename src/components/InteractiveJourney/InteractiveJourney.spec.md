# SPEC: InteractiveJourney

## 1. Goal & Intent
The `InteractiveJourney` component is a dedicated demo experience that tells the story of our "Agentic Orchestration." It guides the user through the evolution from "Vibe Coding" to "SDD Excellence" using a step-by-step narrative coupled with interactive 3D visualizations from our project (Three.js).

The goal is to provide a "behind the scenes" look at how the Agentic Brain (.agent/rules) and Specs (.spec.md) directly influence the production code.

## 2. Usage & Interface
This component will likely be a full-page or large-section module that manages its own step-based state.

```tsx
<InteractiveJourney 
  onComplete={() => console.log("Journey Finished")}
/>
```

## 3. Technical Implementation
- **State Management**: `useState` for current step (0-4). `useContext` if we need to share with the global overlay.
- **Logic**: A "Step Engine" that maps each narrative phase to a specific 3D scene configuration (e.g., swapping geometry from "Vibe Cube" to "Orchestrated Icosahedron").
- **Dependencies**: Three.js, React-Three-Fiber, Framer Motion for text transitions.

## 4. Visuals & Interaction
- **Aesthetics**: "Cyber-Lab" / "Blueprints" style. Dark mode, neon accents, grid overlays.
- **Animations**: Smooth transitions between "Steps." The 3D background morphs as the user progresses.
- **Step 1: The Vibe**: A simple, unoptimized spinning cube (The Chaos of Prompts).
- **Step 2: The Brain**: Introducing the `.agent/rules`. The cube gains structure and a grid (The Rule of Law).
- **Step 3: The Spec**: A virtual "Blueprint" (The Spec.md contract) overlaying the 3D scene.
- **Step 4: The Symphony**: The full icosahedron/composer UI mockup (The Final Orchestrated Output).

## 5. Accessibility (WCAG 2.1)
- [ ] Keyboard Navigation (Left/Right arrows for steps)
- [ ] Screen reader support for narrative text (`aria-live` for step changes)
- [ ] Reduced Motion: Fade transitions instead of complex morphs if the preference is set.

## 6. Performance
- [ ] Asset Budgeting: Reuse geometry buffer where possible.
- [ ] Lazy loading of complex 3D assets for Step 4.

## 7. Implementation Checklist
- [ ] Scaffold `InteractiveJourney` component folder.
- [ ] Define the `steps` data array (narrative + 3D state).
- [ ] Implement the Step UI (Floating navigation/text).
- [ ] Connect Three.js scene to the current step state.
- [ ] Animation Polish (Framer Motion).
- [ ] Audit for Accessibility and Perf.

## 8. Changelog
- **2026-01-24**: Initial spec creation in response to Case Study victory.
