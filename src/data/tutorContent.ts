import type { Element } from './elements';

export function safeGroupLabel(e: Element): string {
  if (e.group === null || e.group === undefined) return 'f-block';
  return String(e.group);
}

export function valenceElectrons(e: Element): number | null {
  if (!e || e.group === null || e.group === undefined) return null;
  const g = e.group;
  if (g === 1) return 1;
  if (g === 2) return 2;
  if (g >= 13 && g <= 18) return g - 10;
  return null;
}

export function typicalIon(e: Element): string | null {
  if (!e || e.group === null || e.group === undefined) return null;
  const g = e.group;
  if (g === 1) return '+1';
  if (g === 2) return '+2';
  if (g === 13) return '+3';
  if (g === 15) return '-3';
  if (g === 16) return '-2';
  if (g === 17) return '-1';
  if (g === 18) return '0';
  return null;
}

function groupProfile(e: Element): { label: string; meaning: string } {
  const g = e.group;
  if (g === 1) return { label: 'Group 1 (alkali metals) + Hydrogen as a special case', meaning: 'Main idea: one valence electron. These elements tend to lose one electron in many reactions, forming +1 ions. Many reactions are driven by electrostatic attraction between cations and anions.' };
  if (g === 2) return { label: 'Group 2 (alkaline earth metals)', meaning: 'Main idea: two valence electrons. These elements often form +2 ions. Their compounds can be ionic, and many hydroxides/oxides are basic.' };
  if (g === 13) return { label: 'Group 13 (boron group)', meaning: 'Main idea: about three valence electrons in the main-group rule. Behavior varies across the group: boron is more covalent, while heavier members are more metallic and can show multiple oxidation states.' };
  if (g === 14) return { label: 'Group 14 (carbon group)', meaning: 'Main idea: about four valence electrons. Bonding ranges from strongly covalent (C, Si) to more metallic behavior in heavier members. Oxidation states can vary.' };
  if (g === 15) return { label: 'Group 15 (pnictogens)', meaning: 'Main idea: about five valence electrons. Many members form covalent bonds, and some can form -3 ions in simple ionic models. Oxidation states can vary widely in practice.' };
  if (g === 16) return { label: 'Group 16 (chalcogens)', meaning: 'Main idea: about six valence electrons. Many members form -2 ions in simple ionic models, or covalent bonds in molecular compounds. Oxygen is unusually electronegative and often forms polar bonds.' };
  if (g === 17) return { label: 'Group 17 (halogens)', meaning: 'Main idea: about seven valence electrons. Many halogens tend to gain one electron in simple ionic models, forming -1 ions. They also form polar covalent bonds depending on partners.' };
  if (g === 18) return { label: 'Group 18 (noble gases)', meaning: 'Main idea: filled valence shells in many cases. They tend to be less reactive under many conditions. Some heavier noble gases form compounds under specific circumstances.' };
  if (g !== null && g !== undefined && g >= 3 && g <= 12) return { label: 'Groups 3-12 (transition metals)', meaning: 'Main idea: d-electrons can participate in bonding. Multiple oxidation states are common, so bonding and reactivity can vary by context.' };
  return { label: 'f-block', meaning: 'Main idea: f-electrons contribute to chemistry. Lanthanides are often +3; actinides include many radioactive elements and show varied oxidation states.' };
}

function categoryProfile(cat: string): string {
  const c = (cat || '').toLowerCase();
  if (c === 'alkali metal') return 'Reactive metals with one valence electron. In many reactions they form +1 ions and make ionic salts with many nonmetals.';
  if (c === 'alkaline earth') return 'Metals that often form +2 ions. Many of their oxides and hydroxides are basic.';
  if (c === 'transition metal') return 'Metals where d-electrons allow multiple oxidation states. This supports varied bonding, colored compounds, and catalytic behavior in some systems.';
  if (c === 'post-transition') return 'p-block metals. Many are softer and more polarizable than transition metals, and oxidation states can vary.';
  if (c === 'metalloid') return 'Boundary behavior: can show both metallic and nonmetallic traits, often important in semiconductors.';
  if (c === 'nonmetal') return 'Often forms covalent bonds. Many nonmetals have higher electronegativity and can attract bonding electrons strongly.';
  if (c === 'halogen') return 'Highly electronegative group 17 nonmetals. Often forms -1 ions in simple ionic models, or polar covalent bonds.';
  if (c === 'noble gas') return 'Filled-shell elements that are often unreactive under many conditions. Heavier members can form compounds in specific cases.';
  if (c === 'lanthanide') return 'f-block metals often associated with +3 ions and magnetic/optical applications.';
  if (c === 'actinide') return 'f-block elements including many radioactive members; oxidation states can vary and chemistry can be complex.';
  return 'A category groups elements with related electron structures, which tends to shape bonding patterns and typical reactions.';
}

function interactionLens(e: Element): string[] {
  const parts: string[] = [];
  const en = typeof e.en === 'number' ? e.en : null;
  parts.push('Chemical interaction is often governed by electrostatic attraction between positive and negative charge, and by how strongly atoms hold or share electrons.');
  if (en !== null) {
    parts.push(`This element has electronegativity ${en}. Higher electronegativity usually means stronger attraction for shared electrons, which can increase bond polarity.`);
  } else {
    parts.push('Electronegativity is not listed here for this element, but you can still reason from category and position (metals often donate electrons; many nonmetals attract them).');
  }
  parts.push('Ionization energy relates to how difficult it is to remove an electron; electron affinity relates to the tendency to gain one. Both are connected to effective nuclear charge and shielding, which vary across the table.');
  parts.push('Polarizability (how easily an electron cloud distorts) tends to increase for larger, heavier atoms. This can influence bond character and intermolecular forces.');
  return parts;
}

