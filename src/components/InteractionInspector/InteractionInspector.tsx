import { useMemo } from 'react';
import { useSelection } from '@/state/selectionStore';
import { byZ } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { analyzeSelection, type PairAnalysis, type Confidence } from '@/utils/interactionPredictor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Zap, ArrowRightLeft } from 'lucide-react';

const CONFIDENCE_STYLES: Record<Confidence, { bg: string; text: string; label: string }> = {
  likely:    { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400', label: 'Likely' },
  plausible: { bg: 'bg-amber-500/15 border-amber-500/30',   text: 'text-amber-400',   label: 'Plausible' },
  uncertain: { bg: 'bg-red-500/15 border-red-500/30',       text: 'text-red-400',      label: 'Uncertain' },
};

function PairCard({ pair }: { pair: PairAnalysis }) {
  const style = CONFIDENCE_STYLES[pair.bondConfidence];
  const colA = CATEGORY_COLORS[pair.a.category] || '#9aa6c8';
  const colB = CATEGORY_COLORS[pair.b.category] || '#9aa6c8';

  return (
    <div className={`border rounded-xl p-3 space-y-2.5 ${style.bg}`}>
      {/* Header: element pair */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: colA }}>{pair.a.sym}</span>
          <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-bold text-sm" style={{ color: colB }}>{pair.b.sym}</span>
        </div>
        <Badge variant="outline" className={`text-[11px] ${style.text}`}>
          {style.label}
        </Badge>
      </div>

      {/* EN delta + bond type */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-border/40 rounded-lg bg-background/30 p-2">
          <div className="text-[10px] text-muted-foreground mb-0.5">EN Delta</div>
          <div className="text-xs font-mono text-foreground">{pair.enDelta !== null ? pair.enDelta.toFixed(2) : 'n/a'}</div>
        </div>
        <div className="border border-border/40 rounded-lg bg-background/30 p-2">
          <div className="text-[10px] text-muted-foreground mb-0.5">Bond Type</div>
          <div className="text-xs text-foreground">{pair.bondType}</div>
        </div>
      </div>

      {/* Interaction type */}
      <div className="flex items-start gap-2">
        <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
        <span className="text-xs text-foreground/88">{pair.interactionType}</span>
      </div>

      {/* Ion tendencies */}
      <div className="grid grid-cols-2 gap-2">
        {[pair.ionA, pair.ionB].map(ion => (
          <div key={ion.element.Z} className="border border-border/30 rounded-lg bg-background/20 p-2">
            <div className="text-[10px] text-muted-foreground mb-0.5">{ion.element.sym} ion tendency</div>
            <div className="text-xs font-bold text-foreground">
              {ion.typicalCharge || 'unknown'}
              {ion.uncertain && <span className="text-amber-400 ml-1">⚠</span>}
            </div>
            <div className="text-[10px] text-foreground/70 mt-0.5">{ion.explanation}</div>
          </div>
        ))}
      </div>

      {/* Uncertainty flags */}
      {pair.uncertaintyFlags.length > 0 && (
        <div className="space-y-1">
          {pair.uncertaintyFlags.map((flag, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-400/90">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{flag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InteractionInspector() {
  const { selectedElements } = useSelection();

  const elements = useMemo(() =>
    selectedElements.map(Z => byZ(Z)).filter(Boolean) as NonNullable<ReturnType<typeof byZ>>[],
    [selectedElements]
  );

  const pairs = useMemo(() => analyzeSelection(elements), [elements]);

  if (elements.length < 2) {
    return (
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Interaction Inspector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed border-border rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Shift-click 2+ elements on the periodic table to see bond analysis, EN delta, and ion predictions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <CardTitle className="text-sm">Interaction Inspector</CardTitle>
        <Badge variant="outline" className="text-xs">
          {pairs.length} pair{pairs.length !== 1 ? 's' : ''} analyzed
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Analyzing pairwise interactions for: {elements.map(e => e.sym).join(', ')}
        </p>
        {pairs.map(pair => (
          <PairCard key={`${pair.a.Z}-${pair.b.Z}`} pair={pair} />
        ))}
      </CardContent>
    </Card>
  );
}
