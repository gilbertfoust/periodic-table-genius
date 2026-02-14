import { useState, useCallback } from 'react';
import { SelectionProvider } from '@/state/selectionStore';
import { Header } from '@/components/Header';
import { PeriodicTable } from '@/components/PeriodicTable/PeriodicTable';
import { SelectionTray } from '@/components/SelectionTray';
import { ElementTutor } from '@/components/ElementTutor/ElementTutor';
import { InteractionInspector } from '@/components/InteractionInspector/InteractionInspector';
import { CombineLab } from '@/components/CombineLab/CombineLab';
import { MixtureLab } from '@/components/MixtureLab/MixtureLab';

const Index = () => {
  const [prefillReactionId, setPrefillReactionId] = useState<string | null>(null);

  const handleSendToMixtureLab = useCallback((reactionId: string) => {
    setPrefillReactionId(reactionId);
    // Scroll to Mixture Lab
    setTimeout(() => {
      document.getElementById('mixture-lab')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  return (
    <SelectionProvider>
      <div className="min-h-screen bg-background">
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <Header />

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-4 items-start">
            <div>
              <PeriodicTable />
              <SelectionTray />
            </div>
            <div className="space-y-4">
              <ElementTutor />
              <InteractionInspector />
            </div>
          </div>

          <CombineLab onSendToMixtureLab={handleSendToMixtureLab} />

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
