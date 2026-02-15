import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelection } from '@/state/selectionStore';
import { byZ, type Element } from '@/data/elements';
import { REACTIONS } from '@/data/reactions';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { predictCombination, type Confidence, type CombinePrediction, type PairAnalysis } from '@/utils/interactionPredictor';
import { formatFormula, synthesize, type SlotEntry } from '@/utils/synthesisEngine';
import { lookupCompound } from '@/data/knownCompounds';
import { SynthesisVisualOutcome } from '@/components/MixtureLab/SynthesisVisualOutcome';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlaskConical, Send, X, Plus, Minus, Beaker, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';

const CONFIDENCE_STYLES: Record<Confidence, { border: string; text: string; label: string }> = {
  likely:    { border: 'border-emerald-500/40', text: 'text-emerald-400', label: 'Likely' },
  plausible: { border: 'border-amber-500/40',   text: 'text-amber-400',   label: 'Plausible' },
  uncertain: { border: 'border-red-500/40',     text: 'text-red-400',      label: 'Uncertain' },
};

interface CombineLabProps {
  onSendToMixtureLab?: (reactionId: string) => void;
  onSendToSynthesis?: (slots: SlotEntry[]) => void;
  onPredictionChange?: (prediction: CombinePrediction | null) => void;
  primaryPair?: PairAnalysis | null;
}

interface SlotState {
  Z: number | null;
  count: number;
}

