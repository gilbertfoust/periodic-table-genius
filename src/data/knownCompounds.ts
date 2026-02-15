import type { SynthesisClassification } from '@/utils/synthesisEngine';

export interface RelatedCompound {
  key: string;
  formula: string;
  name: string;
  note: string;
}

export interface CompoundVisual {
  state: 'solid' | 'liquid' | 'gas' | 'aqueous';
  color: string;
  opacity: number;
  texture: 'crystalline' | 'powder' | 'liquid' | 'gas' | 'gel' | 'metallic';
  effects?: ('bubbles' | 'shimmer' | 'vapor' | 'glow' | 'sparkle' | 'settling')[];
  label: string;
}

export interface KnownCompound {
  key: string;
  formula: string;
  name: string;
  aliases: string[];
  classification: SynthesisClassification;
  description: string;
  didYouKnow: string;
  related: RelatedCompound[];
  visual: CompoundVisual;
}

export const KNOWN_COMPOUNDS: Record<string, KnownCompound> = {
  // ── Water & relatives ──────────────────────────────
  '1:2,8:1': {
    key: '1:2,8:1', formula: 'H₂O', name: 'Water', aliases: ['Dihydrogen Monoxide'],
    classification: 'covalent',
    description: 'A polar covalent molecule — the most essential compound for life on Earth.',
    didYouKnow: 'Water is one of the few substances that expands when it freezes, which is why ice floats.',
    related: [{ key: '1:2,8:2', formula: 'H₂O₂', name: 'Hydrogen Peroxide', note: 'Add one more oxygen and you get hydrogen peroxide — a powerful oxidizer. That single extra O makes it unstable and reactive!' }],
    visual: { state: 'liquid', color: 'rgba(180,220,255,0.15)', opacity: 0.15, texture: 'liquid', effects: ['shimmer'], label: 'Clear liquid' },
  },
  '1:2,8:2': {
    key: '1:2,8:2', formula: 'H₂O₂', name: 'Hydrogen Peroxide', aliases: [],
    classification: 'covalent',
    description: 'A polar covalent molecule used as a disinfectant and bleaching agent.',
    didYouKnow: 'Bombardier beetles mix hydrogen peroxide with enzymes to create a boiling chemical spray for defense!',
    related: [{ key: '1:2,8:1', formula: 'H₂O', name: 'Water', note: 'Remove one oxygen and you get plain water — stable, safe, and essential for life.' }],
    visual: { state: 'liquid', color: 'rgba(200,225,255,0.18)', opacity: 0.18, texture: 'liquid', effects: ['shimmer', 'bubbles'], label: 'Clear liquid with faint fizz' },
  },

  // ── Common salts ───────────────────────────────────
  '11:1,17:1': {
    key: '11:1,17:1', formula: 'NaCl', name: 'Table Salt', aliases: ['Sodium Chloride', 'Halite'],
    classification: 'ionic',
    description: 'An ionic compound — sodium transfers an electron to chlorine, forming a crystal lattice.',
    didYouKnow: 'The Roman word for salary comes from "salarium" — soldiers were sometimes paid in salt!',
    related: [{ key: '11:2,8:1', formula: 'Na₂O', name: 'Sodium Oxide', note: 'Replace chlorine with oxygen and you get sodium oxide — a reactive white solid.' }],
    visual: { state: 'solid', color: 'rgba(245,245,250,0.92)', opacity: 0.92, texture: 'crystalline', effects: ['sparkle'], label: 'White crystalline solid' },
  },
  '19:1,17:1': {
    key: '19:1,17:1', formula: 'KCl', name: 'Potassium Chloride', aliases: ['Sylvite'],
    classification: 'ionic',
    description: 'An ionic salt used as a salt substitute and fertilizer.',
    didYouKnow: 'KCl is used in lethal injection protocols, but in small amounts it\'s just a dietary supplement.',
    related: [{ key: '11:1,17:1', formula: 'NaCl', name: 'Table Salt', note: 'Swap potassium for sodium and you get ordinary table salt.' }],
    visual: { state: 'solid', color: 'rgba(240,240,245,0.88)', opacity: 0.88, texture: 'crystalline', effects: ['sparkle'], label: 'White crystalline solid' },
  },

  // ── Carbon compounds ───────────────────────────────
  '6:1,8:2': {
    key: '6:1,8:2', formula: 'CO₂', name: 'Carbon Dioxide', aliases: ['Carbonic Acid Gas'],
    classification: 'covalent',
    description: 'A nonpolar covalent gas — you exhale it with every breath.',
    didYouKnow: 'Dry ice is solid CO₂. It sublimes directly from solid to gas at -78.5°C — no liquid phase at normal pressure!',
    related: [{ key: '6:1,8:1', formula: 'CO', name: 'Carbon Monoxide', note: 'Remove one oxygen and you get carbon monoxide — a colorless, odorless, deadly poison. That missing O changes everything.' }],
    visual: { state: 'gas', color: 'rgba(200,200,200,0.1)', opacity: 0.1, texture: 'gas', effects: ['bubbles'], label: 'Colorless gas' },
  },
  '6:1,8:1': {
    key: '6:1,8:1', formula: 'CO', name: 'Carbon Monoxide', aliases: [],
    classification: 'covalent',
    description: 'A polar covalent gas — toxic because it binds to hemoglobin 200× stronger than oxygen.',
    didYouKnow: 'CO detectors save thousands of lives each year. This invisible gas is produced by incomplete combustion.',
    related: [{ key: '6:1,8:2', formula: 'CO₂', name: 'Carbon Dioxide', note: 'Add one more oxygen and you get carbon dioxide — harmless at normal levels and essential for plants.' }],
    visual: { state: 'gas', color: 'rgba(180,180,190,0.08)', opacity: 0.08, texture: 'gas', effects: ['vapor'], label: 'Colorless, odorless gas' },
  },
  '1:4,6:1': {
    key: '1:4,6:1', formula: 'CH₄', name: 'Methane', aliases: ['Natural Gas'],
    classification: 'covalent',
    description: 'A nonpolar covalent gas — the simplest hydrocarbon and main component of natural gas.',
    didYouKnow: 'Cows produce about 70-120 kg of methane per year through digestion. It\'s a potent greenhouse gas!',
    related: [{ key: '1:6,6:2', formula: 'C₂H₆', name: 'Ethane', note: 'Double the carbons and hydrogens and you start building longer hydrocarbon chains.' }],
    visual: { state: 'gas', color: 'rgba(200,210,200,0.08)', opacity: 0.08, texture: 'gas', effects: ['vapor'], label: 'Colorless flammable gas' },
  },
  '1:6,6:2': {
    key: '1:6,6:2', formula: 'C₂H₆', name: 'Ethane', aliases: [],
    classification: 'covalent',
    description: 'A nonpolar covalent gas — the second simplest hydrocarbon.',
    didYouKnow: 'Ethane was detected in the atmosphere of Titan, Saturn\'s largest moon!',
    related: [{ key: '1:4,6:1', formula: 'CH₄', name: 'Methane', note: 'Cut it in half and you get methane — the simplest hydrocarbon.' }],
    visual: { state: 'gas', color: 'rgba(200,210,200,0.06)', opacity: 0.06, texture: 'gas', effects: ['vapor'], label: 'Colorless gas' },
  },

  // ── Acids ──────────────────────────────────────────
  '1:1,17:1': {
    key: '1:1,17:1', formula: 'HCl', name: 'Hydrochloric Acid', aliases: ['Muriatic Acid'],
    classification: 'covalent',
    description: 'A polar covalent molecule that becomes a strong acid when dissolved in water.',
    didYouKnow: 'Your stomach produces HCl at a pH of 1.5-3.5 to digest food. The stomach lining must constantly regenerate to survive it!',
    related: [{ key: '11:1,17:1', formula: 'NaCl', name: 'Table Salt', note: 'Add sodium instead of hydrogen and you get table salt — from acid to seasoning!' }],
    visual: { state: 'liquid', color: 'rgba(200,230,200,0.12)', opacity: 0.12, texture: 'liquid', effects: ['shimmer', 'vapor'], label: 'Colorless fuming liquid' },
  },
  '1:1,9:1': {
    key: '1:1,9:1', formula: 'HF', name: 'Hydrofluoric Acid', aliases: [],
    classification: 'covalent',
    description: 'A polar covalent molecule — a weak acid but extremely corrosive and dangerous.',
    didYouKnow: 'HF can dissolve glass! It\'s used to etch patterns onto glass and silicon wafers for computer chips.',
    related: [{ key: '1:1,17:1', formula: 'HCl', name: 'Hydrochloric Acid', note: 'Swap fluorine for chlorine and you get hydrochloric acid — a stronger acid but less corrosive to glass.' }],
    visual: { state: 'liquid', color: 'rgba(210,230,210,0.1)', opacity: 0.1, texture: 'liquid', effects: ['vapor'], label: 'Colorless corrosive liquid' },
  },
  '1:2,16:1,8:4': {
    key: '1:2,16:1,8:4', formula: 'H₂SO₄', name: 'Sulfuric Acid', aliases: ['Oil of Vitriol'],
    classification: 'covalent',
    description: 'One of the most important industrial chemicals — a strong, corrosive acid.',
    didYouKnow: 'More sulfuric acid is produced worldwide than any other chemical. It\'s used in fertilizers, batteries, and oil refining.',
    related: [],
    visual: { state: 'liquid', color: 'rgba(220,220,200,0.2)', opacity: 0.2, texture: 'liquid', effects: ['shimmer'], label: 'Oily, colorless liquid' },
  },

  // ── Nitrogen compounds ─────────────────────────────
  '1:3,7:1': {
    key: '1:3,7:1', formula: 'NH₃', name: 'Ammonia', aliases: [],
    classification: 'covalent',
    description: 'A polar covalent gas with a pungent smell — key ingredient in fertilizers.',
    didYouKnow: 'The Haber process for making ammonia from nitrogen and hydrogen is considered one of the most important inventions of the 20th century — it feeds nearly half the world\'s population.',
    related: [],
    visual: { state: 'gas', color: 'rgba(200,210,230,0.1)', opacity: 0.1, texture: 'gas', effects: ['vapor'], label: 'Colorless pungent gas' },
  },
  '7:1,8:1': {
    key: '7:1,8:1', formula: 'NO', name: 'Nitric Oxide', aliases: [],
    classification: 'covalent',
    description: 'A colorless gas that acts as a signaling molecule in the human body.',
    didYouKnow: 'Nitric oxide was named "Molecule of the Year" in 1992. It helps blood vessels relax and lowers blood pressure!',
    related: [{ key: '7:1,8:2', formula: 'NO₂', name: 'Nitrogen Dioxide', note: 'Add one more oxygen and you get nitrogen dioxide — a toxic brown gas and major air pollutant.' }],
    visual: { state: 'gas', color: 'rgba(190,200,210,0.08)', opacity: 0.08, texture: 'gas', effects: ['vapor'], label: 'Colorless gas' },
  },
  '7:1,8:2': {
    key: '7:1,8:2', formula: 'NO₂', name: 'Nitrogen Dioxide', aliases: [],
    classification: 'covalent',
    description: 'A toxic reddish-brown gas — a major component of smog and acid rain.',
    didYouKnow: 'NO₂ gives smog its characteristic brownish haze. It forms when car exhaust meets sunlight.',
    related: [{ key: '7:1,8:1', formula: 'NO', name: 'Nitric Oxide', note: 'Remove one oxygen and you get nitric oxide — actually beneficial in small amounts as a signaling molecule.' }],
    visual: { state: 'gas', color: 'rgba(160,80,40,0.35)', opacity: 0.35, texture: 'gas', effects: ['vapor'], label: 'Reddish-brown toxic gas' },
  },

  // ── Metal oxides ───────────────────────────────────
  '8:1,12:1': {
    key: '8:1,12:1', formula: 'MgO', name: 'Magnesium Oxide', aliases: ['Magnesia'],
    classification: 'ionic',
    description: 'An ionic compound — white powder used in antacids and fireproofing.',
    didYouKnow: 'When magnesium burns in air, it produces an intensely bright white light — so bright it can cause temporary blindness!',
    related: [{ key: '12:1,17:2', formula: 'MgCl₂', name: 'Magnesium Chloride', note: 'Replace oxygen with two chlorines and you get magnesium chloride — used to de-ice roads.' }],
    visual: { state: 'solid', color: 'rgba(240,240,245,0.9)', opacity: 0.9, texture: 'powder', effects: ['settling'], label: 'White powder' },
  },
  '12:1,17:2': {
    key: '12:1,17:2', formula: 'MgCl₂', name: 'Magnesium Chloride', aliases: [],
    classification: 'ionic',
    description: 'An ionic compound used for de-icing and as a tofu coagulant.',
    didYouKnow: 'Magnesium chloride is extracted from seawater. It\'s what makes seawater taste bitter!',
    related: [{ key: '8:1,12:1', formula: 'MgO', name: 'Magnesium Oxide', note: 'Replace the two chlorines with one oxygen and you get magnesium oxide — the ratio changes because oxygen takes 2 electrons.' }],
    visual: { state: 'solid', color: 'rgba(235,235,240,0.85)', opacity: 0.85, texture: 'crystalline', effects: ['sparkle'], label: 'White crystalline flakes' },
  },
  '11:2,8:1': {
    key: '11:2,8:1', formula: 'Na₂O', name: 'Sodium Oxide', aliases: [],
    classification: 'ionic',
    description: 'An ionic compound — reacts vigorously with water to form sodium hydroxide.',
    didYouKnow: 'Na₂O is a key component in glass-making. Most glass contains 10-15% sodium oxide!',
    related: [{ key: '11:1,17:1', formula: 'NaCl', name: 'Table Salt', note: 'Swap oxygen for chlorine (and use one Na instead of two) to get table salt.' }],
    visual: { state: 'solid', color: 'rgba(240,240,230,0.88)', opacity: 0.88, texture: 'powder', effects: ['settling'], label: 'White powder' },
  },
  '8:1,20:1': {
    key: '8:1,20:1', formula: 'CaO', name: 'Calcium Oxide', aliases: ['Quicklime'],
    classification: 'ionic',
    description: 'An ionic compound that reacts violently with water, releasing intense heat.',
    didYouKnow: 'Before electric lights, theaters used limelight — burning calcium oxide to produce a brilliant white spotlight. That\'s where "in the limelight" comes from!',
    related: [{ key: '6:1,8:3,20:1', formula: 'CaCO₃', name: 'Calcium Carbonate', note: 'Add carbon and two more oxygens to get calcium carbonate — chalk, marble, and seashells.' }],
    visual: { state: 'solid', color: 'rgba(245,245,240,0.9)', opacity: 0.9, texture: 'powder', effects: ['glow', 'settling'], label: 'White powder (exothermic)' },
  },
  '8:3,13:2': {
    key: '8:3,13:2', formula: 'Al₂O₃', name: 'Aluminum Oxide', aliases: ['Alumina', 'Corundum'],
    classification: 'ionic',
    description: 'An extremely hard ionic compound — rubies and sapphires are Al₂O₃ with trace impurities.',
    didYouKnow: 'Rubies are red Al₂O₃ (chromium impurity) and sapphires are blue Al₂O₃ (iron/titanium impurity). Same compound, different colors!',
    related: [],
    visual: { state: 'solid', color: 'rgba(235,235,240,0.9)', opacity: 0.9, texture: 'crystalline', effects: ['sparkle'], label: 'Hard white crystalline solid' },
  },
  '8:3,26:2': {
    key: '8:3,26:2', formula: 'Fe₂O₃', name: 'Iron(III) Oxide', aliases: ['Rust', 'Hematite'],
    classification: 'ionic',
    description: 'The reddish-brown compound known as rust — forms when iron is exposed to oxygen and moisture.',
    didYouKnow: 'Mars is called the Red Planet because its surface is covered in iron(III) oxide — it\'s literally a rusty planet!',
    related: [{ key: '8:1,26:1', formula: 'FeO', name: 'Iron(II) Oxide', note: 'Use less oxygen and you get iron(II) oxide — a black powder with different properties due to iron\'s lower charge.' }],
    visual: { state: 'solid', color: 'rgba(180,60,30,0.88)', opacity: 0.88, texture: 'powder', effects: ['settling'], label: 'Reddish-brown powder' },
  },
  '8:1,26:1': {
    key: '8:1,26:1', formula: 'FeO', name: 'Iron(II) Oxide', aliases: ['Wüstite'],
    classification: 'ionic',
    description: 'A black ionic compound where iron has a +2 charge instead of +3.',
    didYouKnow: 'FeO is less stable than Fe₂O₃ and tends to convert to rust over time when exposed to air.',
    related: [{ key: '8:3,26:2', formula: 'Fe₂O₃', name: 'Iron(III) Oxide', note: 'Add more oxygen and iron and you get rust (Fe₂O₃) — the more common and stable iron oxide.' }],
    visual: { state: 'solid', color: 'rgba(30,30,35,0.92)', opacity: 0.92, texture: 'powder', effects: ['settling'], label: 'Black powder' },
  },

  // ── Calcium Carbonate ──────────────────────────────
  '6:1,8:3,20:1': {
    key: '6:1,8:3,20:1', formula: 'CaCO₃', name: 'Calcium Carbonate', aliases: ['Chalk', 'Limestone', 'Marble'],
    classification: 'ionic',
    description: 'Found in chalk, limestone, marble, seashells, and coral reefs.',
    didYouKnow: 'The White Cliffs of Dover are made almost entirely of calcium carbonate from ancient sea creatures!',
    related: [{ key: '8:1,20:1', formula: 'CaO', name: 'Calcium Oxide', note: 'Heat calcium carbonate and it decomposes into quicklime (CaO) and CO₂ gas.' }],
    visual: { state: 'solid', color: 'rgba(245,243,235,0.92)', opacity: 0.92, texture: 'powder', effects: ['settling'], label: 'White chalky powder' },
  },

  // ── Sodium Hydroxide ───────────────────────────────
  '1:1,8:1,11:1': {
    key: '1:1,8:1,11:1', formula: 'NaOH', name: 'Sodium Hydroxide', aliases: ['Lye', 'Caustic Soda'],
    classification: 'ionic',
    description: 'A strong base used in soap-making, drain cleaners, and food processing.',
    didYouKnow: 'Traditional pretzels get their distinctive brown crust from being dipped in a NaOH solution before baking!',
    related: [{ key: '11:1,17:1', formula: 'NaCl', name: 'Table Salt', note: 'NaOH + HCl → NaCl + H₂O. Neutralize lye with hydrochloric acid and you get table salt and water!' }],
    visual: { state: 'solid', color: 'rgba(245,245,250,0.9)', opacity: 0.9, texture: 'crystalline', effects: ['glow'], label: 'White deliquescent pellets' },
  },

  // ── Silicon Dioxide ────────────────────────────────
  '8:2,14:1': {
    key: '8:2,14:1', formula: 'SiO₂', name: 'Silicon Dioxide', aliases: ['Silica', 'Quartz', 'Sand'],
    classification: 'covalent',
    description: 'The main component of sand, glass, and quartz crystals — a network covalent solid.',
    didYouKnow: 'Every glass window, smartphone screen, and fiber optic cable starts with SiO₂. It\'s the second most abundant mineral in Earth\'s crust!',
    related: [],
    visual: { state: 'solid', color: 'rgba(220,210,190,0.7)', opacity: 0.7, texture: 'crystalline', effects: ['sparkle'], label: 'Hard glassy / sandy solid' },
  },

  // ── Sodium Bicarbonate ─────────────────────────────
  '1:1,6:1,8:3,11:1': {
    key: '1:1,6:1,8:3,11:1', formula: 'NaHCO₃', name: 'Sodium Bicarbonate', aliases: ['Baking Soda'],
    classification: 'ionic',
    description: 'The compound that makes baked goods rise — releases CO₂ when heated or mixed with acid.',
    didYouKnow: 'Mix baking soda with vinegar and the fizzy reaction produces CO₂ gas — the classic volcano science project!',
    related: [],
    visual: { state: 'solid', color: 'rgba(248,248,250,0.88)', opacity: 0.88, texture: 'powder', effects: ['settling'], label: 'Fine white powder' },
  },

  // ── Calcium Chloride ───────────────────────────────
  '17:2,20:1': {
    key: '17:2,20:1', formula: 'CaCl₂', name: 'Calcium Chloride', aliases: [],
    classification: 'ionic',
    description: 'An ionic salt that absorbs moisture and releases heat when dissolved — used for de-icing.',
    didYouKnow: 'CaCl₂ generates heat when dissolved in water (exothermic). It can melt ice even at -25°C!',
    related: [],
    visual: { state: 'solid', color: 'rgba(240,240,245,0.85)', opacity: 0.85, texture: 'crystalline', effects: ['glow'], label: 'White granular solid' },
  },

  // ── Phosphoric compounds ───────────────────────────
  '1:3,8:4,15:1': {
    key: '1:3,8:4,15:1', formula: 'H₃PO₄', name: 'Phosphoric Acid', aliases: [],
    classification: 'covalent',
    description: 'A weak acid used to give cola drinks their tangy flavor and in rust removal.',
    didYouKnow: 'Coca-Cola contains phosphoric acid — it\'s what gives it that sharp, tangy taste!',
    related: [],
    visual: { state: 'liquid', color: 'rgba(220,220,210,0.18)', opacity: 0.18, texture: 'liquid', effects: ['shimmer'], label: 'Viscous colorless liquid' },
  },

  // ── Simple metal compounds ─────────────────────────
  '17:1,20:1': {
    key: '17:1,20:1', formula: 'CaCl', name: 'Calcium Monochloride', aliases: [],
    classification: 'ionic',
    description: 'An unstable intermediate — calcium typically needs two chlorines to balance its +2 charge.',
    didYouKnow: 'This combination is unstable because Ca²⁺ needs two Cl⁻ ions to balance. Try adding another chlorine!',
    related: [{ key: '17:2,20:1', formula: 'CaCl₂', name: 'Calcium Chloride', note: 'Add one more chlorine to get stable calcium chloride (CaCl₂) — the charge-balanced form.' }],
    visual: { state: 'solid', color: 'rgba(220,220,225,0.6)', opacity: 0.6, texture: 'powder', effects: ['settling'], label: 'Unstable white solid' },
  },

  // ── Copper compounds ───────────────────────────────
  '8:1,29:1': {
    key: '8:1,29:1', formula: 'CuO', name: 'Copper(II) Oxide', aliases: ['Cupric Oxide'],
    classification: 'ionic',
    description: 'A black ionic compound used in ceramics and as a pigment.',
    didYouKnow: 'When the Statue of Liberty turned green, it was copper reacting with air to form a patina that includes CuO!',
    related: [],
    visual: { state: 'solid', color: 'rgba(20,20,25,0.95)', opacity: 0.95, texture: 'powder', effects: ['settling'], label: 'Black powder' },
  },
  '8:1,29:2': {
    key: '8:1,29:2', formula: 'Cu₂O', name: 'Copper(I) Oxide', aliases: ['Cuprous Oxide'],
    classification: 'ionic',
    description: 'A red ionic compound — copper with a +1 charge instead of +2.',
    didYouKnow: 'Cu₂O was used in early semiconductor rectifiers before silicon took over!',
    related: [{ key: '8:1,29:1', formula: 'CuO', name: 'Copper(II) Oxide', note: 'Use one copper instead of two per oxygen and copper takes a +2 charge — different ratio, different compound, different color (black vs red).' }],
    visual: { state: 'solid', color: 'rgba(180,50,40,0.88)', opacity: 0.88, texture: 'powder', effects: ['settling'], label: 'Red powder' },
  },

  // ── Zinc Oxide ─────────────────────────────────────
  '8:1,30:1': {
    key: '8:1,30:1', formula: 'ZnO', name: 'Zinc Oxide', aliases: [],
    classification: 'ionic',
    description: 'A white powder used in sunscreen, calamine lotion, and rubber production.',
    didYouKnow: 'The white nose cream lifeguards wear is zinc oxide — it physically blocks UV rays!',
    related: [],
    visual: { state: 'solid', color: 'rgba(248,248,250,0.92)', opacity: 0.92, texture: 'powder', effects: ['settling'], label: 'White powder' },
  },

  // ── Lithium compounds ──────────────────────────────
  '3:1,9:1': {
    key: '3:1,9:1', formula: 'LiF', name: 'Lithium Fluoride', aliases: [],
    classification: 'ionic',
    description: 'An ionic compound with a very high melting point — used in specialized optics.',
    didYouKnow: 'LiF is transparent to UV light, so it\'s used to make special lenses and windows for UV instruments!',
    related: [],
    visual: { state: 'solid', color: 'rgba(240,240,248,0.88)', opacity: 0.88, texture: 'crystalline', effects: ['sparkle'], label: 'White crystalline solid' },
  },

  // ── Potassium compounds ────────────────────────────
  '8:1,19:2': {
    key: '8:1,19:2', formula: 'K₂O', name: 'Potassium Oxide', aliases: [],
    classification: 'ionic',
    description: 'A reactive ionic compound used in fertilizers and ceramics.',
    didYouKnow: 'Potassium is essential for plant growth. K₂O content is one of the three numbers on fertilizer bags (N-P-K)!',
    related: [],
    visual: { state: 'solid', color: 'rgba(240,235,210,0.85)', opacity: 0.85, texture: 'powder', effects: ['settling'], label: 'Yellowish-white powder' },
  },
};

export function compoundKey(slots: { Z: number; count: number }[]): string {
  return [...slots]
    .filter(s => s.count > 0)
    .sort((a, b) => a.Z - b.Z)
    .map(s => `${s.Z}:${s.count}`)
    .join(',');
}

export function lookupCompound(slots: { Z: number; count: number }[]): KnownCompound | null {
  const key = compoundKey(slots);
  return KNOWN_COMPOUNDS[key] ?? null;
}
