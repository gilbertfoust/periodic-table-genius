import { useState, useMemo, useEffect } from 'react';
import { REACTIONS, type Reaction } from '@/data/reactions';
import { runStoichiometry, getExampleValues, type MixtureResult } from '@/utils/stoichiometry';
import type { SlotEntry } from '@/utils/synthesisEngine';
import type { PairAnalysis } from '@/utils/interactionPredictor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VisualOutcome } from './VisualOutcome';
import { SynthesisPanel } from './SynthesisPanel';

interface MixtureLabProps {
  prefillReactionId?: string | null;
  synthesisInput?: SlotEntry[] | null;
  primaryPair?: PairAnalysis | null;
  onViewIn3D?: (zs: number[]) => void;
  onSynthesisResult?: (result: import('@/utils/synthesisEngine').SynthesisResult | null) => void;
}

export function MixtureLab({ prefillReactionId, synthesisInput, primaryPair, onViewIn3D, onSynthesisResult }: MixtureLabProps) {
  const [rxnId, setRxnId] = useState(REACTIONS[0]?.id || '');
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [b1, setB1] = useState('');
  const [b2, setB2] = useState('');
  const [result, setResult] = useState<MixtureResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('curated');

  // Handle prefill from Combine Lab
  useEffect(() => {
    if (prefillReactionId && REACTIONS.find(r => r.id === prefillReactionId)) {
      setRxnId(prefillReactionId);
      const rxn = REACTIONS.find(r => r.id === prefillReactionId)!;
      const vals = getExampleValues(rxn);
      setA1(vals.a1); setA2(vals.a2); setB1(vals.b1); setB2(vals.b2);
      setResult(null);
      setActiveTab('curated');
    }
  }, [prefillReactionId]);

  // Handle synthesis input
  useEffect(() => {
    if (synthesisInput && synthesisInput.length >= 2) {
      setActiveTab('synthesis');
    }
  }, [synthesisInput]);

  const rxn = useMemo(() => REACTIONS.find(r => r.id === rxnId) || null, [rxnId]);
  const modeA = rxn?.A.mode || 'solution';
  const modeB = rxn?.B.mode || 'solution';

  const handleRun = () => {
    if (!rxn) return;
    setResult(runStoichiometry(rxn, a1, a2, b1, b2));
  };

  const handleExample = () => {
    if (!rxn) return;
    const vals = getExampleValues(rxn);
    setA1(vals.a1); setA2(vals.a2); setB1(vals.b1); setB2(vals.b2);
    setResult(null);
  };

  const handleReset = () => {
    setA1(''); setA2(''); setB1(''); setB2('');
    setResult(null);
  };

  const handleRxnChange = (id: string) => {
    setRxnId(id);
    setA1(''); setA2(''); setB1(''); setB2('');
    setResult(null);
  };

  return (
    <Card className="bg-card/80 backdrop-blur border-border mt-4">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <CardTitle className="text-sm">Mixture Lab</CardTitle>
        <Badge variant="outline" className="text-xs">v2: curated + synthesis</Badge>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-3">
            <TabsTrigger value="synthesis" className="text-xs">Synthesis</TabsTrigger>
            <TabsTrigger value="curated" className="text-xs">Curated Reactions</TabsTrigger>
          </TabsList>

          <TabsContent value="curated">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: inputs */}
              <div className="space-y-3">
                <select
                  value={rxnId}
                  onChange={e => handleRxnChange(e.target.value)}
                  className="w-full bg-secondary/40 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
                >
                  {REACTIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>

                {/* Reactant A */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs shrink-0">
                    A: {rxn?.A.display} (coeff {rxn?.A.coeff})
                  </Badge>
                  <Input
                    type="number" min="0" step="0.01"
                    placeholder={modeA === 'moles' ? 'Moles (mol)' : 'Molarity (M)'}
                    value={a1} onChange={e => setA1(e.target.value)}
                    className="w-32 bg-secondary/40"
                  />
                  {modeA === 'solution' && (
                    <Input
                      type="number" min="0" step="0.1"
                      placeholder="Volume (mL)"
                      value={a2} onChange={e => setA2(e.target.value)}
                      className="w-32 bg-secondary/40"
                    />
                  )}
                </div>

                {/* Reactant B */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs shrink-0">
                    B: {rxn?.B.display} (coeff {rxn?.B.coeff})
                  </Badge>
                  <Input
                    type="number" min="0" step="0.01"
                    placeholder={modeB === 'moles' ? 'Moles (mol)' : 'Molarity (M)'}
                    value={b1} onChange={e => setB1(e.target.value)}
                    className="w-32 bg-secondary/40"
                  />
                  {modeB === 'solution' && (
                    <Input
                      type="number" min="0" step="0.1"
                      placeholder="Volume (mL)"
                      value={b2} onChange={e => setB2(e.target.value)}
                      className="w-32 bg-secondary/40"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleRun} size="sm">Run mixture</Button>
                  <Button onClick={handleExample} variant="outline" size="sm">Example values</Button>
                  <Button onClick={handleReset} variant="outline" size="sm">Reset inputs</Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Inputs assume aqueous solutions. Covers: acid-base, precipitation, gas formation, and single-replacement redox.
                </p>
              </div>

              {/* Right: results */}
              <div className="border border-border rounded-2xl bg-secondary/10 p-3 space-y-3">
                <Badge variant="outline" className="text-xs">
                  {result?.badge || 'Choose a reaction and run the mixture.'}
                </Badge>
                <div className="font-mono text-xs text-foreground/92">
                  {result?.equation || 'Equation will appear here.'}
                </div>

                <VisualOutcome
                  visuals={rxn?.visuals ?? null}
                  vizScale={result?.vizScale ?? 0}
                  running={!!result && !result.error}
                />

                {result?.steps && result.steps.length > 0 && (
                  <div className="space-y-2">
                    {result.steps.map((s, i) => (
                      <div key={i} className="border border-border rounded-xl bg-background/40 p-2.5 text-xs text-foreground/88 leading-relaxed">
                        <strong>{s.title}:</strong> {s.text}
                      </div>
                    ))}
                  </div>
                )}

                {rxn?.notes && result && !result.error && (
                  <p className="text-[11px] text-muted-foreground">{rxn.notes}</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="synthesis">
            <SynthesisPanel
              initialSlots={synthesisInput ?? undefined}
              primaryPair={primaryPair ?? null}
              onViewIn3D={onViewIn3D}
              onSynthesisResult={onSynthesisResult}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
