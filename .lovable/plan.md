

# Chemistry Learning Lab — Architecture & Implementation Plan

---

## Step 1: Architecture Map, State Model & Preservation Checklist

This step is **documentation only** — no UI code yet. It establishes the blueprint for everything that follows.

### 1A. Module Boundary Map

```
src/
├── data/
│   ├── elements.ts          # 118 element objects (Z, symbol, name, group, period, category, electronegativity, valence, typicalIon)
│   ├── reactions.ts          # 5 curated reaction configs (coefficients, products, visuals, notes)
│   ├── categoryColors.ts     # Category → color mapping
│   └── tutorContent.ts       # Tutor narrative generation logic (group meaning, trend explanations)
│
├── state/
│   ├── useSelectionStore.ts  # Zustand or context: selectedElements[] (multi-select, 1–6), activeOverlay, searchQuery
│   ├── useLabStore.ts        # Mixture Lab state: selectedReaction, inputs, results, visual outcome
│   └── useProgressStore.ts   # LocalStorage-backed: studied elements, quiz scores, lab completions (backend-ready)
│
├── utils/
│   ├── stoichiometry.ts      # Moles calc, limiting reactant, product prediction
│   ├── interactionPredictor.ts  # NEW: bond type likelihood, EN delta, ion tendency, confidence labels
│   └── elementHelpers.ts     # Search/filter, valence rules, trend lookups
│
├── components/
│   ├── Header/               # Title + search bar
│   ├── PeriodicTable/        # Grid, ElementCell, OverlayToggle, Legend, f-block rows
│   ├── SelectionTray/        # NEW: multi-select chip tray (2–6 elements), clear/reorder
│   ├── ElementTutor/         # Detail panel: Basics tab, Tutor tab, Practice tab
│   ├── InteractionInspector/  # NEW: bond analysis, EN delta, ion predictions, confidence flags
│   ├── CombineLab/           # NEW: drag-drop slots, predicted outcomes, "Send to Mixture Lab"
│   ├── MixtureLab/           # Reaction picker, inputs, stoichiometry results, visual outcome
│   └── TutorialCanvas/       # NEW: Three.js scenes (atom structure, bond formation, lattice)
│
├── scenes/                   # NEW: modular 3D scene files
│   ├── AtomStructureScene.tsx
│   ├── BondFormationScene.tsx
│   └── LatticeScene.tsx
│
└── pages/
    └── Index.tsx             # Single-page layout composing all modules
```

### 1B. State Model

| Store | Shape | Persistence |
|-------|-------|-------------|
| **Selection** | `{ selectedElements: number[], activeOverlay: 'category' \| 'electronegativity' \| 'atomicNumber' \| 'group', searchQuery: string }` | Session only |
| **Lab** | `{ reactionId: string, inputA: {molarity, volume}, inputB: {molarity, volume}, results: StepResult[], visualOutcome: VisualConfig }` | Session only |
| **Progress** | `{ studiedElements: Set<number>, quizScores: Record<number, boolean[]>, labCompletions: string[] }` | LocalStorage (swap to Supabase later) |

### 1C. Event Flow

1. **Search** → filters periodic table → dims non-matches, auto-highlights matches
2. **Click element** → toggles element in `selectedElements[]` (shift-click for multi-select, regular click for single)
3. **Selection changes** → Element Tutor updates to show first selected → Interaction Inspector updates if 2+ selected → 3D canvas switches scene
4. **Combine Lab** → user drags from tray into slots → `interactionPredictor` runs → shows predicted outcomes → optional "Send to Mixture Lab" prefills reaction
5. **Mixture Lab** → select reaction → fill inputs → run → stoichiometry engine → step-by-step results + animated visual

### 1D. Extension Points

- **New overlays**: Add to overlay enum + provide a `getOverlayValue(element, overlay)` function
- **New reactions**: Add to `reactions.ts` array — lab auto-picks them up
- **New 3D scenes**: Drop a new scene component in `scenes/`, register in scene switcher
- **Backend swap**: Replace LocalStorage calls in `useProgressStore` with Supabase client — interface stays identical
- **New interaction rules**: Add prediction functions to `interactionPredictor.ts`

### 1E. Preservation Checklist

