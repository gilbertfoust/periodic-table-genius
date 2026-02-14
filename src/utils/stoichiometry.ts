import type { Reaction } from '@/data/reactions';
import { clamp } from './elementHelpers';

export function mlToL(ml: number): number {
  const x = Number(ml);
  if (!Number.isFinite(x)) return 0;
  return x / 1000;
}

export function moles(M: number, mL: number): number {
  const molarity = Number(M);
  const volL = mlToL(mL);
  if (!Number.isFinite(molarity) || molarity < 0) return 0;
  return molarity * volL;
}

export function reactantMoles(mode: string, a: number, b: number): number {
  if (mode === 'moles') {
    const x = Number(a);
    if (!Number.isFinite(x) || x < 0) return 0;
    return x;
  }
  return moles(a, b);
}

export function fmt(x: number, digits = 4): string {
  if (!Number.isFinite(x)) return '0';
  const d = Math.max(0, digits);
  return (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toString();
}

export interface StepResult {
  title: string;
  text: string;
}

export interface MixtureResult {
  badge: string;
  equation: string;
  steps: StepResult[];
  vizScale: number;
  error?: string;
}

export function runStoichiometry(
  rxn: Reaction,
  a1: string, a2: string, b1: string, b2: string
): MixtureResult {
  const modeA = rxn.A.mode || 'solution';
  const modeB = rxn.B.mode || 'solution';

  const numOrNull = (v: string) => { const x = Number(v); return Number.isFinite(x) ? x : null; };
  const isPos = (x: number | null): x is number => x !== null && Number.isFinite(x) && x > 0;

  // Validate A
  if (modeA === 'solution') {
    const M = numOrNull(a1), V = numOrNull(a2);
    if (!isPos(M) || !isPos(V)) {
      return { badge: 'Enter positive molarity and volume for Reactant A (or click Example values).', equation: rxn.balanced, steps: [{ title: 'Input check', text: 'Reactant A needs both molarity (M) and volume (mL) greater than zero.' }], vizScale: 0, error: 'invalid_a' };
    }
  } else {
    const mol = numOrNull(a1);
    if (!isPos(mol)) {
      return { badge: 'Enter positive moles for Reactant A (or click Example values).', equation: rxn.balanced, steps: [{ title: 'Input check', text: 'Reactant A is treated as a direct amount in moles for this reaction.' }], vizScale: 0, error: 'invalid_a' };
    }
  }

  // Validate B
  if (modeB === 'solution') {
    const M = numOrNull(b1), V = numOrNull(b2);
    if (!isPos(M) || !isPos(V)) {
      return { badge: 'Enter positive molarity and volume for Reactant B (or click Example values).', equation: rxn.balanced, steps: [{ title: 'Input check', text: 'Reactant B needs both molarity (M) and volume (mL) greater than zero.' }], vizScale: 0, error: 'invalid_b' };
    }
  } else {
    const mol = numOrNull(b1);
    if (!isPos(mol)) {
      return { badge: 'Enter positive moles for Reactant B (or click Example values).', equation: rxn.balanced, steps: [{ title: 'Input check', text: 'Reactant B is treated as a direct amount in moles for this reaction.' }], vizScale: 0, error: 'invalid_b' };
    }
  }

  const nA = reactantMoles(modeA, Number(a1), Number(a2));
  const nB = reactantMoles(modeB, Number(b1), Number(b2));

  if (nA <= 0 || nB <= 0) {
    return { badge: 'One reactant amount is zero, so the model predicts no reaction extent.', equation: rxn.balanced, steps: [{ title: 'Extent', text: 'extent = 0 because at least one reactant has 0 moles.' }], vizScale: 0 };
  }

  const extA = rxn.A.coeff > 0 ? nA / rxn.A.coeff : 0;
  const extB = rxn.B.coeff > 0 ? nB / rxn.B.coeff : 0;
  const extent = Math.min(extA, extB);
  const limiting = extA < extB ? 'A' : extB < extA ? 'B' : 'none';

  const usedA = rxn.A.coeff * extent;
  const usedB = rxn.B.coeff * extent;
  const leftA = Math.max(0, nA - usedA);
  const leftB = Math.max(0, nB - usedB);

  const vizScale = clamp(extent / 0.05, 0, 1);

  const steps: StepResult[] = [];
  steps.push({ title: 'Classify', text: `This reaction is treated as: ${rxn.type}. The tutor uses a rule-based model for predictable outcomes.` });

  const inputExplainA = modeA === 'moles'
    ? `Reactant A is interpreted as a direct amount in moles: n(A) = ${fmt(nA)} mol.`
    : `Reactant A uses n = M × V: n(A) = ${fmt(nA)} mol (V converted from mL to L).`;
  const inputExplainB = modeB === 'moles'
    ? `Reactant B is interpreted as a direct amount in moles: n(B) = ${fmt(nB)} mol.`
    : `Reactant B uses n = M × V: n(B) = ${fmt(nB)} mol (V converted from mL to L).`;

  steps.push({ title: 'Translate inputs into moles', text: `${inputExplainA} ${inputExplainB}` });
  steps.push({ title: 'Use coefficients to compare', text: `Compare n(A)/a and n(B)/b: ${fmt(extA)} vs ${fmt(extB)}. The smaller value sets the reaction extent (extent = ${fmt(extent)} mol of reaction).` });

  let limText = 'Neither reactant is limiting in this calculation (perfect stoichiometric match).';
  if (limiting === 'A') limText = 'Reactant A is limiting, so the reaction stops when A is used up.';
  if (limiting === 'B') limText = 'Reactant B is limiting, so the reaction stops when B is used up.';
  steps.push({ title: 'Limiting reactant', text: limText });

  steps.push({ title: 'Compute amounts consumed and left', text: `Used A = a×extent = ${fmt(usedA)} mol, left A ≈ ${fmt(leftA)} mol. Used B = b×extent = ${fmt(usedB)} mol, left B ≈ ${fmt(leftB)} mol.` });

  const prodCoeffs = rxn.prodCoeffs || {};
  const produced = rxn.products.map(p => {
    const c = typeof prodCoeffs[p] === 'number' ? prodCoeffs[p] : 1;
    return { p, mol: c * extent };
  });
  steps.push({ title: 'Compute products', text: `Predicted products (moles): ${produced.map(x => `${x.p}: ${fmt(x.mol)} mol`).join(' · ')}` });
  steps.push({ title: 'Connect to the observable outcome', text: `Observable: ${rxn.visuals.message} (visual scale reflects reaction extent for demonstration).` });

  return {
    badge: `${rxn.type}: ${rxn.visuals.message}`,
    equation: rxn.balanced,
    steps,
    vizScale,
  };
}

export function getExampleValues(rxn: Reaction): { a1: string; a2: string; b1: string; b2: string } {
  const baseM = 1.0;
  const baseV = 50;

  let a1: string, a2: string, b1: string, b2: string;

  if (rxn.A.mode === 'moles') {
    a1 = '0.05';
    a2 = '';
  } else {
    a1 = String(baseM);
    a2 = String(baseV);
  }

  if (rxn.B.mode === 'moles') {
    b1 = String(0.05 * (rxn.B.coeff / rxn.A.coeff));
    b2 = '';
  } else {
    b1 = String(baseM);
    b2 = String(baseV * (rxn.B.coeff / rxn.A.coeff));
  }

  return { a1, a2, b1, b2 };
}
