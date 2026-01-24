# Guidelines for Agents when building React applications with Three.js and AI-powered tools

**OBJECTIVE:**
Building production-ready React applications with [Three.js](https://threejs.org/manual/#en/creating-a-scene) and AI-powered APIs and tooling.

**REASON:**
Enables rapid prototyping and design collaboration while delivering production-quality, maintainable code.

**DESCRIPTION:**
Use these instructions when building React applications in TypeScript, independent of specific UI frameworks.

**INSTRUCTIONS:**
Create responsive, accessible React applications with TypeScript using strict configuration.

Include the following specifications:



1. **Accessibility & Performance**: Prioritize as first-class features. Follow [Web Interface Guidelines](./web-interface-guidelines.instructions.md):
   - Semantic HTML (`<button>`, `<a>`, `<label>`, `<form>`)
   - ARIA labels for icon-only buttons and form controls
   - Keyboard navigation and visible focus states
   - Screen reader support with `aria-live` for async updates
   - No paste-blocking or zoom-disabling
   - Images with explicit dimensions

2. **Adaptive Layout & Mobile-First UX**: Use CSS custom properties, Container Queries, and dynamic viewport units (`cqw`, `svh`) for responsive design. Implement touch-friendly interactions.

3. **TypeScript**: Use strict typing throughout. Define interfaces for component props. Avoid `any`.

4. **Component Structure**:
   - One component per file with PascalCase filename (`.tsx`)
   - Functional components with hooks
   - Explicit prop types via interfaces
   - `defaultProps` for optional props
   - Named exports or single default export

5. **State Management**: 
   - Use `useState` and `useContext` for local/shared state
   - Consider Context API for multi-level prop passing (2-3+ levels)
   - URL state for filters, tabs, pagination, expanded panels (use libraries like `nuqs`)

6. **Styling**: 
   - Use a consistent CSS-in-JS solution (Emotion, styled-components) or utility-based CSS
   - Create reusable design tokens (colors, typography, spacing)
   - Support light/dark modes; persist user preference
   - Avoid `transition: all`; list properties explicitly
   - Honor `prefers-reduced-motion`

7. **Forms & Inputs**:
   - Inputs require `<label>` or `aria-label`
   - Use correct `type` and `inputmode`
   - Include validation inline near fields
   - Disable submit button during requests; show loading state
   - Focus first error on submit
   - No paste-blocking; allow autocomplete

8. **Icons**: Use inline SVG or icon libraries (e.g., Lucide). No webfont icons.

9. **Images**: 
   - Explicit `width` and `height` to prevent layout shift
   - Lazy load below-fold images
   - Preload critical above-fold images

10. **Performance**:
    - Virtualize large lists (>50 items)
    - Avoid layout reads in render (`getBoundingClientRect`, `offsetHeight`)
    - Batch DOM operations
    - Use uncontrolled inputs where possible
    - Memoize expensive computations (`useMemo`, `useCallback`)

11. **Navigation & Deep Linking**: 
    - Use `<a>` or router `<Link>` (support Cmd/Ctrl+click)
    - Sync URL with component state
    - Support deep linking for all interactive features

12. **Destructive Actions**: Require confirmation modal or undo window. Never immediate.

13. **Testing & Documentation**: 
    - Unit tests for core components and utilities
    - Visual regression tests when possible
    - Storybook or equivalent for documentation
    - Accessibility audits (WCAG)

14. **Web Standards Compliance**: Follow all guidelines in [Web Interface Guidelines](./web-interface-guidelines.instructions.md) for forms, focus, animations, content handling, hydration, and copy.

15. **Three.js Best Practices**:
    - **Resource Management**: 
      - Always dispose of `Geometry`, `Material`, `Texture`, and `Renderer` objects in component cleanup to prevent WebGL memory leaks
      - Call `geometry.dispose()`, `material.dispose()`, `texture.dispose()`, and `renderer.dispose()` in the `useEffect` cleanup function
      - Dispose of post-processing passes and composers when unmounting
    - **Performance Optimization**:
      - Cap pixel ratio to `Math.min(window.devicePixelRatio, 2)` to balance quality and performance
      - Set `powerPreference: "high-performance"` in `WebGLRenderer` options
      - Reuse objects (Vector3, Color, etc.) instead of creating new instances in the animation loop
      - Use `BufferGeometry` instead of legacy `Geometry`
      - Limit particle counts and geometry complexity based on device capabilities
    - **React Integration**:
      - Use `useRef` for canvas elements and Three.js objects (scene, camera, renderer)
      - Initialize Three.js in `useEffect` with proper cleanup in the return function
      - Cancel `requestAnimationFrame` on component unmount to prevent memory leaks
      - Avoid storing Three.js objects in React state; use refs instead
    - **Responsive Design**:
      - Handle window resize events to update camera aspect ratio and renderer size
      - Update post-processing composer and pass resolutions on resize
      - Debounce resize handlers if performing expensive recalculations
    - **Animation Loop**:
      - Use `requestAnimationFrame` for smooth 60fps rendering
      - Store the animation frame ID and cancel it in cleanup
      - Implement delta time for frame-rate independent animations when needed
    - **Scene Organization**:
      - Use `THREE.Group` to organize related objects for easier transformation and cleanup
      - Separate static and dynamic objects for optimization opportunities
      - Use meaningful names for objects to aid debugging (`object.name = "particleSystem"`)
    - **Asset Loading**:
      - Use `GLTFLoader` for 3D models (preferred format for web)
      - Implement `LoadingManager` for coordinated loading with progress tracking
      - Use `DRACOLoader` for compressed GLTF files to reduce file size
      - Handle loading errors gracefully with user feedback
      - Consider lazy loading non-critical 3D assets
    - **Shaders and Materials**:
      - Minimize dynamic lights; prefer baked lighting or environment maps (HDRI)
      - Use `ShaderMaterial` for custom effects but keep shaders optimized
      - Avoid heavy branching and loops in fragment shaders
      - Use `MeshStandardMaterial` or `MeshPhysicalMaterial` for PBR workflows
      - Set `depthWrite: false` and `transparent: true` appropriately for particle systems
    - **Post-Processing**:
      - Use `EffectComposer` for post-processing effects
      - Order passes efficiently (RenderPass → effects → FXAA/SMAA last)
      - Disable unused passes to save performance
      - Update pass resolutions on window resize
    - **Interaction**:
      - Throttle or debounce mouse/touch event handlers for expensive calculations
      - Use raycasting efficiently; limit the number of objects tested
      - Implement smooth camera controls with lerping for better UX
    - **Framework Consideration**:
      - For complex scenes, consider migrating to `@react-three/fiber` and `@react-three/drei` for declarative Three.js in React
      - These libraries provide React-friendly abstractions, automatic disposal, and helpful hooks