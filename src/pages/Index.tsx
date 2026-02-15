import { useState, useCallback, useMemo } from 'react';
import { SelectionProvider } from '@/state/selectionStore';
import { useAnalysis } from '@/hooks/useAnalysis';
import type { SlotEntry } from '@/utils/synthesisEngine';
import type { DemoKey } from '@/components/SelectionTray';
import { Header } from '@/components/Header';
import { PeriodicTable } from '@/components/PeriodicTable/PeriodicTable';
import { SelectionTray } from '@/components/SelectionTray';
import { ElementTutor } from '@/components/ElementTutor/ElementTutor';
import { InteractionInspector } from '@/components/InteractionInspector/InteractionInspector';
import { CombineLab } from '@/components/CombineLab/CombineLab';
import { MixtureLab } from '@/components/MixtureLab/MixtureLab';
import { TutorialCanvas } from '@/components/TutorialCanvas/TutorialCanvas';
import { ExplainerPanel } from '@/components/ExplainerPanel';
import { LabLauncher } from '@/components/LabWorkbook/LabLauncher';
import { LabWorkbookPanel } from '@/components/LabWorkbook/LabWorkbookPanel';
import { DevDebugPanel } from '@/components/DevDebugPanel';
import { REACTIONS } from '@/data/reactions';
import type { CombinePrediction } from '@/utils/interactionPredictor';
import type { SynthesisResult } from '@/utils/synthesisEngine';
import type { LearningLevel } from '@/types/learningLayers';

function IndexContent() {
  const [prefillReactionId, setPrefillReactionId] = useState<string | null>(null);
  const [combinePrediction, setCombinePrediction] = useState<CombinePrediction | null>(null);
  const [synthesisInput, setSynthesisInput] = useState<SlotEntry[] | null>(null);
  const [synthesisResult, setSynthesisResult] = useState<SynthesisResult | null>(null);
  const [activeLabId, setActiveLabId] = useState<string | null>(null);
  const [lastSendAction, setLastSendAction] = useState<{ type: 'curated' | 'synthesis'; ts: number } | null>(null);
  const [sceneControls, setSceneControls] = useState<{ level: LearningLevel; isExpanded: boolean; sceneType: string }>({
    level: 'beginner', isExpanded: true, sceneType: 'none',
  });

  const { elements, primaryPair, allPairs, combinePrediction: analysisPrediction } = useAnalysis();

  const handleSendToMixtureLab = useCallback((reactionId: string) => {
    setPrefillReactionId(reactionId);
    setSynthesisInput(null);
    setLastSendAction({ type: 'curated', ts: Date.now() });
    setTimeout(() => {
      document.getElementById('mixture-lab')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleSendToSynthesis = useCallback((slots: SlotEntry[]) => {
    setSynthesisInput(slots.map(s => ({ ...s }))); // deep clone
    setPrefillReactionId(null);
    setLastSendAction({ type: 'synthesis', ts: Date.now() });
    setTimeout(() => {
      document.getElementById('mixture-lab')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleDemoScenario = useCallback((scenario: DemoKey) => {
    if (scenario === 'precip') {
      handleSendToMixtureLab('precip_agcl');
    }
  }, [handleSendToMixtureLab]);

  const handleViewIn3D = useCallback((zs: number[]) => {
    // Does NOT auto-advance workbook steps (per revision)
    document.querySelector('[data-tutorial-canvas]')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4 items-start">
          <div>
            <PeriodicTable />
            <SelectionTray onDemoScenario={handleDemoScenario}>
              <LabLauncher
                onLabStart={setActiveLabId}
                onStartPrecipLab={handleSendToMixtureLab}
              />
            </SelectionTray>
          </div>
          <div className="space-y-4">
            <ElementTutor />
            <TutorialCanvas
              showLattice={showLattice}
              latticeElements={latticeElements}
              primaryPair={primaryPair}
              synthesisResult={synthesisResult}
              onSceneStateChange={setSceneControls}
            />
            <ExplainerPanel
              primaryPair={primaryPair}
              combinePrediction={analysisPrediction}
              synthesisResult={synthesisResult}
              level={sceneControls.level}
            />
            <InteractionInspector />
            {activeLabId && (
              <LabWorkbookPanel
                labId={activeLabId}
                onClose={() => setActiveLabId(null)}
                sceneType={sceneControls.sceneType}
                isExpanded={sceneControls.isExpanded}
                level={sceneControls.level}
                primaryPair={primaryPair}
              />
            )}
          </div>
        </div>

        <CombineLab
          onSendToMixtureLab={handleSendToMixtureLab}
          onSendToSynthesis={handleSendToSynthesis}
          onPredictionChange={setCombinePrediction}
          primaryPair={primaryPair}
        />

        <div id="mixture-lab" className="mt-4">
          <MixtureLab
            prefillReactionId={prefillReactionId}
            synthesisInput={synthesisInput}
            primaryPair={primaryPair}
            onViewIn3D={handleViewIn3D}
            onSynthesisResult={setSynthesisResult}
          />
        </div>

        <footer className="mt-4 text-xs text-muted-foreground">
          Next extensions: more overlays (atomic radius, ionization energy), more reaction families, and a lesson path that saves progress.
        </footer>

        <DevDebugPanel
          lastSendAction={lastSendAction}
          curatedReactionId={prefillReactionId}
          synthesisInput={synthesisInput}
          synthesisResult={synthesisResult}
          tutorialState={sceneControls ? { isExpanded: sceneControls.isExpanded, sceneType: sceneControls.sceneType, scrubPhase: null } : undefined}
        />
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <SelectionProvider>
      <IndexContent />
    </SelectionProvider>
  );
};

export default Index;
