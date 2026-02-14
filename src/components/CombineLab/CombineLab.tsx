import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelection } from '@/state/selectionStore';
import { byZ, type Element } from '@/data/elements';
import { REACTIONS } from '@/data/reactions';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { predictCombination, type Confidence, type CombinePrediction } from '@/utils/interactionPredictor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlaskConical, Send, X, Plus } from 'lucide-react';

const CONFIDENCE_STYLES: Record<Confidence, { border: string; text: string; label: string }> = {
  likely:    { border: 'border-emerald-500/40', text: 'text-emerald-400', label: 'Likely' },
  plausible: { border: 'border-amber-500/40',   text: 'text-amber-400',   label: 'Plausible' },
  uncertain: { border: 'border-red-500/40',     text: 'text-red-400',      label: 'Uncertain' },
};

interface CombineLabProps {
  onSendToMixtureLab?: (reactionId: string) => void;
  onPredictionChange?: (prediction: CombinePrediction | null) => void;
}

export function CombineLab({ onSendToMixtureLab, onPredictionChange }: CombineLabProps) {
  const { selectedElements } = useSelection();
  const [slots, setSlots] = useState<(number | null)[]>([null, null]);

  const availableElements = useMemo(() =>
    selectedElements.map(Z => byZ(Z)).filter(Boolean) as Element[],
    [selectedElements]
  );

  const assignToSlot = useCallback((slotIndex: number, Z: number) => {
    setSlots(prev => {
      const next = [...prev];
      // Remove from any other slot
      const existingIdx = next.indexOf(Z);
      if (existingIdx !== -1) next[existingIdx] = null;
      next[slotIndex] = Z;
      return next;
    });
  }, []);

  const clearSlot = useCallback((slotIndex: number) => {
    setSlots(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  }, []);

  const addSlot = useCallback(() => {
    setSlots(prev => prev.length < 4 ? [...prev, null] : prev);
  }, []);

  const removeSlot = useCallback((index: number) => {
    setSlots(prev => prev.length > 2 ? prev.filter((_, i) => i !== index) : prev);
  }, []);

  const filledElements = useMemo(() =>
    slots.map(Z => Z !== null ? byZ(Z) : null).filter(Boolean) as Element[],
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
    availableElements.filter(e => !slots.includes(e.Z)),
    [availableElements, slots]
  );

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
            {slots.map((Z, i) => {
              const el = Z !== null ? byZ(Z) : null;
              const color = el ? (CATEGORY_COLORS[el.category] || '#9aa6c8') : undefined;
              return (
                <div
                  key={i}
                  className={`relative min-w-[80px] h-16 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                    el ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-secondary/10 hover:border-border'
                  }`}
                >
                  {el ? (
                    <>
                      <span className="font-bold text-lg" style={{ color }}>{el.sym}</span>
                      <span className="text-[10px] text-foreground/70">{el.name}</span>
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
                className="min-w-[48px] h-16 rounded-xl border-2 border-dashed border-border/30 flex items-center justify-center hover:border-primary/30 transition-colors"
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
                const firstEmpty = slots.findIndex(s => s === null);
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

            <p className="text-xs text-foreground/88 leading-relaxed">{prediction.predictedOutcome}</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="border border-border/30 rounded-lg bg-background/20 p-2">
                <div className="text-[10px] text-muted-foreground mb-0.5">Reaction Type</div>
                <div className="text-xs text-foreground">{prediction.reactionType}</div>
              </div>
              <div className="border border-border/30 rounded-lg bg-background/20 p-2">
                <div className="text-[10px] text-muted-foreground mb-0.5">Confidence</div>
                <div className={`text-xs font-medium ${confidenceStyle.text}`}>{confidenceStyle.label}</div>
              </div>
            </div>

            <p className="text-[11px] text-foreground/75 leading-relaxed">{prediction.explanation}</p>

            {/* Send to Mixture Lab */}
            {prediction.matchedReactionId && onSendToMixtureLab ? (
              <Button
                size="sm"
                onClick={() => onSendToMixtureLab(prediction.matchedReactionId!)}
                className="w-full gap-2 text-xs"
              >
                <Send className="h-3.5 w-3.5" />
                Send to Mixture Lab
              </Button>
            ) : prediction.matchedReactionId === null ? (
              <div className="border border-border/30 rounded-lg bg-background/20 p-2 text-center">
                <p className="text-[11px] text-muted-foreground">
                  This combination doesn't match a curated reaction. The prediction above is theoretical only.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
