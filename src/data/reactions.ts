export interface Reactant {
  name: string;
  display: string;
  coeff: number;
  mode: 'solution' | 'moles';
}

export interface Visuals {
  kind: 'heat' | 'precip' | 'gas' | 'color';
  message: string;
  heat?: string;
  precipColor?: string;
  colorShift?: string;
}

export interface Reaction {
  id: string;
  label: string;
  type: string;
  A: Reactant;
  B: Reactant;
  products: string[];
  prodCoeffs: Record<string, number>;
  balanced: string;
  visuals: Visuals;
  notes: string;
}

export const REACTIONS: Reaction[] = [
  {
    id: "neutralization",
    label: "HCl(aq) + NaOH(aq)  →  NaCl(aq) + H₂O(l)",
    type: "Acid-base neutralization",
    A: { name: "HCl", display: "Hydrochloric acid (HCl)", coeff: 1, mode: 'solution' },
    B: { name: "NaOH", display: "Sodium hydroxide (NaOH)", coeff: 1, mode: 'solution' },
    products: ["NaCl(aq)", "H₂O(l)"],
    prodCoeffs: { "NaCl(aq)": 1, "H₂O(l)": 1 },
    balanced: "1 HCl(aq) + 1 NaOH(aq) → 1 NaCl(aq) + 1 H₂O(l)",
    visuals: { kind: "heat", message: "Temperature rises (typical for strong acid + strong base).", heat: "exo" },
    notes: "Driving idea: proton transfer. H⁺ combines with OH⁻ to make water, and spectator ions remain in solution."
  },
  {
    id: "precip_agcl",
    label: "AgNO₃(aq) + NaCl(aq)  →  AgCl(s) + NaNO₃(aq)",
    type: "Precipitation (double replacement)",
    A: { name: "AgNO3", display: "Silver nitrate (AgNO₃)", coeff: 1, mode: 'solution' },
    B: { name: "NaCl", display: "Sodium chloride (NaCl)", coeff: 1, mode: 'solution' },
    products: ["AgCl(s)", "NaNO₃(aq)"],
    prodCoeffs: { "AgCl(s)": 1, "NaNO₃(aq)": 1 },
    balanced: "1 AgNO₃(aq) + 1 NaCl(aq) → 1 AgCl(s) + 1 NaNO₃(aq)",
    visuals: { kind: "precip", message: "White precipitate forms (AgCl).", precipColor: "white" },
    notes: "The solid forms because Ag⁺ and Cl⁻ build a low-solubility lattice. Many chlorides dissolve, but AgCl is a common insoluble exception."
  },
  {
    id: "gas_co2",
    label: "HCl(aq) + NaHCO₃(aq)  →  CO₂(g) + H₂O(l) + NaCl(aq)",
    type: "Gas formation (acid + bicarbonate)",
    A: { name: "HCl", display: "Hydrochloric acid (HCl)", coeff: 1, mode: 'solution' },
    B: { name: "NaHCO3", display: "Sodium bicarbonate (NaHCO₃)", coeff: 1, mode: 'solution' },
    products: ["CO₂(g)", "H₂O(l)", "NaCl(aq)"],
    prodCoeffs: { "CO₂(g)": 1, "H₂O(l)": 1, "NaCl(aq)": 1 },
    balanced: "1 HCl(aq) + 1 NaHCO₃(aq) → 1 CO₂(g) + 1 H₂O(l) + 1 NaCl(aq)",
    visuals: { kind: "gas", message: "Gas bubbles form (CO₂)." },
    notes: "CO₂ escapes as a gas, which pulls the reaction forward. The acid supplies H⁺; bicarbonate supplies CO₃/HCO₃ chemistry."
  },
  {
    id: "precip_cuoh2",
    label: "CuSO₄(aq) + 2 NaOH(aq)  →  Cu(OH)₂(s) + Na₂SO₄(aq)",
    type: "Precipitation (metal hydroxide)",
    A: { name: "CuSO4", display: "Copper(II) sulfate (CuSO₄)", coeff: 1, mode: 'solution' },
    B: { name: "NaOH", display: "Sodium hydroxide (NaOH)", coeff: 2, mode: 'solution' },
    products: ["Cu(OH)₂(s)", "Na₂SO₄(aq)"],
    prodCoeffs: { "Cu(OH)₂(s)": 1, "Na₂SO₄(aq)": 1 },
    balanced: "1 CuSO₄(aq) + 2 NaOH(aq) → 1 Cu(OH)₂(s) + 1 Na₂SO₄(aq)",
    visuals: { kind: "precip", message: "Blue precipitate forms (Cu(OH)₂).", precipColor: "blue" },
    notes: "Many metal hydroxides are poorly soluble. When Cu²⁺ meets enough OH⁻, the solid forms."
  },
  {
    id: "single_replacement",
    label: "Fe + CuSO₄(aq)  →  FeSO₄(aq) + Cu",
    type: "Single replacement (redox, simplified)",
    A: { name: "Fe", display: "Iron (Fe)", coeff: 1, mode: 'moles' },
    B: { name: "CuSO4", display: "Copper(II) sulfate (CuSO₄)", coeff: 1, mode: 'solution' },
    products: ["FeSO₄(aq)", "Cu"],
    prodCoeffs: { "FeSO₄(aq)": 1, "Cu": 1 },
    balanced: "1 Fe + 1 CuSO₄(aq) → 1 FeSO₄(aq) + 1 Cu",
    visuals: { kind: "color", message: "Copper deposits; blue solution fades toward green.", colorShift: "blueToGreen" },
    notes: "Conceptually, Fe can donate electrons to Cu²⁺. This version is presented as a stoichiometry-and-classification exercise."
  }
];
