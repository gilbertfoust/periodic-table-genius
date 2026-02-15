import type { PairAnalysis, CombinePrediction } from '@/utils/interactionPredictor';
import type { SynthesisResult } from '@/utils/synthesisEngine';
import type { LearningLevel } from '@/types/learningLayers';
import { ASSUMPTIONS_NOTE } from '@/types/learningLayers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface ExplainerPanelProps {
  primaryPair: PairAnalysis | null;
  combinePrediction: CombinePrediction | null;
  synthesisResult: SynthesisResult | null;
  level: LearningLevel;
}

export function ExplainerPanel({ primaryPair, combinePrediction, synthesisResult, level }: ExplainerPanelProps) {
  if (!primaryPair && !combinePrediction && !synthesisResult) return null;

  const sections: { title: string; content: string }[] = [];

  // Source chips: track which inputs are used
  const sourceChips: string[] = [];

  // Section 1: Bond character
  if (primaryPair) {
    sourceChips.push('EN delta', 'bond type');
    const base = `${primaryPair.a.sym}–${primaryPair.b.sym}: ${primaryPair.enDeltaLabel} → ${primaryPair.bondType}.`;
    if (level === 'beginner') {
      sections.push({ title: 'Bond character', content: base });
    } else {
      const detail = `${base} Confidence: ${primaryPair.bondConfidence}. ${primaryPair.interactionType}.`;
      sections.push({ title: 'Bond character', content: detail });
    }
  }

  // Section 2: Ion tendencies
  if (primaryPair && level !== 'beginner') {
    sourceChips.push('ion tendencies');
    const { ionA, ionB } = primaryPair;
    sections.push({
      title: 'Ion tendencies',
      content: `${ionA.element.sym}: ${ionA.typicalCharge ?? 'unknown'} (${ionA.explanation}) · ${ionB.element.sym}: ${ionB.typicalCharge ?? 'unknown'} (${ionB.explanation})`,
    });
  }

  // Section 3: Reaction match
  if (combinePrediction?.matchedReactionId) {
    sourceChips.push('curated match');
    sections.push({
      title: 'Reaction match',
      content: `Matches curated reaction: ${combinePrediction.reactionType}. ${level !== 'beginner' ? combinePrediction.explanation : ''}`,
    });
  }

  // Section 4: Synthesis (count-aware)
  if (synthesisResult) {
    sourceChips.push('synthesis classification', 'counts');
    const classLabel = { ionic: 'Ionic solid', covalent: 'Covalent molecule', metallic: 'Metallic/alloy', uncertain: 'Uncertain' }[synthesisResult.classification];
    let text = `Classification: ${classLabel}. Formula: ${synthesisResult.formula}.`;
    if (synthesisResult.ionFormula) text += ` Proposed ionic formula: ${synthesisResult.ionFormula}.`;
    // Count-aware note: reference the counts explicitly
    if (synthesisResult.formula && synthesisResult.formula.length > 2) {
      text += ` Counts as specified in the formula builder are reflected in "${synthesisResult.formula}".`;
    }
    sections.push({ title: 'Synthesis', content: text });
  }

  // Advanced model limitations
  if (level === 'advanced') {
    sections.push({
      title: 'Model limitations',
      content: 'Bond types exist on a spectrum. Categories shown are instructional simplifications. Real bonding depends on orbital overlap, geometry, and environment.',
    });
  }

  // Assumptions section
  const showAssumptions = primaryPair && (
    primaryPair.bondConfidence === 'uncertain' ||
    primaryPair.uncertaintyFlags.length > 0
  );

  if (showAssumptions) sourceChips.push('uncertainty flags');

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Why this happens
        </CardTitle>
        <Badge variant="outline" className="text-[10px]">{level}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Source chips */}
        <div className="flex flex-wrap gap-1">
          {sourceChips.map(chip => (
            <span key={chip} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/30 text-muted-foreground border border-border/20">
              {chip}
            </span>
          ))}
        </div>

        {sections.map((s, i) => (
          <div key={i} className="border border-border/30 rounded-lg bg-secondary/10 p-2">
            <div className="text-[10px] text-muted-foreground font-medium mb-0.5">{s.title}</div>
            <div className="text-xs text-foreground/85 leading-relaxed">{s.content}</div>
          </div>
        ))}
        {showAssumptions && (
          <div className="text-[10px] text-amber-400/80 italic border-t border-border/20 pt-1.5 mt-1">
            ⚠ {ASSUMPTIONS_NOTE}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
