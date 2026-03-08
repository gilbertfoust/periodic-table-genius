/**
 * Extended element info: discovery, common uses, isotopes, fun facts.
 * Covers a curated subset of all 118 elements — others get graceful fallbacks.
 */
export interface ElementExtended {
  discoveredBy: string;
  discoveryYear: number | string;
  discoveryNote?: string;
  uses: string[];
  isotopes: { mass: number; abundance: string; name?: string }[];
  funFact?: string;
  meltingPoint?: number | null;  // °C
  boilingPoint?: number | null;  // °C
  density?: number | null;       // g/cm³
  ionizationEnergy?: number | null; // kJ/mol (1st)
}

export const ELEMENT_EXTENDED: Record<number, ElementExtended> = {
  1: {
    discoveredBy: 'Henry Cavendish', discoveryYear: 1766,
    uses: ['Rocket fuel', 'Ammonia synthesis', 'Fuel cells', 'Hydrogenation of oils'],
    isotopes: [{ mass: 1.008, abundance: '99.98%', name: 'Protium' }, { mass: 2.014, abundance: '0.02%', name: 'Deuterium' }, { mass: 3.016, abundance: 'trace', name: 'Tritium' }],
    funFact: 'Hydrogen is the most abundant element in the universe, making up ~75% of all baryonic mass.',
    meltingPoint: -259.16, boilingPoint: -252.87, density: 0.00008988, ionizationEnergy: 1312,
  },
  2: {
    discoveredBy: 'Pierre Janssen & Joseph Lockyer', discoveryYear: 1868,
    uses: ['Cryogenics', 'MRI coolant', 'Balloons & airships', 'Leak detection'],
    isotopes: [{ mass: 4.003, abundance: '99.999%' }, { mass: 3.016, abundance: '0.0001%' }],
    funFact: 'Helium was discovered in the Sun\'s spectrum before it was found on Earth.',
    meltingPoint: null, boilingPoint: -268.93, density: 0.0001785, ionizationEnergy: 2372,
  },
  3: {
    discoveredBy: 'Johan August Arfwedson', discoveryYear: 1817,
    uses: ['Lithium-ion batteries', 'Mood-stabilizing medication', 'Ceramics', 'Lubricant greases'],
    isotopes: [{ mass: 7.016, abundance: '92.5%' }, { mass: 6.015, abundance: '7.5%' }],
    funFact: 'Lithium is so light it floats on water.',
    meltingPoint: 180.54, boilingPoint: 1342, density: 0.534, ionizationEnergy: 520,
  },
  6: {
    discoveredBy: 'Known since antiquity', discoveryYear: '~3750 BCE',
    uses: ['Steel production', 'Graphite pencils', 'Carbon fiber composites', 'Diamond cutting tools', 'Activated charcoal'],
    isotopes: [{ mass: 12, abundance: '98.9%', name: '¹²C' }, { mass: 13.003, abundance: '1.1%', name: '¹³C' }, { mass: 14.003, abundance: 'trace', name: '¹⁴C' }],
    funFact: 'Carbon-14 dating can determine the age of organic material up to ~50,000 years old.',
    meltingPoint: 3550, boilingPoint: 4027, density: 2.267, ionizationEnergy: 1087,
  },
  7: {
    discoveredBy: 'Daniel Rutherford', discoveryYear: 1772,
    uses: ['Fertilizers (ammonia/urea)', 'Explosives', 'Food preservation', 'Cryogenics'],
    isotopes: [{ mass: 14.003, abundance: '99.6%' }, { mass: 15.0, abundance: '0.4%' }],
    funFact: 'Nitrogen makes up 78% of Earth\'s atmosphere.',
    meltingPoint: -210, boilingPoint: -195.8, density: 0.001251, ionizationEnergy: 1402,
  },
  8: {
    discoveredBy: 'Carl Wilhelm Scheele & Joseph Priestley', discoveryYear: 1774,
    uses: ['Respiration', 'Steel-making', 'Welding', 'Medical oxygen therapy', 'Water treatment'],
    isotopes: [{ mass: 15.995, abundance: '99.76%' }, { mass: 16.999, abundance: '0.04%' }, { mass: 17.999, abundance: '0.20%' }],
    funFact: 'Liquid oxygen is pale blue and is strongly attracted to magnets.',
    meltingPoint: -218.79, boilingPoint: -182.96, density: 0.001429, ionizationEnergy: 1314,
  },
  11: {
    discoveredBy: 'Humphry Davy', discoveryYear: 1807,
    uses: ['Table salt (NaCl)', 'Street lighting (sodium lamps)', 'De-icing roads', 'Nuclear reactors (coolant)'],
    isotopes: [{ mass: 22.99, abundance: '100%' }],
    funFact: 'Sodium metal reacts violently with water, producing flames.',
    meltingPoint: 97.8, boilingPoint: 883, density: 0.971, ionizationEnergy: 496,
  },
  12: {
    discoveredBy: 'Joseph Black', discoveryYear: 1755,
    uses: ['Alloys (aircraft)', 'Fireworks (bright white)', 'Antacid tablets', 'Chlorophyll molecule'],
    isotopes: [{ mass: 23.985, abundance: '79.0%' }, { mass: 24.986, abundance: '10.0%' }, { mass: 25.983, abundance: '11.0%' }],
    funFact: 'Magnesium is the central atom in chlorophyll, making it essential for photosynthesis.',
    meltingPoint: 650, boilingPoint: 1091, density: 1.738, ionizationEnergy: 738,
  },
  14: {
    discoveredBy: 'Jöns Jacob Berzelius', discoveryYear: 1824,
    uses: ['Semiconductors & microchips', 'Solar cells', 'Glass & ceramics', 'Silicone polymers'],
    isotopes: [{ mass: 27.977, abundance: '92.2%' }, { mass: 28.976, abundance: '4.7%' }, { mass: 29.974, abundance: '3.1%' }],
    funFact: 'Silicon Valley is named after this element due to its use in computer chips.',
    meltingPoint: 1414, boilingPoint: 3265, density: 2.329, ionizationEnergy: 786,
  },
  17: {
    discoveredBy: 'Carl Wilhelm Scheele', discoveryYear: 1774,
    uses: ['Water purification', 'PVC plastic', 'Bleach', 'Disinfectants'],
    isotopes: [{ mass: 34.969, abundance: '75.8%' }, { mass: 36.966, abundance: '24.2%' }],
    funFact: 'Chlorine gas was used as a chemical weapon in World War I.',
    meltingPoint: -101.5, boilingPoint: -34.04, density: 0.003214, ionizationEnergy: 1251,
  },
  26: {
    discoveredBy: 'Known since antiquity', discoveryYear: '~3000 BCE',
    uses: ['Steel & construction', 'Automobiles', 'Hemoglobin (blood)', 'Magnets', 'Cast iron cookware'],
    isotopes: [{ mass: 55.935, abundance: '91.7%' }, { mass: 53.94, abundance: '5.8%' }, { mass: 56.935, abundance: '2.2%' }],
    funFact: 'Earth\'s core is ~85% iron, generating the magnetic field that protects us from solar wind.',
    meltingPoint: 1538, boilingPoint: 2862, density: 7.874, ionizationEnergy: 762,
  },
  29: {
    discoveredBy: 'Known since antiquity', discoveryYear: '~9000 BCE',
    uses: ['Electrical wiring', 'Plumbing', 'Bronze alloy', 'Circuit boards', 'Antimicrobial surfaces'],
    isotopes: [{ mass: 62.93, abundance: '69.2%' }, { mass: 64.928, abundance: '30.8%' }],
    funFact: 'The Statue of Liberty is covered with over 80 tons of copper.',
    meltingPoint: 1085, boilingPoint: 2562, density: 8.96, ionizationEnergy: 745,
  },
  47: {
    discoveredBy: 'Known since antiquity', discoveryYear: '~5000 BCE',
    uses: ['Jewelry & coins', 'Photography', 'Electronics', 'Solar panels', 'Antibacterial'],
    isotopes: [{ mass: 106.905, abundance: '51.8%' }, { mass: 108.905, abundance: '48.2%' }],
    funFact: 'Silver has the highest electrical conductivity of any element.',
    meltingPoint: 961.78, boilingPoint: 2162, density: 10.49, ionizationEnergy: 731,
  },
  79: {
    discoveredBy: 'Known since antiquity', discoveryYear: '~6000 BCE',
    uses: ['Jewelry & currency', 'Electronics (connectors)', 'Dentistry', 'Aerospace', 'Colloidal gold in medicine'],
    isotopes: [{ mass: 196.967, abundance: '100%' }],
    funFact: 'All the gold ever mined would fit in a cube about 21 meters on each side.',
    meltingPoint: 1064.18, boilingPoint: 2856, density: 19.3, ionizationEnergy: 890,
  },
  92: {
    discoveredBy: 'Martin Heinrich Klaproth', discoveryYear: 1789,
    uses: ['Nuclear power', 'Nuclear weapons', 'Armor-piercing ammunition', 'Ship ballast', 'Glass colorant'],
    isotopes: [{ mass: 238.051, abundance: '99.27%', name: '²³⁸U' }, { mass: 235.044, abundance: '0.72%', name: '²³⁵U' }, { mass: 234.041, abundance: '0.005%', name: '²³⁴U' }],
    funFact: 'One kilogram of uranium-235 can produce as much energy as ~1,500 tons of coal.',
    meltingPoint: 1132.3, boilingPoint: 4131, density: 19.05, ionizationEnergy: 598,
  },
  10: {
    discoveredBy: 'William Ramsay & Morris Travers', discoveryYear: 1898,
    uses: ['Neon signs', 'High-voltage indicators', 'Cryogenic refrigerant', 'Laser technology'],
    isotopes: [{ mass: 19.992, abundance: '90.5%' }, { mass: 21.991, abundance: '9.3%' }],
    funFact: 'Neon glows reddish-orange in a vacuum discharge tube — no phosphor coating needed.',
    meltingPoint: -248.59, boilingPoint: -246.08, density: 0.0008999, ionizationEnergy: 2081,
  },
  19: {
    discoveredBy: 'Humphry Davy', discoveryYear: 1807,
    uses: ['Fertilizers', 'Salt substitute (KCl)', 'Soap making', 'Nerve impulse transmission'],
    isotopes: [{ mass: 38.964, abundance: '93.3%' }, { mass: 40.962, abundance: '6.7%' }],
    funFact: 'Potassium is essential for every heartbeat — it regulates the electrical signals in your heart.',
    meltingPoint: 63.5, boilingPoint: 759, density: 0.862, ionizationEnergy: 419,
  },
  20: {
    discoveredBy: 'Humphry Davy', discoveryYear: 1808,
    uses: ['Bones & teeth', 'Cement & concrete', 'Antacids', 'Steel deoxidizer'],
    isotopes: [{ mass: 39.963, abundance: '96.9%' }, { mass: 43.956, abundance: '2.1%' }, { mass: 41.959, abundance: '0.6%' }],
    funFact: 'Calcium is the most abundant metal in the human body.',
    meltingPoint: 842, boilingPoint: 1484, density: 1.55, ionizationEnergy: 590,
  },
  22: {
    discoveredBy: 'William Gregor', discoveryYear: 1791,
    uses: ['Aerospace alloys', 'Medical implants', 'Pigment (TiO₂)', 'Sporting goods'],
    isotopes: [{ mass: 47.948, abundance: '73.7%' }, { mass: 45.953, abundance: '8.3%' }, { mass: 46.952, abundance: '7.3%' }],
    funFact: 'Titanium is as strong as steel but 45% lighter.',
    meltingPoint: 1668, boilingPoint: 3287, density: 4.506, ionizationEnergy: 659,
  },
  30: {
    discoveredBy: 'Andreas Marggraf', discoveryYear: 1746,
    uses: ['Galvanizing steel', 'Brass alloy', 'Zinc supplements', 'Sunscreen (ZnO)'],
    isotopes: [{ mass: 63.929, abundance: '49.2%' }, { mass: 65.926, abundance: '27.7%' }, { mass: 67.925, abundance: '18.4%' }],
    funFact: 'Your body contains about 2–3 grams of zinc, crucial for immune function.',
    meltingPoint: 419.53, boilingPoint: 907, density: 7.134, ionizationEnergy: 906,
  },
  78: {
    discoveredBy: 'Antonio de Ulloa', discoveryYear: 1735,
    uses: ['Catalytic converters', 'Jewelry', 'Lab equipment', 'Cancer drugs (cisplatin)', 'Fuel cells'],
    isotopes: [{ mass: 195.078, abundance: '33.8%' }, { mass: 193.963, abundance: '32.9%' }, { mass: 195.965, abundance: '25.2%' }],
    funFact: 'Platinum is rarer than gold — only ~190 tons are mined per year worldwide.',
    meltingPoint: 1768.3, boilingPoint: 3825, density: 21.45, ionizationEnergy: 870,
  },
  80: {
    discoveredBy: 'Known since antiquity', discoveryYear: '~1500 BCE',
    uses: ['Thermometers (historic)', 'Fluorescent lighting', 'Dental amalgams', 'Gold mining'],
    isotopes: [{ mass: 201.971, abundance: '29.7%' }, { mass: 199.968, abundance: '23.1%' }, { mass: 197.967, abundance: '10.0%' }],
    funFact: 'Mercury is the only metallic element that is liquid at room temperature.',
    meltingPoint: -38.83, boilingPoint: 356.73, density: 13.546, ionizationEnergy: 1007,
  },
  94: {
    discoveredBy: 'Glenn Seaborg et al.', discoveryYear: 1940,
    uses: ['Nuclear weapons', 'Nuclear reactors', 'RTG space power', 'Pacemaker batteries (historic)'],
    isotopes: [{ mass: 244.064, abundance: 'most stable' }, { mass: 239.052, abundance: 'fissile' }],
    funFact: 'Plutonium powers the Voyager probes, still operating after 45+ years in deep space.',
    meltingPoint: 639.4, boilingPoint: 3228, density: 19.816, ionizationEnergy: 585,
  },
};
