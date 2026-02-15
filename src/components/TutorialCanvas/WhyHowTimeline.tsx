import type { PairAnalysis } from '@/utils/interactionPredictor';
import type { SynthesisResult } from '@/utils/synthesisEngine';
import type { LearningLevel } from '@/types/learningLayers';
import { Badge } from '@/components/ui/badge';

export interface TimelineStep {
  label: string;
  detail: string;
  phase: number; // 0–1 scrub position
}

/**
 * Generate grounded timeline steps from structured state only.
 * No invented claims — every sentence references a computed field.
 */
export function buildTimelineSteps(
  primaryPair: PairAnalysis | null,
  synthesisResult: SynthesisResult | null,
  level: LearningLevel,
): TimelineStep[] {
  if (!primaryPair) return [];

  const steps: TimelineStep[] = [];
  const { a, b, enDelta, enDeltaLabel, bondType, bondConfidence, interactionType, uncertaintyFlags, ionA, ionB } = primaryPair;
  const isUncertain = bondConfidence === 'uncertain';

  // Step 1: Atom-level context
  const enInfo = enDelta !== null
    ? `${a.sym} EN=${a.en ?? '?'}, ${b.sym} EN=${b.en ?? '?'}`
    : 'EN data missing for at least one element';
  steps.push({
    label: 'Atoms',
    detail: `Valence context: ${enInfo}.`,
    phase: 0.0,
  });

  // Step 2: EN comparison
  steps.push({
    label: 'EN Δ',
    detail: `${enDeltaLabel}. ${level !== 'beginner' ? interactionType + '.' : ''}`,
    phase: 0.25,
  });

  // Step 3: Bond character + confidence
  steps.push({
    label: 'Bond',
    detail: `${bondType} (${bondConfidence}).${isUncertain ? ' Multiple outcomes possible.' : ''}`,
    phase: 0.5,
  });

  // Step 4: Ion/sharing rationale
  if (bondType === 'Ionic' && !isUncertain) {
    steps.push({
      label: 'Transfer',
      detail: `${ionA.element.sym} → ${ionA.typicalCharge ?? '?'}, ${ionB.element.sym} → ${ionB.typicalCharge ?? '?'}. Electron transfer forms ions.`,
      phase: 0.75,
    });
  } else if (bondType.toLowerCase().includes('covalent')) {
    const polarNote = bondType.toLowerCase().includes('polar') && enDelta !== null && enDelta > 0.4
      ? ` Dipole toward higher EN (${(b.en ?? 0) > (a.en ?? 0) ? b.sym : a.sym}).`
      : '';
    steps.push({
      label: 'Sharing',
      detail: `Electrons shared between ${a.sym} and ${b.sym}.${polarNote}`,
      phase: 0.75,
    });
  } else if (bondType.toLowerCase().includes('metallic')) {
    steps.push({
      label: 'Sea of e⁻',
      detail: `Delocalized electrons form metallic bonding between ${a.sym} and ${b.sym}.`,
      phase: 0.75,
    });
  }

  // Step 5 (optional): Assumptions for uncertain cases
  if (isUncertain || uncertaintyFlags.length > 0) {
    steps.push({
      label: '⚠ Assumptions',
      detail: uncertaintyFlags.length > 0 ? uncertaintyFlags.join(' ') : 'Simplified model — multiple bonding patterns possible.',
      phase: 0.9,
    });
  }

  // Step 6 (optional): Synthesis counts
  if (synthesisResult && synthesisResult.formula) {
    const classLabel = { ionic: 'Ionic solid', covalent: 'Covalent molecule', metallic: 'Metallic/alloy', uncertain: 'Uncertain' }[synthesisResult.classification];
    steps.push({
      label: 'Compound',
      detail: `${synthesisResult.formula} — ${classLabel} (${synthesisResult.confidence}).${synthesisResult.ionFormula ? ' Proposed: ' + synthesisResult.ionFormula + '.' : ''}`,
      phase: 1.0,
    });
  }

  return steps;
}

interface WhyHowTimelineProps {
  steps: TimelineStep[];
  currentPhase: number;
  onStepClick: (phase: number) => void;
  level: LearningLevel;
}

export function WhyHowTimeline({ steps, currentPhase, onStepClick, level }: WhyHowTimelineProps) {
  if (steps.length === 0) return null;

  // Find the active step: the last step whose phase <= currentPhase
  let activeIdx = 0;
  for (let i = steps.length - 1; i >= 0; i--) {
    if (currentPhase >= steps[i].phase - 0.01) {
      activeIdx = i;
      break;
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] text-muted-foreground font-medium">Why / How</span>
        <Badge variant="outline" className="text-[9px]">{level}</Badge>
      </div>
      {steps.map((step, i) => {
        const isActive = i === activeIdx;
        const isPast = i < activeIdx;
        return (
          <button
            key={i}
            onClick={() => onStepClick(step.phase)}
            className={`w-full text-left rounded-lg px-2 py-1.5 border transition-colors ${
              isActive
                ? 'border-primary/40 bg-primary/10'
                : isPast
                ? 'border-border/20 bg-secondary/5 opacity-60'
                : 'border-border/10 bg-secondary/5 opacity-40'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
              <span className="text-[9px] text-muted-foreground">({Math.round(step.phase * 100)}%)</span>
            </div>
            {(isActive || isPast) && (
              <p className="text-[10px] text-foreground/75 leading-relaxed mt-0.5">{step.detail}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
