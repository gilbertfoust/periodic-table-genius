import { useState, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSelection } from '@/state/selectionStore';
import { byZ, type Element } from '@/data/elements';
import { analyzePair } from '@/utils/interactionPredictor';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Box } from 'lucide-react';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';
import { AtomStructureScene, getAtomCaption } from '@/scenes/AtomStructureScene';
import { BondFormationScene, getBondCaption } from '@/scenes/BondFormationScene';
import { LatticeScene, getLatticeCaption } from '@/scenes/LatticeScene';

interface Props {
  showLattice: boolean;
  latticeElements: Element[];
}

export function TutorialCanvas({ showLattice, latticeElements }: Props) {
  const [open, setOpen] = useState(true);
  const { selectedElements } = useSelection();

  const elements = useMemo(
    () => selectedElements.map(Z => byZ(Z)).filter(Boolean) as Element[],
    [selectedElements]
  );

  const pairAnalysis = useMemo(
    () => elements.length >= 2 ? analyzePair(elements[0], elements[1]) : null,
    [elements]
  );

  // Determine scene + caption
  let caption = 'Select an element on the periodic table to see its atomic structure.';
  let sceneKey = 'placeholder';

  if (showLattice && latticeElements.length >= 2) {
    caption = getLatticeCaption(latticeElements);
    sceneKey = `lattice-${latticeElements.map(e => e.Z).join('-')}`;
  } else if (elements.length >= 2 && pairAnalysis) {
    caption = getBondCaption(pairAnalysis);
    sceneKey = `bond-${elements[0].Z}-${elements[1].Z}`;
  } else if (elements.length === 1) {
    caption = getAtomCaption(elements[0]);
    sceneKey = `atom-${elements[0].Z}`;
  }

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Box className="h-4 w-4 text-primary" />
            3D View
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <div className="px-4 pb-3">
            <WebGLErrorBoundary>
              <div className="h-[280px] w-full rounded-lg overflow-hidden bg-background/40 border border-border/30">
                <Canvas
                  key={sceneKey}
                  dpr={[1, 1.5]}
                  camera={{ position: [0, 0, 5], fov: 45 }}
                  frameloop={open ? 'always' : 'demand'}
                >
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[3, 3, 5]} intensity={0.8} />
                  <Suspense fallback={null}>
                    {showLattice && latticeElements.length >= 2 ? (
                      <LatticeScene elements={latticeElements} />
                    ) : elements.length >= 2 && pairAnalysis ? (
                      <BondFormationScene analysis={pairAnalysis} />
                    ) : elements.length === 1 ? (
                      <AtomStructureScene element={elements[0]} />
                    ) : null}
                  </Suspense>
                </Canvas>
              </div>
            </WebGLErrorBoundary>
            <p className="text-xs text-muted-foreground italic mt-1.5">
              {caption}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
