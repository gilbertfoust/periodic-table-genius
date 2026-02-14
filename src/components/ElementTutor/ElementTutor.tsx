import { useMemo, useState } from 'react';
import { useSelection } from '@/state/useSelectionStore';
import { byZ } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { safeGroupLabel, valenceElectrons, typicalIon, positionStory, generateQuiz, TREND_CARDS, type QuizQuestion } from '@/data/tutorContent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function QuizCard({ q }: { q: QuizQuestion }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const isCorrect = chosen === q.answer;

  return (
    <div className="border border-border rounded-xl bg-background/40 p-3 space-y-2">
      <div className="text-xs font-bold text-foreground/92">{q.title}</div>
      <div className="flex flex-col gap-2">
        {q.options.map(opt => (
          <label key={opt} className="flex items-start gap-2.5 text-xs text-foreground/88 cursor-pointer">
            <input
              type="radio"
              name={q.id}
              value={opt}
              checked={chosen === opt}
              onChange={() => { setChosen(opt); setChecked(false); }}
              className="mt-0.5"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          size="sm"
          onClick={() => setChecked(true)}
          className="text-xs h-7"
        >
          Check
        </Button>
        {checked && (
          <span className={`text-xs ${isCorrect ? 'text-emerald-400' : 'text-orange-400'}`}>
            {isCorrect ? `Correct. ${q.explain}` : `Not quite. Expected: ${q.answer}. ${q.explain}`}
          </span>
        )}
        {!checked && chosen === null && (
          <span className="text-xs text-muted-foreground">Pick an option first.</span>
        )}
      </div>
    </div>
  );
}

export function ElementTutor() {
  const { selectedElements, activeOverlay } = useSelection();
  const firstZ = selectedElements[0] ?? null;
  const element = firstZ ? byZ(firstZ) : null;

  const overlayName = activeOverlay === 'category' ? 'Category'
    : activeOverlay === 'en' ? 'Electronegativity'
    : activeOverlay === 'an' ? 'Atomic number'
    : 'Group';

  const story = useMemo(() => element ? positionStory(element) : null, [element]);
  const quiz = useMemo(() => element ? generateQuiz(element) : [], [element]);

  if (!element) {
    return (
      <Card className="bg-card/80 backdrop-blur border-border">
        <CardHeader>
          <CardTitle className="text-sm">Element Tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 border border-border rounded-2xl p-3 bg-secondary/20">
            <div className="w-14 h-14 rounded-2xl border border-border/40 bg-background/30 flex items-center justify-center text-xl font-extrabold text-muted-foreground">?</div>
            <div>
              <div className="text-sm font-bold">Select an element</div>
              <div className="text-xs text-muted-foreground">Category, group, and period</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ve = valenceElectrons(element);
  const ion = typicalIon(element);
  const color = CATEGORY_COLORS[element.category] || '#9aa6c8';

  const basics = [
    { k: 'Atomic number', v: String(element.Z) },
    { k: 'Symbol', v: element.sym },
    { k: 'Category', v: element.category },
    { k: 'Period', v: String(element.period) },
    { k: 'Group', v: safeGroupLabel(element) },
    { k: 'Valence electrons (rule)', v: ve === null ? 'n/a' : String(ve) },
    { k: 'Typical simple ion', v: ion === null ? 'n/a' : ion },
    { k: 'Electronegativity', v: typeof element.en === 'number' ? String(element.en) : 'n/a' },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <CardTitle className="text-sm">Element Tutor</CardTitle>
        <Badge variant="outline" className="text-xs">{element.sym} · {element.name}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Big element display */}
        <div className="flex items-center justify-between border border-border rounded-2xl p-3 bg-secondary/20">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl border flex items-center justify-center text-xl font-extrabold"
              style={{ borderColor: `${color}40`, background: `${color}18` }}
            >
              {element.sym}
            </div>
            <div>
              <div className="text-sm font-bold">{element.name} (Z={element.Z})</div>
              <div className="text-xs text-muted-foreground">{element.category} · group {safeGroupLabel(element)} · period {element.period}</div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">Overlay: {overlayName}</Badge>
        </div>

        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="basics" className="flex-1 text-xs">Basics</TabsTrigger>
            <TabsTrigger value="tutor" className="flex-1 text-xs">Tutor</TabsTrigger>
            <TabsTrigger value="practice" className="flex-1 text-xs">Practice</TabsTrigger>
          </TabsList>

          <TabsContent value="basics">
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              {basics.map(row => (
                <div key={row.k} className="border border-border rounded-xl bg-secondary/20 p-2.5">
                  <div className="text-[11px] text-muted-foreground mb-1">{row.k}</div>
                  <div className="text-sm text-foreground">{row.v}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tutor">
            {story && (
              <div className="space-y-3 mt-3">
                <div className="border border-border rounded-xl bg-secondary/20 p-3">
                  <div className="font-bold text-xs text-foreground/92 mb-2">How to read this element from the table</div>
                  <div className="text-xs text-foreground/88 space-y-2 leading-relaxed">
                    <p>{story.summary}</p>
                    <p><strong>Group meaning:</strong> {story.groupLabel}. {story.groupMeaning}</p>
                    <p><strong>Category meaning:</strong> {story.categoryMeaning}</p>
                    <p><strong>What you can predict quickly:</strong> {story.predict}</p>
                    <p><strong>Trend lens:</strong> {story.trends}</p>
                  </div>
                </div>

                <div className="border border-border rounded-xl bg-secondary/20 p-3">
                  <div className="font-bold text-xs text-foreground/92 mb-2">Electromagnetic and electron-structure lens</div>
                  <div className="text-xs text-foreground/88 space-y-2 leading-relaxed">
                    {story.interactions.map((line, i) => <p key={i}>{line}</p>)}
                    <p className="text-foreground/78 mt-2">If you compare this element with neighbors in the same group and period, you can often explain reactivity differences by changes in size (distance), shielding, and effective nuclear charge (attraction).</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {TREND_CARDS.map(card => (
                    <div key={card.k} className="border border-border rounded-xl bg-secondary/20 p-2.5">
                      <div className="text-[11px] text-muted-foreground mb-1">{card.k}</div>
                      <div className="text-xs text-foreground">{card.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="practice">
            <div className="space-y-3 mt-3">
              <p className="text-xs text-muted-foreground">Practice focuses on what you can predict from position and category. Check answers to see feedback.</p>
              {quiz.length > 0 ? (
                quiz.map(q => <QuizCard key={`${element.Z}-${q.id}`} q={q} />)
              ) : (
                <div className="border border-border rounded-xl bg-secondary/20 p-3 text-xs text-muted-foreground">
                  Practice questions are limited for this element category in v1. Try "Tutor" and use group/period comparisons with neighboring elements.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
