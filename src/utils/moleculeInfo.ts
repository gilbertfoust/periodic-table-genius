/**
 * Derives molecule display info (name, bond type label, bond angle) from a set of
 * selected atomic numbers, using KNOWN_COMPOUNDS as the primary source.
 */
import { KNOWN_COMPOUNDS } from '@/data/knownCompounds';
import type { Element } from '@/data/elements';

export interface MoleculeInfo {
  name: string;
  bondType: string;      // e.g. "polar covalent"
  bondAngle: string | null;  // e.g. "104.5°"
  formula: string;
}

/** VSEPR bond angles for well-known geometries, keyed by sorted Z-counts string */
const BOND_ANGLES: Record<string, string> = {
  // H₂O  [1,1,8]  → bent 104.5°
  '1:2,8:1': '104.5°',
  // H₂O₂ [1,1,8,8] → ~111° (O–O single bond)
  '1:2,8:2': '111°',
  // NH₃  [1,3,7]  → trigonal pyramidal 107°
  '1:3,7:1': '107°',
  // CH₄  [1,4,6]  → tetrahedral 109.5°
  '1:4,6:1': '109.5°',
  // CO₂  [6,8,8]  → linear 180°
  '6:1,8:2': '180°',
  // SO₂  [8,8,16] → bent ~119°
  '8:2,16:1': '119°',
  // H₂S  [1,2,16] → bent ~92°
  '1:2,16:1': '92°',
  // HCl  [1,17] → linear (diatomic)
  '1:1,17:1': '—',
  // O₂   [8,8]
  '8:2': '—',
  // N₂   [7,7]
  '7:2': '—',
  // NaCl [11,17]
  '11:1,17:1': '—',
  // CO   [6,8]
  '6:1,8:1': '—',
  // NO   [7,8]
  '7:1,8:1': '—',
};

const BOND_TYPE_LABELS: Record<string, string> = {
  covalent: 'covalent',
  polar_covalent: 'polar covalent',
  ionic: 'ionic',
  metallic: 'metallic',
  uncertain: 'uncertain',
};

/** Build the compound lookup key from elements (same format as KNOWN_COMPOUNDS keys). */
function buildKey(elements: Element[]): string {
  const counts: Record<number, number> = {};
  for (const el of elements) counts[el.Z] = (counts[el.Z] ?? 0) + 1;
  return Object.entries(counts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([z, n]) => `${z}:${n}`)
    .join(',');
}

export function getMoleculeInfo(elements: Element[]): MoleculeInfo | null {
  if (elements.length < 2) return null;

  const key = buildKey(elements);
  const compound = KNOWN_COMPOUNDS[key];

  const formula = compound?.formula ?? elements.map(e => e.sym).join('');
  const name = compound?.name ?? null;

  // Determine bond type label
  let bondType = 'covalent';
  if (compound) {
    const cls = compound.classification as string;
    bondType = BOND_TYPE_LABELS[cls] ?? cls;
    // Refine covalent → polar covalent based on electronegativity difference
    if (cls === 'covalent' && elements.length === 2) {
      const [a, b] = elements;
      const diff = Math.abs((a.en ?? 0) - (b.en ?? 0));
      if (diff > 0.4 && diff < 1.5) bondType = 'polar covalent';
    }
  } else {
    // Fallback: classify by max EN difference
    const ens = elements.map(e => e.en ?? 0).filter(Boolean);
    if (ens.length >= 2) {
      const diff = Math.max(...ens) - Math.min(...ens);
      if (diff >= 1.7) bondType = 'ionic';
      else if (diff >= 0.4) bondType = 'polar covalent';
      else bondType = 'nonpolar covalent';
    }
  }

  const bondAngle = BOND_ANGLES[key] ?? null;

  return { name: name ?? formula, bondType, bondAngle, formula };
}
