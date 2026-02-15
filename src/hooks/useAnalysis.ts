import { useMemo } from 'react';
import { useSelection } from '@/state/selectionStore';
import { byZ, type Element } from '@/data/elements';
import { analyzePair, analyzeSelection, predictCombination, type PairAnalysis, type CombinePrediction } from '@/utils/interactionPredictor';
import { REACTIONS } from '@/data/reactions';

export interface AnalysisResult {
  elements: Element[];
  primaryPair: PairAnalysis | null;
  allPairs: PairAnalysis[];
  combinePrediction: CombinePrediction | null;
}

/**
 * Single source of truth for PairAnalysis and CombinePrediction.
 * All UI layers (ExplainerPanel, SynthesisPanel, LabWorkbook, TutorialCanvas, InteractionInspector)
 * must consume from this hook rather than calling analyzePair independently.
 */
export function useAnalysis(): AnalysisResult {
  const { selectedElements } = useSelection();

  const elements = useMemo(
    () => selectedElements.map(Z => byZ(Z)).filter(Boolean) as Element[],
    [selectedElements]
  );

  const allPairs = useMemo(() => analyzeSelection(elements), [elements]);

  const primaryPair = useMemo(
    () => elements.length >= 2 ? allPairs[0] ?? null : null,
    [elements, allPairs]
  );

  const combinePrediction = useMemo(
    () => elements.length >= 2 ? predictCombination(elements, REACTIONS) : null,
    [elements]
  );

  return { elements, primaryPair, allPairs, combinePrediction };
}
