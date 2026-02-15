import { describe, it, expect } from 'vitest';
import { formatFormula, synthesize, type SlotEntry } from '@/utils/synthesisEngine';
import { analyzePair } from '@/utils/interactionPredictor';
import { byZ } from '@/data/elements';
import { buildTimelineSteps } from '@/components/TutorialCanvas/WhyHowTimeline';

describe('formatFormula – count-aware', () => {
  it('H2O: [{Z:1,count:2},{Z:8,count:1}] => H₂O', () => {
    const slots: SlotEntry[] = [{ Z: 1, count: 2 }, { Z: 8, count: 1 }];
    expect(formatFormula(slots)).toBe('H₂O');
  });

  it('NaCl: [{Z:11,count:1},{Z:17,count:1}] => NaCl', () => {
    const slots: SlotEntry[] = [{ Z: 11, count: 1 }, { Z: 17, count: 1 }];
    expect(formatFormula(slots)).toBe('NaCl');
  });

  it('MgCl2: [{Z:12,count:1},{Z:17,count:2}] => MgCl₂', () => {
    const slots: SlotEntry[] = [{ Z: 12, count: 1 }, { Z: 17, count: 2 }];
    expect(formatFormula(slots)).toBe('MgCl₂');
  });

  it('CO2: [{Z:6,count:1},{Z:8,count:2}] => CO₂', () => {
    const slots: SlotEntry[] = [{ Z: 6, count: 1 }, { Z: 8, count: 2 }];
    expect(formatFormula(slots)).toBe('CO₂');
  });
});

describe('synthesize – preserves counts and classifies correctly', () => {
  it('H2O → covalent molecule', () => {
    const H = byZ(1)!;
    const O = byZ(8)!;
    const pair = analyzePair(H, O);
    const slots: SlotEntry[] = [{ Z: 1, count: 2 }, { Z: 8, count: 1 }];
    const result = synthesize(slots, pair);
    expect(result.formula).toBe('H₂O');
    expect(result.classification).toBe('covalent');
    expect(result.confidence).not.toBe('uncertain');
  });

  it('NaCl → ionic (known compound)', () => {
    const Na = byZ(11)!;
    const Cl = byZ(17)!;
    const pair = analyzePair(Na, Cl);
    const slots: SlotEntry[] = [{ Z: 11, count: 1 }, { Z: 17, count: 1 }];
    const result = synthesize(slots, pair);
    expect(result.formula).toBe('NaCl');
    expect(result.classification).toBe('ionic');
    expect(result.compoundName).toBe('Table Salt');
    expect(result.confidence).toBe('likely');
  });

  it('MgCl2 → ionic (known compound)', () => {
    const Mg = byZ(12)!;
    const Cl = byZ(17)!;
    const pair = analyzePair(Mg, Cl);
    const slots: SlotEntry[] = [{ Z: 12, count: 1 }, { Z: 17, count: 2 }];
    const result = synthesize(slots, pair);
    expect(result.classification).toBe('ionic');
    expect(result.compoundName).toBe('Magnesium Chloride');
  });

  it('FeO → known compound (Iron(II) Oxide)', () => {
    const Fe = byZ(26)!;
    const O = byZ(8)!;
    const pair = analyzePair(Fe, O);
    const slots: SlotEntry[] = [{ Z: 26, count: 1 }, { Z: 8, count: 1 }];
    const result = synthesize(slots, pair);
    expect(result.compoundName).toBe('Iron(II) Oxide');
    expect(result.confidence).toBe('likely');
  });

  it('Unknown combo → falls through to EN-based logic', () => {
    const Li = byZ(3)!;
    const S = byZ(16)!;
    const pair = analyzePair(Li, S);
    const slots: SlotEntry[] = [{ Z: 3, count: 1 }, { Z: 16, count: 1 }];
    const result = synthesize(slots, pair);
    expect(result.compoundName).toBeNull();
  });
});

describe('WhyHow timeline steps – grounded generation', () => {
  it('NaCl → includes Transfer step with ion charges', () => {
    const Na = byZ(11)!;
    const Cl = byZ(17)!;
    const pair = analyzePair(Na, Cl);
    const steps = buildTimelineSteps(pair, null, 'intermediate');
    expect(steps.length).toBeGreaterThanOrEqual(3);
    const labels = steps.map(s => s.label);
    expect(labels).toContain('Transfer');
    const transferStep = steps.find(s => s.label === 'Transfer');
    expect(transferStep?.detail).toContain('+1');
    expect(transferStep?.detail).toContain('-1');
  });

  it('H2O → includes Sharing step', () => {
    const H = byZ(1)!;
    const O = byZ(8)!;
    const pair = analyzePair(H, O);
    const steps = buildTimelineSteps(pair, null, 'beginner');
    const labels = steps.map(s => s.label);
    expect(labels).toContain('Sharing');
  });

  it('Fe+O → includes Assumptions step', () => {
    const Fe = byZ(26)!;
    const O = byZ(8)!;
    const pair = analyzePair(Fe, O);
    const steps = buildTimelineSteps(pair, null, 'advanced');
    const labels = steps.map(s => s.label);
    expect(labels).toContain('⚠ Assumptions');
  });

  it('precip (Ag+Cl) → includes Transfer step', () => {
    const Ag = byZ(47)!;
    const Cl = byZ(17)!;
    const pair = analyzePair(Ag, Cl);
    const steps = buildTimelineSteps(pair, null, 'intermediate');
    // Ag is transition metal → uncertain, should have assumptions
    const labels = steps.map(s => s.label);
    expect(labels).toContain('⚠ Assumptions');
  });
});
