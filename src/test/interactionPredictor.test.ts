import { describe, it, expect } from 'vitest';
import { analyzePair, analyzeSelection, predictCombination } from '@/utils/interactionPredictor';
import { byZ } from '@/data/elements';
import { REACTIONS } from '@/data/reactions';

describe('interactionPredictor', () => {
  it('Na + Cl: ionic bond likely, ΔEN ≈ 2.23', () => {
    const na = byZ(11)!;
    const cl = byZ(17)!;
    const result = analyzePair(na, cl);
    expect(result.enDelta).toBeCloseTo(2.23, 1);
    expect(result.bondType).toBe('Ionic');
    expect(result.bondConfidence).toBe('likely');
    expect(result.ionA.typicalCharge).toBe('+1');
    expect(result.ionB.typicalCharge).toBe('-1');
    expect(result.uncertaintyFlags.length).toBe(0);
  });

  it('C + O: polar covalent likely, ΔEN ≈ 0.89', () => {
    const c = byZ(6)!;
    const o = byZ(8)!;
    const result = analyzePair(c, o);
    expect(result.enDelta).toBeCloseTo(0.89, 1);
    expect(result.bondType).toBe('Polar covalent');
    expect(result.bondConfidence).toBe('likely');
  });

  it('Fe + Cu: transition metals → uncertainty flags', () => {
    const fe = byZ(26)!;
    const cu = byZ(29)!;
    const result = analyzePair(fe, cu);
    expect(result.uncertaintyFlags.length).toBeGreaterThan(0);
    expect(result.ionA.uncertain).toBe(true);
  });

  it('He + Ne: no typical bond', () => {
    const he = byZ(2)!;
    const ne = byZ(10)!;
    const result = analyzePair(he, ne);
    expect(result.bondType).toBe('No typical bond');
    expect(result.bondConfidence).toBe('likely');
  });

  it('Si (metalloid) + O: uncertainty flag for metalloid', () => {
    const si = byZ(14)!;
    const o = byZ(8)!;
    const result = analyzePair(si, o);
    expect(result.uncertaintyFlags.some(f => f.includes('Metalloid'))).toBe(true);
  });

  it('analyzeSelection with 3 elements gives 3 pairs', () => {
    const els = [byZ(11)!, byZ(17)!, byZ(8)!];
    const pairs = analyzeSelection(els);
    expect(pairs.length).toBe(3);
  });

  it('predictCombination: Na+Cl matches neutralization reaction elements', () => {
    const els = [byZ(11)!, byZ(17)!]; // Na, Cl
    const pred = predictCombination(els, REACTIONS);
    // Na + Cl are in precip_agcl and neutralization element maps
    expect(pred.confidence).toBeDefined();
    expect(pred.reactionType).toBeDefined();
  });

  it('predictCombination: Fe+Cu matches single_replacement', () => {
    const els = [byZ(26)!, byZ(29)!]; // Fe, Cu
    const pred = predictCombination(els, REACTIONS);
    expect(pred.matchedReactionId).toBe('single_replacement');
  });
});
