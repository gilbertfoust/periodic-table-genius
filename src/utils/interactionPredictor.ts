import type { Element } from '@/data/elements';

export type Confidence = 'likely' | 'plausible' | 'uncertain';

export interface IonTendency {
  element: Element;
  typicalCharge: string | null;
  explanation: string;
  uncertain: boolean;
}

export interface PairAnalysis {
  a: Element;
  b: Element;
  enDelta: number | null;
  enDeltaLabel: string;
  bondType: string;
  bondConfidence: Confidence;
  interactionType: string;
  uncertaintyFlags: string[];
  ionA: IonTendency;
  ionB: IonTendency;
  summary: string;
}

/* ── helpers ─────────────────────────────────────────── */

function ionTendency(e: Element): IonTendency {
  const g = e.group;
  const cat = e.category;

  // Noble gases
  if (cat === 'noble gas') return { element: e, typicalCharge: '0', explanation: 'Noble gas – filled valence shell, rarely ionizes.', uncertain: false };

  // Transition metals – multiple oxidation states
  if (cat === 'transition metal') {
    const common: Record<number, string> = { 26: '+2/+3', 29: '+1/+2', 30: '+2', 47: '+1', 79: '+1/+3', 25: '+2/+4/+7', 24: '+2/+3/+6' };
    const charge = common[e.Z] ?? '+2/+3 (varies)';
    return { element: e, typicalCharge: charge, explanation: 'd-electrons allow multiple oxidation states; context-dependent.', uncertain: true };
  }

  // Lanthanides / actinides
  if (cat === 'lanthanide') return { element: e, typicalCharge: '+3', explanation: 'Lanthanides most commonly form +3 ions.', uncertain: false };
  if (cat === 'actinide') return { element: e, typicalCharge: '+3/+4 (varies)', explanation: 'Actinides show varied oxidation states; +3/+4 are common.', uncertain: true };

  // Metalloids
  if (cat === 'metalloid') return { element: e, typicalCharge: 'variable', explanation: 'Metalloids show mixed metallic/nonmetallic behavior; ion charge depends on partner.', uncertain: true };

  // Main-group rules
  if (g === 1) return { element: e, typicalCharge: '+1', explanation: 'Group 1 – loses one electron to form +1.', uncertain: false };
  if (g === 2) return { element: e, typicalCharge: '+2', explanation: 'Group 2 – loses two electrons to form +2.', uncertain: false };
  if (g === 13 && cat === 'post-transition') return { element: e, typicalCharge: '+3', explanation: 'Group 13 post-transition metal – typically +3.', uncertain: false };
  if (g === 15) return { element: e, typicalCharge: '-3', explanation: 'Group 15 – tends to gain 3 electrons in simple ionic models.', uncertain: false };
  if (g === 16) return { element: e, typicalCharge: '-2', explanation: 'Group 16 – tends to gain 2 electrons.', uncertain: false };
  if (g === 17) return { element: e, typicalCharge: '-1', explanation: 'Group 17 – halogen, gains 1 electron to form -1.', uncertain: false };
  if (g === 18) return { element: e, typicalCharge: '0', explanation: 'Noble gas – typically no ionization.', uncertain: false };
  if (g === 14) return { element: e, typicalCharge: '±4 / covalent', explanation: 'Group 14 – usually shares electrons (covalent); ionic charge varies.', uncertain: true };

  return { element: e, typicalCharge: null, explanation: 'Ion tendency not easily predicted from position alone.', uncertain: true };
}

