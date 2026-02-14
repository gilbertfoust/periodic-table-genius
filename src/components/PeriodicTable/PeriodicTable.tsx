import { useMemo, useCallback } from 'react';
import { ELEMENTS } from '@/data/elements';
import { useSelection } from '@/state/selectionStore';
import { getEnRange, findElement, isElementMatch } from '@/utils/elementHelpers';
import { ElementCell } from './ElementCell';
import { OverlayToggle } from './OverlayToggle';
import { Legend } from './Legend';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function PeriodicTable() {
  const { selectedElements, activeOverlay, searchQuery, selectElement, multiSelectMode } = useSelection();
  const { enMin, enMax } = useMemo(() => getEnRange(), []);

  const categoryFocus = useMemo(() => {
    const hit = findElement(searchQuery);
    return hit && '__categoryFocus' in hit ? (hit.__categoryFocus as string) : null;
  }, [searchQuery]);

  const posMap = useMemo(() => {
    const map = new Map<string, typeof ELEMENTS[0]>();
    ELEMENTS.forEach(e => {
      if (e.group !== null && e.period !== null) {
        map.set(`${e.period}:${e.group}`, e);
      }
    });
    return map;
  }, []);

  const lanthanides = useMemo(() =>
    ELEMENTS.filter(e => e.category === 'lanthanide' && e.Z >= 57 && e.Z <= 71).sort((a, b) => a.Z - b.Z),
    []
  );
  const actinides = useMemo(() =>
    ELEMENTS.filter(e => e.category === 'actinide' && e.Z >= 89 && e.Z <= 103).sort((a, b) => a.Z - b.Z),
    []
  );

  const handleClick = useCallback((Z: number, e: React.MouseEvent) => {
    selectElement(Z, e.shiftKey || multiSelectMode);
  }, [selectElement, multiSelectMode]);

  const isDimmed = useCallback((el: typeof ELEMENTS[0]) => {
    return !isElementMatch(el, searchQuery, categoryFocus);
  }, [searchQuery, categoryFocus]);

  return (
    <Card className="bg-card/80 backdrop-blur border-border">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
        <CardTitle className="text-sm font-semibold">Periodic Table Explorer</CardTitle>
        <OverlayToggle />
      </CardHeader>
      <CardContent className="space-y-3">
        <Legend />

        {/* Main grid */}
        <div className="overflow-x-auto pb-2" aria-label="Scrollable periodic table">
          <div className="grid grid-cols-[repeat(18,minmax(34px,1fr))] gap-1.5 min-w-[980px]" aria-label="Periodic table grid">
            {Array.from({ length: 7 }, (_, pi) => pi + 1).flatMap(period =>
              Array.from({ length: 18 }, (_, gi) => gi + 1).map(group => {
                const e = posMap.get(`${period}:${group}`);
                if (!e) {
                  return (
                    <div key={`${period}:${group}`} className="min-h-[58px] rounded-xl border border-dashed border-border/30 bg-secondary/5" />
                  );
                }
                return (
                  <ElementCell
                    key={e.Z}
                    element={e}
                    overlay={activeOverlay}
                    isSelected={selectedElements.includes(e.Z)}
                    isDimmed={isDimmed(e)}
                    enMin={enMin}
                    enMax={enMax}
                    onClick={handleClick}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Lanthanides */}
        <div className="text-xs font-bold text-foreground/85 tracking-wide mt-2">Lanthanides (57-71)</div>
        <div className="overflow-x-auto pb-1">
          <div className="grid grid-cols-[repeat(15,minmax(34px,1fr))] gap-1.5 min-w-[820px]">
            {lanthanides.map(e => (
              <ElementCell
                key={e.Z}
                element={e}
                overlay={activeOverlay}
                isSelected={selectedElements.includes(e.Z)}
                isDimmed={isDimmed(e)}
                enMin={enMin}
                enMax={enMax}
                mini
                onClick={handleClick}
              />
            ))}
          </div>
        </div>

        {/* Actinides */}
        <div className="text-xs font-bold text-foreground/85 tracking-wide mt-2">Actinides (89-103)</div>
        <div className="overflow-x-auto pb-1">
          <div className="grid grid-cols-[repeat(15,minmax(34px,1fr))] gap-1.5 min-w-[820px]">
            {actinides.map(e => (
              <ElementCell
                key={e.Z}
                element={e}
                overlay={activeOverlay}
                isSelected={selectedElements.includes(e.Z)}
                isDimmed={isDimmed(e)}
                enMin={enMin}
                enMax={enMax}
                mini
                onClick={handleClick}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          Tip: on small screens, scroll the table left and right. Click any element to inspect it. Use the "Add mode" toggle or Shift-click to multi-select (up to 6).
        </p>
      </CardContent>
    </Card>
  );
}
