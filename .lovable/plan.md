

# Known Compounds Database + Count-Aware Intelligence

## The Problem

Right now, combining H(2) + O(1) shows "Plausible" and "uncertain" because the raw electronegativity math (delta-EN = 1.24) falls in an ambiguous threshold zone. But every student knows H2O is water. The app needs to **recognize real compounds** and teach learners what they are building -- and what happens when they add or remove an atom.

## The Solution

Add a **known compounds lookup table** that maps specific element+count combinations to real-world compound data. When a learner's slots match a known compound, the app shows the compound name, what it is, and why the ratio matters. When the slots are close to a known compound (e.g., H2O2 vs H2O), it highlights the difference.

---

## What Changes

### 1. New data file: `src/data/knownCompounds.ts`

A curated dictionary of ~30-40 common compounds learners should discover:

```
H2O  -> "Water" (polar covalent, liquid at room temp)
H2O2 -> "Hydrogen Peroxide" (polar covalent, unstable oxidizer)
NaCl -> "Table Salt" (ionic, crystalline solid)
CO2  -> "Carbon Dioxide" (nonpolar covalent, gas)
CO   -> "Carbon Monoxide" (polar covalent, toxic gas)
NaOH -> "Sodium Hydroxide / Lye" (ionic)
HCl  -> "Hydrochloric Acid" (polar covalent)
NH3  -> "Ammonia" (polar covalent)
CH4  -> "Methane" (nonpolar covalent)
CaCO3-> "Calcium Carbonate / Chalk"
Fe2O3-> "Iron(III) Oxide / Rust"
MgO  -> "Magnesium Oxide"
MgCl2-> "Magnesium Chloride"
Na2O -> "Sodium Oxide"
CaO  -> "Calcium Oxide / Quickite"
...etc
```

Each entry includes:
- Formula key (sorted symbol+count string for lookup)
- Common name(s)
- Classification (ionic/covalent/metallic)
- Confidence: always "likely" for known compounds
- One-line description of what it is
- A "did you know" fact for learners
- Related compounds (e.g., H2O links to H2O2) with a note on what the extra atom changes

### 2. New utility: `lookupCompound()` in `src/utils/synthesisEngine.ts`

- Takes `SlotEntry[]`, generates a canonical key (sorted by Z, e.g., "1:2,8:1")
- Looks up in the known compounds table
- Returns match (with name, description, classification, confidence) or null

### 3. Update `synthesize()` in `synthesisEngine.ts`

- Call `lookupCompound()` first
- If match found: override classification, confidence, and add `compoundName` and `compoundDescription` to the result
- If no match: fall through to existing EN-based logic (unchanged)
- Add new fields to `SynthesisResult`: `compoundName: string | null`, `compoundDescription: string | null`, `relatedCompounds: RelatedCompound[] | null`

### 4. Update `CombineLab.tsx` prediction display

When a known compound is matched:
- Show compound name prominently: **"Water (H2O)"** with a green "Known Compound" badge
- Show description: "A polar covalent molecule essential for life"
- Show "did you know" fact
- Show **related compounds panel**: "Add another O to get H2O2 (Hydrogen Peroxide) -- a powerful oxidizer. That one extra oxygen makes it unstable and reactive!"
- Confidence badge shows "Likely" (green) instead of "Plausible"

When no known compound matches:
- Keep current behavior (formula + EN-based classification)

### 5. Fix the EN threshold (minor)

Raise the "polar ionic / highly polar covalent" boundary from 1.2 to 1.5 so that compounds like H-O (delta-EN 1.24) correctly classify as "Polar covalent (Likely)" even when not in the known compounds table. This aligns with standard chemistry textbook thresholds.

---

## Technical Details

### Known Compound Data Structure

```typescript
interface KnownCompound {
  key: string;           // canonical: "1:2,8:1"
  formula: string;       // "H2O"
  name: string;          // "Water"
  aliases: string[];     // ["Dihydrogen Monoxide"]
  classification: SynthesisClassification;
  description: string;
  didYouKnow: string;
  related: { key: string; formula: string; name: string; note: string }[];
}
```

### Canonical Key Generation

```typescript
function compoundKey(slots: SlotEntry[]): string {
  return [...slots]
    .filter(s => s.count > 0)
    .sort((a, b) => a.Z - b.Z)
    .map(s => `${s.Z}:${s.count}`)
    .join(',');
}
```

### Files Changed

| File | Change |
|------|--------|
| `src/data/knownCompounds.ts` | New -- curated compound database (~30-40 entries) |
| `src/utils/synthesisEngine.ts` | Add `lookupCompound()`, extend `SynthesisResult` with compound name/description/related, call lookup in `synthesize()` |
| `src/utils/interactionPredictor.ts` | Raise EN threshold from 1.2 to 1.5 for polar covalent boundary |
| `src/components/CombineLab/CombineLab.tsx` | Show compound name, description, did-you-know, and related compounds when matched |

### What Learners Will See

- **H(2) + O(1)**: "Water (H2O)" -- Likely, Polar Covalent. "Add another O to get Hydrogen Peroxide!"
- **H(2) + O(2)**: "Hydrogen Peroxide (H2O2)" -- Likely, Polar Covalent. "Remove one O to get plain Water."
- **Na(1) + Cl(1)**: "Table Salt (NaCl)" -- Likely, Ionic.
- **C(1) + O(2)**: "Carbon Dioxide (CO2)" -- Likely, Nonpolar Covalent. "Remove one O to get Carbon Monoxide -- toxic!"
- **Fe(2) + O(3)**: "Rust (Fe2O3)" -- Likely, Ionic.
- **Unknown combo**: Falls back to current EN-based prediction (now with corrected thresholds)