function classifyBond(enDelta: number | null, a: Element, b: Element): { bondType: string; confidence: Confidence; interactionType: string } {
  const catA = a.category;
  const catB = b.category;

  // Both noble gases
  if (catA === 'noble gas' && catB === 'noble gas') return { bondType: 'No typical bond', confidence: 'likely', interactionType: 'No typical reaction' };
  // One noble gas
  if (catA === 'noble gas' || catB === 'noble gas') return { bondType: 'No typical bond', confidence: 'plausible', interactionType: 'Noble gas involvement – reaction unlikely under standard conditions' };

  // Both metals
  const metals = ['alkali metal', 'alkaline earth', 'transition metal', 'post-transition', 'lanthanide', 'actinide'];
  const aIsMetal = metals.includes(catA);
  const bIsMetal = metals.includes(catB);
  if (aIsMetal && bIsMetal) return { bondType: 'Metallic / alloy', confidence: 'plausible', interactionType: 'Metallic bonding (alloy formation)' };

  if (enDelta === null) return { bondType: 'Unknown (EN data missing)', confidence: 'uncertain', interactionType: 'Cannot determine – electronegativity not available' };

  if (enDelta >= 1.7) return { bondType: 'Ionic', confidence: 'likely', interactionType: 'Ionic bond (electron transfer)' };
  if (enDelta >= 1.2) return { bondType: 'Polar ionic / highly polar covalent', confidence: 'plausible', interactionType: 'Ionic or highly polar covalent bond' };
  if (enDelta >= 0.5) return { bondType: 'Polar covalent', confidence: 'likely', interactionType: 'Covalent bond (polar)' };
  return { bondType: 'Nonpolar covalent', confidence: 'likely', interactionType: 'Covalent bond (nonpolar / weakly polar)' };
}

function gatherUncertainty(a: Element, b: Element, ionA: IonTendency, ionB: IonTendency): string[] {
  const flags: string[] = [];
  if (a.category === 'metalloid' || b.category === 'metalloid') flags.push('Metalloid present – bonding character can shift between metallic and nonmetallic.');
  if (a.category === 'transition metal' || b.category === 'transition metal') flags.push('Transition metal present – multiple oxidation states possible; bond character and products depend on conditions.');
  if (a.category === 'actinide' || b.category === 'actinide') flags.push('Actinide present – varied oxidation states and radioactive considerations.');
  if (ionA.uncertain && ionB.uncertain) flags.push('Both elements have uncertain ion charges – prediction reliability is low.');
  if (a.en === null || b.en === null) flags.push('Electronegativity data missing for at least one element – bond type prediction is approximate.');
  return flags;
}

/* ── public API ───────────────────────────────────────── */

export function analyzePair(a: Element, b: Element): PairAnalysis {
  const enDelta = (a.en !== null && b.en !== null) ? Math.abs(a.en - b.en) : null;
  const enDeltaLabel = enDelta !== null ? `ΔEN = ${enDelta.toFixed(2)}` : 'ΔEN unknown';

  const { bondType, confidence, interactionType } = classifyBond(enDelta, a, b);
  const ionA = ionTendency(a);
  const ionB = ionTendency(b);
  const uncertaintyFlags = gatherUncertainty(a, b, ionA, ionB);

  const summary = `${a.sym}–${b.sym}: ${enDeltaLabel} → ${bondType} (${confidence}). ${interactionType}.`;

  return { a, b, enDelta, enDeltaLabel, bondType, bondConfidence: confidence, interactionType, uncertaintyFlags, ionA, ionB, summary };
}

export function analyzeSelection(elements: Element[]): PairAnalysis[] {
  const pairs: PairAnalysis[] = [];
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      pairs.push(analyzePair(elements[i], elements[j]));
    }
  }
  return pairs;
}

/* ── Combine Lab prediction ──────────────────────────── */

export interface CombinePrediction {
  elements: Element[];
  predictedOutcome: string;
  confidence: Confidence;
  reactionType: string;
  explanation: string;
  matchedReactionId: string | null;
}

