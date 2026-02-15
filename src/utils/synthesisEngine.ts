import { byZ, type Element } from '@/data/elements';
import type { PairAnalysis, Confidence } from '@/utils/interactionPredictor';
import { lookupCompound, type KnownCompound, type RelatedCompound, type CompoundVisual } from '@/data/knownCompounds';

export interface SlotEntry {
  Z: number;
  count: number;
}

export type SynthesisClassification = 'ionic' | 'covalent' | 'metallic' | 'uncertain';

export interface SynthesisResult {
  formula: string;
  classification: SynthesisClassification;
  confidence: Confidence;
  ionFormula: string | null;
  chargeA: number | null;
  chargeB: number | null;
  flags: string[];
  assumptionsNote: string | null;
  compoundName: string | null;
  compoundDescription: string | null;
  compoundDidYouKnow: string | null;
  relatedCompounds: RelatedCompound[] | null;
  compoundVisual: CompoundVisual | null;
}

/** Format a formula from slots, e.g. [{Z:1,count:2},{Z:8,count:1}] => "H₂O" */
export function formatFormula(slots: SlotEntry[]): string {
  return slots.map(s => {
    const el = byZ(s.Z);
    if (!el) return '?';
    return s.count > 1 ? `${el.sym}${subscript(s.count)}` : el.sym;
  }).join('');
}

function subscript(n: number): string {
  const subs = '₀₁₂₃₄₅₆₇₈₉';
  return String(n).split('').map(d => subs[parseInt(d)] || d).join('');
}

/** Parse a single integer charge from a typicalCharge string like "+2" or "-1". Returns null if variable/unknown. */
function parseCharge(charge: string | null): number | null {
  if (!charge) return null;
  const m = charge.match(/^([+-])(\d+)$/);
  if (!m) return null;
  return m[1] === '+' ? parseInt(m[2]) : -parseInt(m[2]);
}

/** Compute simplest charge-balanced ionic formula */
function ionicFormula(elA: Element, chargeA: number, elB: Element, chargeB: number): string {
  // elA should be cation (positive), elB anion (negative)
  let cation = elA, anion = elB, cCharge = Math.abs(chargeA), aCharge = Math.abs(chargeB);
  if (chargeA < 0 && chargeB > 0) {
    cation = elB; anion = elA;
    cCharge = Math.abs(chargeB); aCharge = Math.abs(chargeA);
  }
  // Find simplest ratio
  const g = gcd(cCharge, aCharge);
  const cCount = aCharge / g;
  const aCount = cCharge / g;
  return `${cation.sym}${cCount > 1 ? subscript(cCount) : ''}${anion.sym}${aCount > 1 ? subscript(aCount) : ''}`;
}

function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

/**
 * Synthesize compound from slot entries using pre-computed PairAnalysis.
 * Does NOT generate narration — returns structured fields only.
 */
export function synthesize(slots: SlotEntry[], primaryPair: PairAnalysis | null): SynthesisResult {
  const formula = formatFormula(slots);
  const flags: string[] = [];
  let assumptionsNote: string | null = null;

  // Try known compound lookup first
  const known = lookupCompound(slots);
  if (known) {
    return {
      formula: known.formula,
      classification: known.classification,
      confidence: 'likely',
      ionFormula: null,
      chargeA: null,
      chargeB: null,
      flags: [],
      assumptionsNote: null,
      compoundName: known.name,
      compoundDescription: known.description,
      compoundDidYouKnow: known.didYouKnow,
      relatedCompounds: known.related.length > 0 ? known.related : null,
      compoundVisual: known.visual,
    };
  }

  if (!primaryPair || slots.length < 2) {
    return { formula, classification: 'uncertain', confidence: 'uncertain', ionFormula: null, chargeA: null, chargeB: null, flags: ['Insufficient elements for analysis.'], assumptionsNote: null, compoundName: null, compoundDescription: null, compoundDidYouKnow: null, relatedCompounds: null, compoundVisual: null };
  }

  const { bondType, bondConfidence, uncertaintyFlags, ionA, ionB } = primaryPair;
  flags.push(...uncertaintyFlags);

  if (bondConfidence === 'uncertain') {
    assumptionsNote = 'This is a simplified model; some elements (especially transition metals) can form multiple ions and bonding patterns.';
  }

  // Classify
  let classification: SynthesisClassification = 'uncertain';
  let confidence: Confidence = bondConfidence;

  if (bondType === 'Ionic') {
    classification = 'ionic';
  } else if (bondType.toLowerCase().includes('covalent') || bondType.toLowerCase().includes('polar')) {
    classification = 'covalent';
  } else if (bondType.toLowerCase().includes('metallic') || bondType.toLowerCase().includes('alloy')) {
    classification = 'metallic';
  }

  // Try ionic formula
  let ionFormulaStr: string | null = null;
  const cA = parseCharge(ionA.typicalCharge);
  const cB = parseCharge(ionB.typicalCharge);

  if (classification === 'ionic' && cA !== null && cB !== null && !ionA.uncertain && !ionB.uncertain) {
    if ((cA > 0 && cB < 0) || (cA < 0 && cB > 0)) {
      ionFormulaStr = ionicFormula(ionA.element, cA, ionB.element, cB);
    }
  }

  return {
    formula,
    classification,
    confidence,
    ionFormula: ionFormulaStr,
    chargeA: cA,
    chargeB: cB,
    flags,
    assumptionsNote,
    compoundName: null,
    compoundDescription: null,
    compoundDidYouKnow: null,
    relatedCompounds: null,
    compoundVisual: null,
  };
}
