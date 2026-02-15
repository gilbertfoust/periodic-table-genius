import { useState, useMemo } from 'react';
import { byZ } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { synthesize, formatFormula, type SlotEntry, type SynthesisResult } from '@/utils/synthesisEngine';
import type { PairAnalysis } from '@/utils/interactionPredictor';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Eye } from 'lucide-react';

const CLASS_LABELS: Record<string, string> = {
  ionic: 'Ionic solid',
  covalent: 'Covalent molecule',
  metallic: 'Metallic / alloy',
  uncertain: 'Uncertain',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  likely: 'text-emerald-400',
  plausible: 'text-amber-400',
  uncertain: 'text-red-400',
};

interface SynthesisPanelProps {
  initialSlots?: SlotEntry[];
  primaryPair: PairAnalysis | null;
  onViewIn3D?: (zs: number[]) => void;
}

export function SynthesisPanel({ initialSlots, primaryPair, onViewIn3D }: SynthesisPanelProps) {
  const [slots, setSlots] = useState<SlotEntry[]>(initialSlots ?? []);
  const [result, setResult] = useState<SynthesisResult | null>(null);

  // Sync initialSlots when they change
  useMemo(() => {
    if (initialSlots && initialSlots.length > 0) {
      setSlots(initialSlots);
      setResult(null);
    }
  }, [initialSlots]);

  const updateCount = (idx: number, delta: number) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, count: Math.max(1, Math.min(8, s.count + delta)) } : s));
    setResult(null);
  };

  const removeSlot = (idx: number) => {
    setSlots(prev => prev.filter((_, i) => i !== idx));
    setResult(null);
  };

  const handleSynthesize = () => {
    if (slots.length < 2) return;
    setResult(synthesize(slots, primaryPair));
  };

  const formula = formatFormula(slots);

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-muted-foreground font-medium">Formula Builder</div>

      {/* Slot rows */}
      <div className="space-y-1.5">
        {slots.map((slot, idx) => {
          const el = byZ(slot.Z);
          if (!el) return null;
          const color = CATEGORY_COLORS[el.category] || '#9aa6c8';
          return (
            <div key={idx} className="flex items-center gap-2 border border-border/30 rounded-lg bg-secondary/10 px-2.5 py-1.5">
              <span className="font-bold text-sm" style={{ color }}>{el.sym}</span>
              <span className="text-[10px] text-foreground/60 flex-1">{el.name}</span>
              <button onClick={() => updateCount(idx, -1)} disabled={slot.count <= 1}
                className="w-5 h-5 rounded flex items-center justify-center bg-secondary/40 hover:bg-secondary/60 disabled:opacity-30">
                <Minus className="h-3 w-3 text-muted-foreground" />
              </button>
              <span className="text-xs text-foreground w-4 text-center">{slot.count}</span>
              <button onClick={() => updateCount(idx, 1)} disabled={slot.count >= 8}
                className="w-5 h-5 rounded flex items-center justify-center bg-secondary/40 hover:bg-secondary/60 disabled:opacity-30">
                <Plus className="h-3 w-3 text-muted-foreground" />
              </button>
              <button onClick={() => removeSlot(idx)}
                className="text-muted-foreground hover:text-destructive ml-1 text-xs">✕</button>
            </div>
          );
        })}
      </div>

      {slots.length >= 2 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/80">Formula:</span>
          <span className="text-sm font-bold text-foreground">{formula}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSynthesize} size="sm" disabled={slots.length < 2}>Synthesize</Button>
        {result && onViewIn3D && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewIn3D(slots.map(s => s.Z))}
            className="gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            View in 3D
          </Button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="border border-border/40 rounded-xl bg-secondary/10 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">{CLASS_LABELS[result.classification]}</Badge>
            <Badge variant="outline" className={`text-[11px] ${CONFIDENCE_COLORS[result.confidence]}`}>
              {result.confidence}
            </Badge>
          </div>

          <div className="text-sm font-bold text-foreground">{result.formula}</div>

          {result.ionFormula && (
            <div className="text-xs text-foreground/80">
              <span className="font-medium">Proposed ionic formula:</span> {result.ionFormula}
            </div>
          )}

          {result.flags.length > 0 && (
            <div className="space-y-1">
              {result.flags.map((f, i) => (
                <div key={i} className="text-[10px] text-amber-400/80">⚠ {f}</div>
              ))}
            </div>
          )}

          {result.assumptionsNote && (
            <div className="text-[10px] text-amber-400/70 italic">{result.assumptionsNote}</div>
          )}
        </div>
      )}

      {slots.length < 2 && (
        <p className="text-[11px] text-muted-foreground">
          Use "Send to Synthesis" from Combine Lab, or build a formula above with 2+ elements.
        </p>
      )}
    </div>
  );
}
