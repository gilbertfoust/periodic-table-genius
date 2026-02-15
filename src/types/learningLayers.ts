export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export interface SceneControls {
  level: LearningLevel;
  speed: number;       // 0.25 – 2
  paused: boolean;
  overlays: Record<string, boolean>;
  scrubPhase: number | null; // null = auto, 0-1 = manual override
}

export const DEFAULT_CONTROLS: SceneControls = {
  level: 'beginner',
  speed: 1,
  paused: false,
  overlays: {},
  scrubPhase: null,
};

/* ── Per-scene "What to notice" text ─────────────── */

export interface LevelText {
  beginner: string;
  intermediate: string[];
  advanced: string[];
}

/* ── Atom scene ─────────────────────────────────── */

export function atomNotice(sym: string, shells: number[], valence: number): LevelText {
  return {
    beginner: `${sym} has ${valence} outer electron${valence !== 1 ? 's' : ''} — these determine how it bonds.`,
    intermediate: [
      `Shell distribution: ${shells.join(' | ')}`,
      `Valence electrons: ${valence}`,
      `Main-group elements follow the octet rule (aim for 8 outer electrons).`,
    ],
    advanced: [
      `Electron configuration shown is simplified (2-8-8-18 model, not full quantum sub-shells).`,
      `Transition metals and heavier elements may deviate from this shell-filling order.`,
    ],
  };
}

/* ── Bond scene ─────────────────────────────────── */

import type { PairAnalysis } from '@/utils/interactionPredictor';

export function bondNotice(a: PairAnalysis): LevelText {
  const uncertain = a.bondConfidence === 'uncertain';
  return {
    beginner: uncertain
      ? `The bond between ${a.a.sym} and ${a.b.sym} is hard to predict — multiple outcomes are possible.`
      : `${a.a.sym} and ${a.b.sym} form a ${a.bondType.toLowerCase()} bond.`,
    intermediate: [
      `${a.enDeltaLabel}`,
      `Bond type: ${a.bondType}`,
      uncertain ? 'Multiple bonding patterns possible depending on conditions.' : `Interaction: ${a.interactionType}`,
    ],
    advanced: [
      `Bond type is a spectrum; ionic/covalent categories are instructional simplifications.`,
      ...(a.uncertaintyFlags.length > 0 ? a.uncertaintyFlags : []),
    ],
  };
}

/* ── Lattice scene ──────────────────────────────── */

export function latticeNotice(syms: string[]): LevelText {
  const label = syms.join('-');
  return {
    beginner: `Repeating pattern is a model of how ${label} ions can arrange in solids.`,
    intermediate: [
      `Alternating charges create an electrostatic lattice.`,
      `Precipitation means a solid is forming from solution.`,
    ],
    advanced: [
      `This is a schematic NaCl-type lattice; real crystals have specific structures (FCC, BCC, etc.).`,
      `Lattice energy depends on ion charges and radii — not modeled here.`,
    ],
  };
}

/* ── Assumptions note ───────────────────────────── */

export const ASSUMPTIONS_NOTE = 'This is a simplified model; some elements (especially transition metals) can form multiple ions and bonding patterns.';
