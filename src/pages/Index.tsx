import { useState, useCallback, useMemo } from 'react';
import { SelectionProvider } from '@/state/selectionStore';
import type { DemoKey } from '@/components/SelectionTray';
import { Header } from '@/components/Header';
import { PeriodicTable } from '@/components/PeriodicTable/PeriodicTable';
import { SelectionTray } from '@/components/SelectionTray';
import { ElementTutor } from '@/components/ElementTutor/ElementTutor';
import { InteractionInspector } from '@/components/InteractionInspector/InteractionInspector';
import { CombineLab } from '@/components/CombineLab/CombineLab';
import { MixtureLab } from '@/components/MixtureLab/MixtureLab';
import { TutorialCanvas } from '@/components/TutorialCanvas/TutorialCanvas';
import { REACTIONS } from '@/data/reactions';
import type { CombinePrediction } from '@/utils/interactionPredictor';

const Index = () => {
  const [prefillReactionId, setPrefillReactionId] = useState<string | null>(null);
  const [combinePrediction, setCombinePrediction] = useState<CombinePrediction | null>(null);

  const handleSendToMixtureLab = useCallback((reactionId: string) => {
    setPrefillReactionId(reactionId);
    setTimeout(() => {
      document.getElementById('mixture-lab')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleDemoScenario = useCallback((scenario: DemoKey) => {
    if (scenario === 'precip') {
      handleSendToMixtureLab('precip_agcl');
    }
  }, [handleSendToMixtureLab]);

  const showLattice = useMemo(() =>
    combinePrediction !== null
    && combinePrediction.matchedReactionId !== null
    && REACTIONS.find(r => r.id === combinePrediction.matchedReactionId)?.visuals.kind === 'precip',
    [combinePrediction]
  );

  const latticeElements = useMemo(() =>
    showLattice && combinePrediction ? combinePrediction.elements : [],
    [showLattice, combinePrediction]
  );

  return (
    <SelectionProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <Header />

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4 items-start">
            <div>
              <PeriodicTable />
              <SelectionTray onDemoScenario={handleDemoScenario} />
            </div>
            <div className="space-y-4">
              <ElementTutor />
              <TutorialCanvas showLattice={showLattice} latticeElements={latticeElements} />
              <InteractionInspector />
            </div>
          </div>

          <CombineLab onSendToMixtureLab={handleSendToMixtureLab} onPredictionChange={setCombinePrediction} />

          <div id="mixture-lab" className="mt-4">
            <MixtureLab prefillReactionId={prefillReactionId} />
          </div>

          <footer className="mt-4 text-xs text-muted-foreground">
            Next extensions that would fit well: more overlays (atomic radius, ionization energy), more reaction families, and a lesson path that saves progress.
          </footer>
        </div>
      </div>
    </SelectionProvider>
  );
};

export default Index;
