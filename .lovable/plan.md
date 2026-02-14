

# Step 4: 3D Tutorial Module (Revised)

## Revisions Applied

Two changes from the approved plan:

1. **BondFormationScene receives `PairAnalysis` via props** -- it does NOT call `analyzePair` or recompute EN thresholds. The parent (`TutorialCanvas`) runs the analysis and passes the result down. When `bondConfidence === 'uncertain'`, the scene shows a caution caption and avoids implying a single outcome (e.g., shows both ionic and covalent possibilities side-by-side with a "?" overlay).

2. **LatticeScene trigger is deterministic** -- it activates only when:
   - `prediction.reactionType === 'Ionic compound formation'` AND the matched curated reaction's `visuals.kind === 'precip'`, OR
   - The CombineLab's `matchedReactionId` resolves to a `REACTIONS` entry whose `visuals.kind === 'precip'`
   
   No string `.includes()` matching. A boolean `showLattice` prop is computed in `Index.tsx` using strict equality checks.

---

## Dependencies

Install: `three@^0.160.0`, `@react-three/fiber@^8.18.0`, `@react-three/drei@^9.122.0`

## New Files (5)

### 1. `src/components/TutorialCanvas/WebGLErrorBoundary.tsx`
- React class component error boundary
- Catches WebGL/Three.js errors
- Renders fallback card: "3D view is not available. The tutorial content is still accessible in the Element Tutor panel above."

### 2. `src/components/TutorialCanvas/TutorialCanvas.tsx`
- Wraps everything in a shadcn `Collapsible` with a toggle button labeled "3D View"
- Fixed-height container (280px)
- Contains `<Canvas>` from fiber with `dpr={[1, 1.5]}`, `frameloop="demand"` when collapsed
- `Suspense` fallback with loading text
- `WebGLErrorBoundary` wrapping the Canvas
- Props: `showLattice: boolean`, `latticeElements: Element[]` (the two ions for the lattice)
- Scene switching logic:
  - `showLattice === true` --> `LatticeScene` (with `latticeElements`)
  - `selectedElements.length === 0` --> placeholder text
  - `selectedElements.length === 1` --> `AtomStructureScene`
  - `selectedElements.length >= 2` --> `BondFormationScene`
- For BondFormationScene: calls `analyzePair(elA, elB)` here in the parent and passes the resulting `PairAnalysis` as a prop
- Caption `<p>` rendered below the canvas (plain HTML, not inside Three.js), populated by each scene's caption logic

### 3. `src/scenes/AtomStructureScene.tsx`
- Reads element from props (first selected element passed by TutorialCanvas)
- Nucleus as central `<Sphere>` with proton count label via drei `<Html>`
- Concentric `<Torus>` rings for shells (count = element's period)
- Small spheres orbiting each ring as electrons; valence shell electrons colored emerald, inner shells blue
- Simplified 2-8-8-18 shell filling model
- `useFrame` for orbit animation
- Exports `getAtomCaption(element)` returning: "Atom model of {Name} (Z={Z}) showing {N} electron shells. The {V} valence electrons (green) determine bonding behavior."

### 4. `src/scenes/BondFormationScene.tsx`
- Props: `analysis: PairAnalysis` (the full pair analysis result -- bondType, bondConfidence, enDelta, uncertaintyFlags, ionA, ionB)
- **Does NOT compute EN delta or bond type** -- reads entirely from the `analysis` prop
- Visualization branches on `analysis.bondType`:
  - `'Ionic'`: Animates electron sphere detaching from low-EN atom, transferring to high-EN atom; atoms resize to show ion formation
  - `'Nonpolar covalent'` or `'Polar covalent'`: Two atoms approach, overlapping translucent electron-sharing clouds merge
  - `'Metallic / alloy'`: Two metallic spheres with shared electron sea (translucent cloud around both)
  - `'No typical bond'`: Static display with label
- **Uncertain handling**: When `analysis.bondConfidence === 'uncertain'`, the scene shows both possible outcomes faded/ghosted with a "?" label in the center, and the caption includes a caution note
- `useFrame` + `useRef` for smooth lerp animations
- Exports `getBondCaption(analysis)`:
  - Normal: "Bond formation between {A} and {B}: {bondType} ({enDeltaLabel}). {interactionType}."
  - Uncertain: "Caution: The interaction between {A} and {B} is uncertain ({enDeltaLabel}). Multiple outcomes are possible depending on conditions. {uncertaintyFlags joined}"

### 5. `src/scenes/LatticeScene.tsx`
- Props: `elements: Element[]` (the two ions)
- 3x3x3 alternating grid of cation/anion spheres, colored by category
- Animated build: spheres appear one-by-one with stagger delay via `useFrame` + time tracking
- drei `<OrbitControls>` with `enableDamping` for rotation/zoom
- Exports `getLatticeCaption(elements)`: "Crystal lattice of {A}-{B} -- ions arrange in a repeating 3D pattern. This structure forms when oppositely charged ions are attracted to each other."

## Modified Files (2)

### `src/components/CombineLab/CombineLab.tsx`
- Add optional prop: `onPredictionChange?: (prediction: CombinePrediction | null) => void`
- Add a `useEffect` that calls `onPredictionChange` whenever `prediction` changes
- No other changes

### `src/pages/Index.tsx`
- Import `TutorialCanvas`, `CombinePrediction`, and `REACTIONS`
- Add state: `const [combinePrediction, setCombinePrediction] = useState<CombinePrediction | null>(null)`
- Compute `showLattice` deterministically:
  ```
  const showLattice = combinePrediction !== null
    && combinePrediction.matchedReactionId !== null
    && REACTIONS.find(r => r.id === combinePrediction.matchedReactionId)?.visuals.kind === 'precip';
  ```
- Compute `latticeElements` from `combinePrediction.elements` when `showLattice` is true
- Pass `onPredictionChange={setCombinePrediction}` to `CombineLab`
- Place `<TutorialCanvas showLattice={showLattice} latticeElements={latticeElements} />` in the right column between `ElementTutor` and `InteractionInspector`

## Verification Plan

1. Click Oxygen (Z=8) -- AtomStructureScene: 2 shells, 6 green valence electrons, caption mentions "6 valence electrons"
2. Shift-click Na + Cl -- BondFormationScene receives `PairAnalysis` with `bondType: 'Ionic'`, shows electron transfer animation, caption: "Ionic bond (delta-EN = 2.23)"
3. Shift-click C + O -- BondFormationScene receives `bondType: 'Polar covalent'`, shows sharing animation, caption: "Covalent bond (delta-EN = 0.89)"
4. Shift-click Fe + Cu (both transition metals) -- `bondConfidence: 'plausible'` or `'uncertain'`, scene shows caution state
5. In CombineLab, assign Ag + Cl -- `matchedReactionId: 'precip_agcl'` -- `REACTIONS.find(...).visuals.kind === 'precip'` is true -- LatticeScene triggers with deterministic check
6. In CombineLab, assign Na + Cl with `matchedReactionId: 'neutralization'` -- `visuals.kind === 'heat'` -- LatticeScene does NOT trigger
7. Collapse/expand toggle works, no console errors on unmount