export function predictCombination(elements: Element[], curatedReactions: { id: string; label: string; type: string; A: { name: string }; B: { name: string } }[]): CombinePrediction {
  const syms = elements.map(e => e.sym).sort();
  const cats = elements.map(e => e.category);

  // Try to match curated reactions by checking if element symbols correspond
  const reactionElementMap: Record<string, string[]> = {
    neutralization: ['Cl', 'H', 'Na', 'O'],
    precip_agcl: ['Ag', 'Cl', 'N', 'Na', 'O'],
    gas_co2: ['C', 'Cl', 'H', 'Na', 'O'],
    precip_cuoh2: ['Cu', 'Na', 'O', 'S'],
    single_replacement: ['Cu', 'Fe', 'O', 'S'],
  };

  // Simpler matching: check if selected elements' symbols are a subset of reaction elements
  let matchedReactionId: string | null = null;
  for (const [rxnId, rxnSyms] of Object.entries(reactionElementMap)) {
    if (syms.length >= 2 && syms.every(s => rxnSyms.includes(s))) {
      matchedReactionId = rxnId;
      break;
    }
  }

  // Analyze pairs for overall prediction
  const pairs = analyzeSelection(elements);

  // All noble gases?
  if (cats.every(c => c === 'noble gas')) {
    return { elements, predictedOutcome: 'No reaction expected – all noble gases.', confidence: 'likely', reactionType: 'None', explanation: 'Noble gases have filled valence shells and are generally unreactive with each other.', matchedReactionId: null };
  }

  // Check if any pair suggests ionic bonding
  const ionicPairs = pairs.filter(p => p.bondType === 'Ionic');
  const polarIonicPairs = pairs.filter(p => p.bondType.includes('ionic') || p.bondType.includes('Ionic'));
  const covalentPairs = pairs.filter(p => p.bondType.includes('covalent') || p.bondType.includes('Covalent'));
  const hasUncertainty = pairs.some(p => p.uncertaintyFlags.length > 0);

  let predictedOutcome: string;
  let confidence: Confidence;
  let reactionType: string;
  let explanation: string;

  if (ionicPairs.length > 0) {
    const pair = ionicPairs[0];
    predictedOutcome = `Ionic compound formation likely: ${pair.a.sym} and ${pair.b.sym} could form an ionic bond via electron transfer.`;
    confidence = hasUncertainty ? 'plausible' : 'likely';
    reactionType = 'Ionic compound formation';
    explanation = `Large EN difference (${pair.enDeltaLabel}) suggests electron transfer. ${pair.ionA.element.sym} → ${pair.ionA.typicalCharge || '?'}, ${pair.ionB.element.sym} → ${pair.ionB.typicalCharge || '?'}.`;
  } else if (polarIonicPairs.length > 0) {
    const pair = polarIonicPairs[0];
    predictedOutcome = `Possible ionic or highly polar covalent compound: ${pair.a.sym} + ${pair.b.sym}.`;
    confidence = 'plausible';
    reactionType = 'Ionic / polar covalent';
    explanation = `EN difference (${pair.enDeltaLabel}) is in the border zone between ionic and covalent character.`;
  } else if (covalentPairs.length > 0) {
    const pair = covalentPairs[0];
    predictedOutcome = `Covalent compound formation expected: ${pair.a.sym} and ${pair.b.sym} would share electrons.`;
    confidence = hasUncertainty ? 'plausible' : 'likely';
    reactionType = 'Covalent compound';
    explanation = `Similar electronegativities (${pair.enDeltaLabel}) favor electron sharing rather than transfer.`;
  } else if (pairs.some(p => p.bondType.includes('Metallic'))) {
    predictedOutcome = `Metallic bonding / alloy formation between the selected metals.`;
    confidence = 'plausible';
    reactionType = 'Metallic / alloy';
    explanation = 'Both elements are metals; they could form an alloy through metallic bonding.';
  } else {
    predictedOutcome = 'No strong reaction predicted under standard conditions.';
    confidence = 'uncertain';
    reactionType = 'Uncertain';
    explanation = 'The combination does not clearly fit common reaction patterns.';
  }

  return { elements, predictedOutcome, confidence, reactionType, explanation, matchedReactionId };
}