| Existing Behavior | Verified By |
|---|---|
| All 118 elements render in correct grid positions (main grid + lanthanide/actinide rows) | Visual comparison |
| 4 overlay modes toggle correctly with matching legend | Toggle each, compare colors |
| Search filters by symbol, name, atomic number, and category substring | Test "H", "Oxygen", "8", "halogen", "lan" |
| Non-matching elements dim; matches highlight | Visual check during search |
| Element Tutor shows: atomic number, symbol, category, period, group, valence electrons, typical ion, electronegativity | Compare all 8 fields for O, Na, Fe |
| Tutor tab generates narrative about group meaning, category, predictions, trends | Read tutor text for elements in different groups |
| Practice tab shows multiple-choice questions with check + feedback | Answer correctly and incorrectly |
| Mixture Lab: 5 reactions selectable via dropdown | Cycle through all 5 |
| Stoichiometry: moles calculation, limiting reactant, product amounts all correct | Run with example values for each reaction |
| Visual outcomes: gas bubbles, precipitate bar, heat glow, color changes animate | Run each reaction type |
| "Example values" button prefills inputs; "Reset" clears them | Click both buttons |

---

## Step 2: React Scaffold + Port Existing Features

Port all existing prototype behavior into the React component architecture defined above, with a fresh dark-themed design using shadcn/ui.

### Periodic Table Explorer
- 18-column CSS grid with proper element positioning
- ElementCell component with hover effects, selection highlight, dimming on search
- 4 overlay toggle pills (Category, Electronegativity, Atomic #, Group)
- Dynamic color legend per overlay
- Lanthanide/Actinide rows separated below main grid
- Search input in header that filters in real-time

### Element Tutor Panel
- Shows details for the currently selected element
- Three tabs using shadcn Tabs component:
  - **Basics**: Card grid with 8 key properties
  - **Tutor**: Generated narrative paragraphs explaining trends
  - **Practice**: Multiple-choice quiz with instant feedback and visual correct/incorrect states

### Mixture Lab
- Reaction selector dropdown (5 curated reactions)
- Two reactant input rows with molarity/volume fields
- Action buttons: Run, Example Values, Reset
- Results area: balanced equation, step-by-step stoichiometry walkthrough
- Animated visual outcome panel (gas bubbles, precipitate, heat, color shift via CSS animations)

### Multi-Select Foundation
- Shift-click on periodic table adds element to selection tray (up to 6)
- Regular click replaces selection with single element
- Selection tray shows as a row of element chips below the periodic table

---

## Step 3: Interaction Inspector + Combine Lab

### Interaction Inspector Panel
- Activates automatically when 2+ elements are selected in the tray
- For each pair in the selection, displays:
  - **Electronegativity delta** and what it suggests (ionic vs covalent tendency)
  - **Bond type likelihood** labeled as *likely*, *plausible*, or *uncertain*
  - **Typical ion tendencies** for each element (cation/anion predictions)
  - **Expected interaction type** (ionic bond, covalent bond, metallic bond, no typical reaction)
  - **Uncertainty flags** where predictions are ambiguous (e.g., metalloids, transition metals with multiple oxidation states)

### Combine Lab
- Drag-and-drop interface: pull element chips from the selection tray into 2–4 reactant slots
- Once slots are filled, shows:
  - Predicted product(s) with explanation
  - Confidence label (*likely / plausible / uncertain*)
  - Reaction type classification
- **"Send to Mixture Lab"** button: if the combination matches a curated reaction, prefills the Mixture Lab with that reaction and suggested input values
- If no curated reaction matches, shows a message explaining the prediction is theoretical only

---

## Step 4: 3D Tutorial Module

### Architecture
- Uses `@react-three/fiber@^8.18` and `@react-three/drei@^9.122.0` with `three@>=0.133`
- Single `TutorialCanvas` wrapper component with a scene switcher
- Each scene is a separate file in `src/scenes/`
- Scene selection driven by current element selection and user toggle

### Scene 1: Atom Structure
- Displays electron shells as concentric rings/spheres
- Valence electrons highlighted in a distinct color
- Nucleus represented as a central sphere
- Adapts to whichever element is selected (correct shell count and electron distribution)
- Orbit animation with adjustable speed

### Scene 2: Bond Formation
- Triggered when 2 elements are selected
- Animates ionic bond (electron transfer) or covalent bond (electron sharing) based on EN delta
- Shows before/after states with labels
- Color-coded to match element categories

### Scene 3: Lattice / Precipitate Formation
- Triggered from Combine Lab when a precipitation reaction is predicted
- Simple 3D crystal lattice building animation
- Ions snap into position in a repeating unit cell pattern
- Can be rotated/zoomed by the user

### Integration
- Canvas appears as a collapsible panel alongside the Element Tutor
- Toggle button to show/hide 3D view
- Scene auto-switches based on context (1 element → atom structure, 2 elements → bond formation, precipitate reaction → lattice)
- Fallback to a placeholder when Three.js is loading

