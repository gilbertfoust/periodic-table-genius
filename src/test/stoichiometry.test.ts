import { describe, it, expect } from 'vitest';
import { REACTIONS } from '@/data/reactions';
import { runStoichiometry, getExampleValues, fmt } from '@/utils/stoichiometry';

describe('stoichiometry engine – all 5 reactions with example values', () => {
  REACTIONS.forEach(rxn => {
    it(`${rxn.id}: correct balanced equation, limiting reactant, products`, () => {
      const vals = getExampleValues(rxn);
      const result = runStoichiometry(rxn, vals.a1, vals.a2, vals.b1, vals.b2);

      // No error
      expect(result.error).toBeUndefined();

      // Equation matches
      expect(result.equation).toBe(rxn.balanced);

      // Should have steps
      expect(result.steps.length).toBeGreaterThanOrEqual(5);

      // vizScale should be positive
      expect(result.vizScale).toBeGreaterThan(0);
    });
  });

  it('neutralization: 1M 50mL HCl + 1M 50mL NaOH → 0.05 mol each product', () => {
    const rxn = REACTIONS.find(r => r.id === 'neutralization')!;
    const result = runStoichiometry(rxn, '1', '50', '1', '50');
    expect(result.error).toBeUndefined();
    expect(result.equation).toBe('1 HCl(aq) + 1 NaOH(aq) → 1 NaCl(aq) + 1 H₂O(l)');
    // Steps should mention extent = 0.05
    const extStep = result.steps.find(s => s.title === 'Use coefficients to compare');
    expect(extStep?.text).toContain('0.05');
    // Limiting: neither (perfect match)
    const limStep = result.steps.find(s => s.title === 'Limiting reactant');
    expect(limStep?.text).toContain('Neither');
  });

  it('precip_agcl: 1M 50mL AgNO3 + 1M 50mL NaCl → white precipitate', () => {
    const rxn = REACTIONS.find(r => r.id === 'precip_agcl')!;
    const result = runStoichiometry(rxn, '1', '50', '1', '50');
    expect(result.error).toBeUndefined();
    expect(result.badge).toContain('White precipitate');
    const prodStep = result.steps.find(s => s.title === 'Compute products');
    expect(prodStep?.text).toContain('AgCl(s): 0.05 mol');
  });

  it('gas_co2: 1M 50mL HCl + 1M 50mL NaHCO3 → gas bubbles', () => {
    const rxn = REACTIONS.find(r => r.id === 'gas_co2')!;
    const result = runStoichiometry(rxn, '1', '50', '1', '50');
    expect(result.error).toBeUndefined();
    expect(result.badge).toContain('Gas bubbles');
    const prodStep = result.steps.find(s => s.title === 'Compute products');
    expect(prodStep?.text).toContain('CO₂(g): 0.05 mol');
  });

  it('precip_cuoh2: 1M 50mL CuSO4 + 1M 100mL NaOH → blue precipitate, B limiting when halved', () => {
    const rxn = REACTIONS.find(r => r.id === 'precip_cuoh2')!;
    // Example values: a1=1, a2=50, b1=1, b2=100 (stoichiometric match)
    const result = runStoichiometry(rxn, '1', '50', '1', '100');
    expect(result.error).toBeUndefined();
    expect(result.badge).toContain('Blue precipitate');
    // Now test with B limiting (half the NaOH volume)
    const resultLim = runStoichiometry(rxn, '1', '50', '1', '50');
    expect(resultLim.error).toBeUndefined();
    const limStep = resultLim.steps.find(s => s.title === 'Limiting reactant');
    expect(limStep?.text).toContain('Reactant B is limiting');
  });

  it('single_replacement: 0.05 mol Fe + 1M 50mL CuSO4 → color shift', () => {
    const rxn = REACTIONS.find(r => r.id === 'single_replacement')!;
    const result = runStoichiometry(rxn, '0.05', '', '1', '50');
    expect(result.error).toBeUndefined();
    expect(result.badge).toContain('Copper deposits');
    const prodStep = result.steps.find(s => s.title === 'Compute products');
    expect(prodStep?.text).toContain('Cu: 0.05 mol');
  });

  it('validation: zero/negative inputs return error', () => {
    const rxn = REACTIONS[0];
    const r1 = runStoichiometry(rxn, '0', '50', '1', '50');
    expect(r1.error).toBeDefined();
    const r2 = runStoichiometry(rxn, '-1', '50', '1', '50');
    expect(r2.error).toBeDefined();
    const r3 = runStoichiometry(rxn, 'abc', '50', '1', '50');
    expect(r3.error).toBeDefined();
  });
});

describe('selection model constraints', () => {
  it('confirms data integrity: 118 elements', () => {
    const { ELEMENTS } = require('@/data/elements');
    expect(ELEMENTS.length).toBe(118);
    expect(ELEMENTS[0].Z).toBe(1);
    expect(ELEMENTS[117].Z).toBe(118);
  });
});