export interface PositionStory {
  summary: string;
  predict: string;
  groupLabel: string;
  groupMeaning: string;
  categoryMeaning: string;
  trends: string;
  interactions: string[];
}

export function positionStory(e: Element): PositionStory {
  const g = e.group;
  const p = e.period;
  const shell = p ? `period ${p} suggests the valence shell is n=${p}` : '';
  const groupPart = g ? `group ${g}` : 'the f-block';

  let blockHint = '';
  if (e.category === 'alkali metal') blockHint = 'These are typically reactive metals with one valence electron.';
  else if (e.category === 'alkaline earth') blockHint = 'These often form +2 ions and make basic oxides/hydroxides.';
  else if (e.category === 'halogen') blockHint = 'These often gain one electron in simple ionic models.';
  else if (e.category === 'noble gas') blockHint = 'These often have filled valence shells, so they tend to be less reactive under many conditions.';
  else if (e.category === 'nonmetal') blockHint = 'Nonmetals often form covalent bonds, and many have higher electronegativity.';
  else if (e.category === 'metalloid') blockHint = 'Metalloids sit at the boundary and can show mixed behavior.';
  else if (e.category === 'post-transition') blockHint = 'Many p-block metals show multiple oxidation states and increased polarizability.';
  else if (e.category === 'transition metal') blockHint = 'Transition metals often have multiple oxidation states because d-electrons can participate in bonding.';
  else if (e.category === 'lanthanide') blockHint = 'Lanthanides are often +3 and involve f-electrons; many are used in magnets and optical materials.';
  else if (e.category === 'actinide') blockHint = 'Actinides include many radioactive elements; oxidation states can vary and f-electrons matter.';

  const ve = valenceElectrons(e);
  const ion = typicalIon(e);
  const vePart = ve !== null ? `From the group rule, you would predict about ${ve} valence electron${ve === 1 ? '' : 's'}.` : 'Valence electrons are not read off by a single main-group rule here.';
  const ionPart = ion !== null ? `A common simple ion is ${ion}.` : 'A single "default ion" is not reliable here; context matters.';

  const gp = groupProfile(e);

  return {
    summary: `${e.name} sits in ${groupPart} and ${shell}. ${blockHint}`,
    predict: `${vePart} ${ionPart}`,
    groupLabel: gp.label,
    groupMeaning: gp.meaning,
    categoryMeaning: categoryProfile(e.category),
    trends: 'Across a period, electronegativity and ionization energy often rise, while atomic radius often falls. Down a group, the opposite pattern often appears because additional shells increase size and shielding.',
    interactions: interactionLens(e)
  };
}

export interface QuizQuestion {
  id: string;
  title: string;
  options: string[];
  answer: string;
  explain: string;
}

export function generateQuiz(e: Element): QuizQuestion[] {
  const ve = valenceElectrons(e);
  const ion = typicalIon(e);
  const qs: QuizQuestion[] = [];

  if (ve !== null) {
    qs.push({
      id: 'q_ve',
      title: 'How many valence electrons would you predict from the group rule?',
      options: ['1', '2', '3', '4', '5', '6', '7', '8'],
      answer: String(ve),
      explain: 'Main-group rule: groups 1-2 map to 1-2; groups 13-18 map to 3-8.'
    });
  }

  if (ion !== null) {
    qs.push({
      id: 'q_ion',
      title: 'What is a common simple ion charge to expect first?',
      options: ['-3', '-2', '-1', '0', '+1', '+2', '+3'],
      answer: ion,
      explain: 'This is a first-pass heuristic: group 1 → +1, group 2 → +2, group 17 → -1, group 16 → -2, group 15 → -3, group 18 → 0, group 13 → +3.'
    });
  }

  if (e.group !== null && e.group !== undefined && e.group !== 1) {
    qs.push({
      id: 'q_trend',
      title: 'Across a period (left → right), electronegativity tends to…',
      options: ['increase', 'decrease', 'stay the same'],
      answer: 'increase',
      explain: 'General trend: effective nuclear charge increases across a period, so atoms tend to pull bonding electrons more strongly.'
    });
  }

  return qs;
}

export const TREND_CARDS = [
  { k: 'If you move right in the same period…', v: 'effective nuclear charge tends to increase, while atomic radius tends to decrease. Many elements hold electrons more tightly.' },
  { k: 'If you move down the same group…', v: 'additional shells increase size and shielding; outer electrons can be held less tightly.' },
  { k: 'Bond-type cue', v: 'Large electronegativity difference tends to increase ionic character; similar electronegativity tends to increase covalent character.' },
  { k: 'Charge cue', v: 'Ions attract by electrostatic force; higher charge and smaller size can increase lattice strength in many salts.' },
  { k: 'Polarizability cue', v: 'Larger atoms tend to be more polarizable, which can influence bond character and intermolecular attractions.' },
];