export function CombineLab({ onSendToMixtureLab, onSendToSynthesis, onPredictionChange, primaryPair }: CombineLabProps) {
  const { selectedElements } = useSelection();
  const [slots, setSlots] = useState<SlotState[]>([{ Z: null, count: 1 }, { Z: null, count: 1 }]);

  const availableElements = useMemo(() =>
    selectedElements.map(Z => byZ(Z)).filter(Boolean) as Element[],
    [selectedElements]
  );

  const assignToSlot = useCallback((slotIndex: number, Z: number) => {
    setSlots(prev => {
      const next = [...prev];
      // Remove from any other slot
      const existingIdx = next.findIndex(s => s.Z === Z);
      if (existingIdx !== -1 && existingIdx !== slotIndex) next[existingIdx] = { ...next[existingIdx], Z: null, count: 1 };
      next[slotIndex] = { Z, count: next[slotIndex].count || 1 };
      return next;
    });
  }, []);

  const clearSlot = useCallback((slotIndex: number) => {
    setSlots(prev => {
      const next = [...prev];
      next[slotIndex] = { Z: null, count: 1 };
      return next;
    });
  }, []);

  const setCount = useCallback((slotIndex: number, delta: number) => {
    setSlots(prev => {
      const next = [...prev];
      const newCount = Math.max(1, Math.min(8, next[slotIndex].count + delta));
      next[slotIndex] = { ...next[slotIndex], count: newCount };
      return next;
    });
  }, []);

  const addSlot = useCallback(() => {
    setSlots(prev => prev.length < 4 ? [...prev, { Z: null, count: 1 }] : prev);
  }, []);

  const removeSlot = useCallback((index: number) => {
    setSlots(prev => prev.length > 2 ? prev.filter((_, i) => i !== index) : prev);
  }, []);

  const filledElements = useMemo(() =>
    slots.map(s => s.Z !== null ? byZ(s.Z) : null).filter(Boolean) as Element[],
    [slots]
  );

  const prediction = useMemo(() =>
    filledElements.length >= 2 ? predictCombination(filledElements, REACTIONS) : null,
    [filledElements]
  );

  const confidenceStyle = prediction ? CONFIDENCE_STYLES[prediction.confidence] : null;

  // Notify parent of prediction changes
  useEffect(() => {
    onPredictionChange?.(prediction);
  }, [prediction, onPredictionChange]);

  // Elements available for assignment (in selection but not yet in a slot)
  const unassigned = useMemo(() =>
    availableElements.filter(e => !slots.some(s => s.Z === e.Z)),
    [availableElements, slots]
  );

  // Build SlotEntry[] for synthesis
  const slotEntries = useMemo<SlotEntry[]>(() =>
    slots.filter(s => s.Z !== null).map(s => ({ Z: s.Z!, count: s.count })),
    [slots]
  );

  // Count-truth: when counts > 1 or 3+ atoms, headline = formatFormula, classification from synthesize
  const hasMultipleAtoms = slotEntries.some(s => s.count > 1) || slotEntries.length >= 3;
  const countAwareResult = useMemo(() => {
    if (hasMultipleAtoms && slotEntries.length >= 2) {
      return synthesize(slotEntries, primaryPair ?? null);
    }
    return null;
  }, [hasMultipleAtoms, slotEntries, primaryPair]);
  const headlineFormula = hasMultipleAtoms ? formatFormula(slotEntries) : null;

  // Known compound lookup (always check, even for count=1 pairs)
  const knownCompound = useMemo(() => {
    if (slotEntries.length >= 2) {
      return lookupCompound(slotEntries);
    }
    return null;
  }, [slotEntries]);

  // Formula display helper
  const subscript = (n: number) => {
    const subs = '₀₁₂₃₄₅₆₇₈₉';
    return String(n).split('').map(d => subs[parseInt(d)] || d).join('');
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          Combine Lab
        </CardTitle>
        <Badge variant="outline" className="text-xs">click-to-assign</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slots */}
        <div className="space-y-2">
          <div className="text-[11px] text-muted-foreground font-medium">Reactant slots ({slots.length}/4)</div>
          <div className="flex flex-wrap gap-2">
            {slots.map((slot, i) => {
              const el = slot.Z !== null ? byZ(slot.Z) : null;
              const color = el ? (CATEGORY_COLORS[el.category] || '#9aa6c8') : undefined;
              return (
                <div
                  key={i}
                  className={`relative min-w-[80px] h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                    el ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-secondary/10 hover:border-border'
                  }`}
                >
                  {el ? (
                    <>
                      <span className="font-bold text-lg" style={{ color }}>
                        {el.sym}{slot.count > 1 ? <span className="text-xs">{subscript(slot.count)}</span> : ''}
                      </span>
                      <span className="text-[10px] text-foreground/70">{el.name}</span>
                      {/* Count controls */}
                      <div className="flex items-center gap-1 mt-0.5">
                        <button
                          onClick={() => setCount(i, -1)}
                          className="w-4 h-4 rounded flex items-center justify-center bg-secondary/40 hover:bg-secondary/60 transition-colors"
                          disabled={slot.count <= 1}
                        >
                          <Minus className="h-2.5 w-2.5 text-muted-foreground" />
                        </button>
                        <span className="text-[10px] text-foreground/80 w-3 text-center">{slot.count}</span>
                        <button
                          onClick={() => setCount(i, 1)}
                          className="w-4 h-4 rounded flex items-center justify-center bg-secondary/40 hover:bg-secondary/60 transition-colors"
                          disabled={slot.count >= 8}
                        >
                          <Plus className="h-2.5 w-2.5 text-muted-foreground" />
                        </button>
                      </div>
                      <button
                        onClick={() => clearSlot(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive/80 flex items-center justify-center hover:bg-destructive transition-colors"
                        aria-label={`Remove ${el.name}`}
                      >
                        <X className="h-3 w-3 text-destructive-foreground" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs text-muted-foreground">Slot {i + 1}</span>
                      {slots.length > 2 && (
                        <button
                          onClick={() => removeSlot(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/30 transition-colors"
                          aria-label="Remove slot"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            {slots.length < 4 && (
              <button
                onClick={addSlot}
                className="min-w-[48px] h-20 rounded-xl border-2 border-dashed border-border/30 flex items-center justify-center hover:border-primary/30 transition-colors"
                aria-label="Add slot"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Available elements to assign */}
        {unassigned.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] text-muted-foreground font-medium">Click to assign:</div>
            <div className="flex flex-wrap gap-1.5">
              {unassigned.map(el => {
                const color = CATEGORY_COLORS[el.category] || '#9aa6c8';
                const firstEmpty = slots.findIndex(s => s.Z === null);
                return (
                  <button
                    key={el.Z}
                    onClick={() => firstEmpty !== -1 && assignToSlot(firstEmpty, el.Z)}
                    disabled={firstEmpty === -1}
                    className="px-2.5 py-1.5 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors text-xs font-medium disabled:opacity-30"
                    style={{ borderColor: `${color}40` }}
                  >
                    <span style={{ color }}>{el.sym}</span>
                    <span className="text-foreground/60 ml-1">{el.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {availableElements.length < 2 && (
          <div className="border border-dashed border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Shift-click 2+ elements on the periodic table, then assign them to slots above.
            </p>
          </div>
        )}

        {/* Prediction result */}
        {prediction && confidenceStyle && (
          <div className={`border rounded-xl p-3 space-y-2.5 ${confidenceStyle.border} bg-secondary/10`}>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-xs font-bold text-foreground/92">Predicted Outcome</div>
              <Badge variant="outline" className={`text-[11px] ${confidenceStyle.text}`}>
                {confidenceStyle.label}
              </Badge>
            </div>

            {/* Known Compound Match */}
            {knownCompound && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-bold text-foreground">{knownCompound.name}</span>
                  <span className="text-sm text-muted-foreground">({knownCompound.formula})</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Known Compound
                  </Badge>
                </div>

                {/* Mini visual outcome */}
                <SynthesisVisualOutcome visual={knownCompound.visual} mini />

                <p className="text-xs text-foreground/85 leading-relaxed">{knownCompound.description}</p>
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-[10px]">{knownCompound.classification}</Badge>
                  <Badge variant="outline" className="text-[10px] text-emerald-400">Likely</Badge>
                </div>
                {/* Did You Know */}
                <div className="border border-amber-500/20 rounded-lg bg-amber-500/5 p-2.5 flex gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-200/80 leading-relaxed">{knownCompound.didYouKnow}</p>
                </div>
                {/* Related Compounds */}
                {knownCompound.related.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" /> Related compounds
                    </div>
                    {knownCompound.related.map(rel => (
                      <div key={rel.key} className="border border-primary/15 rounded-lg bg-primary/5 p-2.5">
                        <span className="text-xs font-semibold text-primary">{rel.name} ({rel.formula})</span>
                        <p className="text-[11px] text-foreground/70 leading-relaxed mt-0.5">{rel.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fallback: formula + EN-based prediction when no known compound */}
            {!knownCompound && headlineFormula && (
              <p className="text-sm font-bold text-foreground">{headlineFormula}</p>
            )}
            {!knownCompound && !headlineFormula && (
              <p className="text-xs text-foreground/88 leading-relaxed">{prediction.predictedOutcome}</p>
            )}
            {!knownCompound && headlineFormula && countAwareResult && (
              <div className="flex gap-1.5 flex-wrap">
                <Badge variant="secondary" className="text-[10px]">{countAwareResult.classification}</Badge>
                <Badge variant="outline" className={`text-[10px] ${CONFIDENCE_STYLES[countAwareResult.confidence]?.text ?? ''}`}>
                  {CONFIDENCE_STYLES[countAwareResult.confidence]?.label ?? countAwareResult.confidence}
                </Badge>
              </div>
            )}
            {!knownCompound && headlineFormula && prediction.predictedOutcome && (
              <p className="text-[11px] text-muted-foreground">Bond tendency: {prediction.predictedOutcome}</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="border border-border/30 rounded-lg bg-background/20 p-2">
                <div className="text-[10px] text-muted-foreground mb-0.5">Reaction Type</div>
                <div className="text-xs text-foreground">{prediction.reactionType}</div>
              </div>
              <div className="border border-border/30 rounded-lg bg-background/20 p-2">
                <div className="text-[10px] text-muted-foreground mb-0.5">Confidence</div>
                <div className={`text-xs font-medium ${knownCompound ? 'text-emerald-400' : confidenceStyle.text}`}>
                  {knownCompound ? 'Likely' : confidenceStyle.label}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-foreground/75 leading-relaxed">{prediction.explanation}</p>

            {/* Send to Mixture Lab or Synthesis */}
            <div className="flex flex-col gap-2">
              {prediction.matchedReactionId && onSendToMixtureLab && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendToMixtureLab(prediction.matchedReactionId!)}
                  className="w-full gap-2 text-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send to Curated Reaction
                </Button>
              )}
              {onSendToSynthesis && (
                <Button
                  size="sm"
                  onClick={() => onSendToSynthesis(slotEntries)}
                  className="w-full gap-2 text-xs"
                >
                  <Beaker className="h-3.5 w-3.5" />
                  Send to Synthesis
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
