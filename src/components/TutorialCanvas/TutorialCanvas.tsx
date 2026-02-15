import { useState, useMemo, useRef, useCallback, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSelection } from '@/state/selectionStore';
import { byZ, type Element } from '@/data/elements';
import type { PairAnalysis } from '@/utils/interactionPredictor';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Box } from 'lucide-react';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';
import { AtomStructureScene, getAtomCaption, getAtomAccountingData } from '@/scenes/AtomStructureScene';
import { BondFormationScene, getBondCaption, getBondAccountingData } from '@/scenes/BondFormationScene';
import { LatticeScene, getLatticeCaption } from '@/scenes/LatticeScene';
import { SceneControlsUI } from './SceneControls';
import { LevelNotice } from './LevelNotice';
import { atomNotice, bondNotice, latticeNotice, type SceneControls, DEFAULT_CONTROLS } from '@/types/learningLayers';
import type { LearningLevel } from '@/types/learningLayers';

interface Props {
  showLattice: boolean;
  latticeElements: Element[];
  primaryPair?: PairAnalysis | null;
  onSceneStateChange?: (state: { level: LearningLevel; isExpanded: boolean; sceneType: string }) => void;
}

type OverlayDef = { key: string; label: string; levelMin: 'beginner' | 'intermediate' | 'advanced' };

const ATOM_OVERLAYS: OverlayDef[] = [
  { key: 'valenceHighlight', label: 'Valence highlight', levelMin: 'beginner' },
  { key: 'octetRing', label: 'Octet target ring', levelMin: 'intermediate' },
];
const BOND_OVERLAYS: OverlayDef[] = [
  { key: 'charges', label: 'Charge labels', levelMin: 'beginner' },
  { key: 'dipole', label: 'Dipole arrow', levelMin: 'intermediate' },
];
const LATTICE_OVERLAYS: OverlayDef[] = [
  { key: 'unitCell', label: 'Unit cell', levelMin: 'intermediate' },
];

