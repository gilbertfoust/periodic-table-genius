

# Procedural Visual Outcomes for All Compounds

## Approach: Built-in CSS/SVG Visual Generator (No Backend Needed)

Instead of AI-generated images or static photos, we build a **procedural visual renderer** that generates real-time visuals from compound properties. This is lightweight, instant, and works for any combination -- known or unknown.

## How It Works

Each known compound gets a `visual` descriptor in the database that describes its **physical appearance**: state of matter, color, texture, opacity, and optional animated effects. For unknown compounds, the system infers visuals from the classification (ionic = crystalline solid, covalent = liquid/gas, metallic = shiny solid).

The renderer uses layered CSS gradients, SVG patterns, and subtle animations to create a "beaker view" showing what the result looks like in real life.

## What Learners Will See

- **NaCl (Table Salt)**: White crystalline powder settling at bottom of beaker
- **H2O (Water)**: Clear liquid with subtle light refraction
- **Fe2O3 (Rust)**: Reddish-brown powder layer
- **CO2 (Carbon Dioxide)**: Bubbles rising through clear liquid, escaping as gas
- **CuO (Copper Oxide)**: Black powder at bottom
- **Cu(OH)2**: Blue precipitate settling
- **NH3 (Ammonia)**: Faint vapor/mist rising from liquid
- **HCl + NaOH**: Heat shimmer glow (exothermic)
- **Unknown ionic compound**: Generic white/gray crystalline solid
- **Unknown covalent compound**: Generic clear liquid

## Changes

### 1. Add `CompoundVisual` type to `knownCompounds.ts`

Each known compound entry gets a new `visual` field:

```typescript
interface CompoundVisual {
  state: 'solid' | 'liquid' | 'gas' | 'aqueous';
  color: string;           // CSS color for the substance
  opacity: number;         // 0-1, transparency (water = 0.15, salt = 0.95)
  texture: 'crystalline' | 'powder' | 'liquid' | 'gas' | 'gel' | 'metallic';
  effects?: ('bubbles' | 'shimmer' | 'vapor' | 'glow' | 'sparkle' | 'settling')[];
  label: string;           // e.g. "White crystalline solid"
}
```

Examples added to existing entries:
- H2O: `{ state: 'liquid', color: 'rgba(180,220,255,0.15)', opacity: 0.15, texture: 'liquid', effects: ['shimmer'], label: 'Clear liquid' }`
- NaCl: `{ state: 'solid', color: 'rgba(245,245,250,0.92)', opacity: 0.92, texture: 'crystalline', effects: ['sparkle'], label: 'White crystalline solid' }`
- Fe2O3: `{ state: 'solid', color: 'rgba(180,60,30,0.88)', opacity: 0.88, texture: 'powder', effects: ['settling'], label: 'Reddish-brown powder' }`
- CO2: `{ state: 'gas', color: 'rgba(200,200,200,0.1)', opacity: 0.1, texture: 'gas', effects: ['bubbles'], label: 'Colorless gas' }`

### 2. New component: `SynthesisVisualOutcome.tsx`

A procedural renderer that takes a `CompoundVisual` (or infers one from classification) and renders layered CSS:

- **Bottom layer**: Beaker background (dark gradient, like existing VisualOutcome)
- **Substance layer**: Colored region positioned by state (solid = bottom, liquid = fills, gas = top)
- **Texture overlay**: SVG pattern for crystalline (tiny diamond grid), powder (stipple dots), metallic (gradient sheen)
- **Effects layer**: Animated CSS elements:
  - `bubbles`: Rising circles (reuses existing bubble animation)
  - `shimmer`: Subtle light refraction moving across liquid surface
  - `vapor`: Fading wisps rising upward
  - `sparkle`: Tiny flashing dots on crystalline surfaces
  - `settling`: Particles drifting downward
- **Label**: Physical description shown at bottom (e.g., "White crystalline solid")

### 3. Fallback inference for unknown compounds

When no known compound matches, generate a default visual from the synthesis classification:

| Classification | Default Visual |
|---------------|---------------|
| ionic | White/gray crystalline solid settling at bottom |
| covalent | Clear or pale liquid filling beaker |
| metallic | Silver-gray solid with metallic sheen |
| uncertain | Faint question-mark overlay on empty beaker |

### 4. Integrate into SynthesisPanel and CombineLab

- **SynthesisPanel**: After clicking "Synthesize", show the `SynthesisVisualOutcome` below the result card
- **CombineLab**: When a known compound is matched, show a mini version of the visual inline with the compound info

### 5. CSS animations in `index.css`

Add keyframes for the new effects: `@keyframes shimmer`, `@keyframes vapor-rise`, `@keyframes sparkle`, `@keyframes settle-down`. The existing `animate-bubble` keyframe is reused for gas bubbles.

---

## Technical Details

### Files Changed

| File | Change |
|------|--------|
| `src/data/knownCompounds.ts` | Add `CompoundVisual` interface and `visual` field to all ~30 compound entries |
| `src/components/MixtureLab/SynthesisVisualOutcome.tsx` | New -- procedural CSS/SVG renderer |
| `src/components/MixtureLab/SynthesisPanel.tsx` | Import and render `SynthesisVisualOutcome` after synthesis result |
| `src/components/CombineLab/CombineLab.tsx` | Show mini visual when known compound matched |
| `src/index.css` | Add keyframe animations for shimmer, vapor, sparkle, settling |

### Why Not AI-Generated Images?

- **Latency**: AI image generation takes 5-15 seconds. Learners adjusting atom counts need instant feedback.
- **Cost**: Each generation costs API credits. Students experimenting with dozens of combos would burn through credits fast.
- **Consistency**: CSS visuals look consistent and match the app's dark theme. AI images would look out of place.
- **Offline**: Works without internet/backend once loaded.
- **Extensibility**: Adding a new compound visual is one line of data, not a prompt engineering exercise.

The procedural approach gives the "real-time" feel you want -- change H2O to H2O2 and instantly see the visual shift from clear water to a slightly different liquid with a faint fizz effect.