export function TutorialCanvas({ showLattice, latticeElements, primaryPair, onSceneStateChange }: Props) {
  const [open, setOpen] = useState(true);
  const [controls, setControls] = useState<SceneControls>({ ...DEFAULT_CONTROLS, overlays: { valenceHighlight: true, charges: true } });
  const { selectedElements } = useSelection();
  const latticeResetRef = useRef<(() => void) | null>(null);

  const elements = useMemo(
    () => selectedElements.map(Z => byZ(Z)).filter(Boolean) as Element[],
    [selectedElements]
  );

  // Use primaryPair from props (single source of truth) instead of computing locally
  const pairAnalysis = primaryPair ?? null;

  // Determine scene type
  type SceneType = 'lattice' | 'bond' | 'atom' | 'none';
  let sceneType: SceneType = 'none';
  let caption = 'Select an element on the periodic table to see its atomic structure.';
  let sceneKey = 'placeholder';

  if (showLattice && latticeElements.length >= 2) {
    sceneType = 'lattice';
    caption = getLatticeCaption(latticeElements);
    sceneKey = `lattice-${latticeElements.map(e => e.Z).join('-')}`;
  } else if (elements.length >= 2 && pairAnalysis) {
    sceneType = 'bond';
    caption = getBondCaption(pairAnalysis);
    sceneKey = `bond-${elements[0].Z}-${elements[1].Z}`;
  } else if (elements.length === 1) {
    sceneType = 'atom';
    caption = getAtomCaption(elements[0]);
    sceneKey = `atom-${elements[0].Z}`;
  }

  // Notify parent of scene state for lab workbook observe3D gating
  useEffect(() => {
    onSceneStateChange?.({ level: controls.level, isExpanded: open, sceneType });
  }, [controls.level, open, sceneType, onSceneStateChange]);

  const overlayDefs = sceneType === 'atom' ? ATOM_OVERLAYS : sceneType === 'bond' ? BOND_OVERLAYS : sceneType === 'lattice' ? LATTICE_OVERLAYS : [];
  const showScrubber = sceneType === 'bond' || sceneType === 'lattice';

  const showAssumptions = pairAnalysis ? (pairAnalysis.bondConfidence === 'uncertain' || pairAnalysis.uncertaintyFlags.length > 0) : false;

  const handleReset = useCallback(() => {
    latticeResetRef.current?.();
  }, []);

  // Level notice text
  const levelText = useMemo(() => {
    if (sceneType === 'atom' && elements[0]) {
      const { shells, valence } = getAtomAccountingData(elements[0]);
      return atomNotice(elements[0].sym, shells, valence);
    }
    if (sceneType === 'bond' && pairAnalysis) {
      return bondNotice(pairAnalysis);
    }
    if (sceneType === 'lattice' && latticeElements.length >= 2) {
      return latticeNotice(latticeElements.map(e => e.sym));
    }
    return null;
  }, [sceneType, elements, pairAnalysis, latticeElements]);

  // Electron accounting for atom/bond
  const atomAccounting = sceneType === 'atom' && elements[0] ? getAtomAccountingData(elements[0]) : null;
  const bondAccounting = sceneType === 'bond' && pairAnalysis ? getBondAccountingData(pairAnalysis) : null;

  return (
    <Card className="bg-card/80 backdrop-blur border-border" data-tutorial-canvas>
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
          <div className="px-4 pb-3 space-y-2">
            {/* Controls */}
            {sceneType !== 'none' && (
              <SceneControlsUI
                controls={controls}
                onChange={setControls}
                overlayDefs={overlayDefs}
                showReset={sceneType === 'lattice'}
                onReset={handleReset}
                showScrubber={showScrubber}
              />
            )}

            <WebGLErrorBoundary>
              <div className="h-[280px] w-full rounded-lg overflow-hidden bg-background/40 border border-border/30">
                <Canvas
                  key={sceneKey}
                  dpr={[1, 1.5]}
                  camera={{ position: [0, 0, 5], fov: 45 }}
                  frameloop={open && !controls.paused ? 'always' : 'demand'}
                >
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[3, 3, 5]} intensity={0.8} />
                  <Suspense fallback={null}>
                    {sceneType === 'lattice' && latticeElements.length >= 2 ? (
                      <LatticeScene elements={latticeElements} controls={controls} onResetRef={latticeResetRef} />
                    ) : sceneType === 'bond' && pairAnalysis ? (
                      <BondFormationScene analysis={pairAnalysis} controls={controls} />
                    ) : sceneType === 'atom' && elements.length >= 1 ? (
                      <AtomStructureScene element={elements[0]} controls={controls} />
                    ) : null}
                  </Suspense>
                </Canvas>
              </div>
            </WebGLErrorBoundary>

            {/* Viewpoint shortcuts */}
            {sceneType !== 'none' && (
              <div className="flex gap-1">
                {/* Note: viewpoint shortcuts change camera via Canvas re-key; OrbitControls handles orbit */}
                <span className="text-[10px] text-muted-foreground mr-1">Click & drag to orbit</span>
              </div>
            )}

            {/* Caption */}
            <p className="text-xs text-muted-foreground italic">{caption}</p>

            {/* Electron Accounting */}
            {atomAccounting && (
              <div className="text-[11px] text-foreground/80 bg-secondary/20 rounded px-2 py-1">
                <span className="font-medium">Shells:</span> {atomAccounting.shells.length} · <span className="font-medium">Valence:</span> {atomAccounting.valence}
                {controls.level !== 'beginner' && (
                  <span className="text-muted-foreground ml-2">Distribution: {atomAccounting.shellLabel}</span>
                )}
              </div>
            )}
            {bondAccounting && (
              <div className="text-[11px] text-foreground/80 bg-secondary/20 rounded px-2 py-1">
                <span className="font-medium">{bondAccounting.description}</span>
                {bondAccounting.showCounts && controls.level !== 'beginner' ? (
                  <span className="text-muted-foreground ml-2">
                    {bondAccounting.ionA.element.sym}: {bondAccounting.ionA.typicalCharge ?? '?'} · {bondAccounting.ionB.element.sym}: {bondAccounting.ionB.typicalCharge ?? '?'}
                  </span>
                ) : !bondAccounting.showCounts ? (
                  <span className="text-amber-400/80 ml-2 text-[10px]">Variable — depends on conditions</span>
                ) : null}
              </div>
            )}

            {/* Level notice */}
            {levelText && (
              <LevelNotice text={levelText} level={controls.level} showAssumptions={showAssumptions} />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
