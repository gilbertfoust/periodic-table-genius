import { useCallback } from 'react';
import { X, Plus, MousePointer } from 'lucide-react';
import { useSelection } from '@/state/selectionStore';
import { byZ } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SelectionTrayProps {
  onDemoScenario?: (scenario: 'ionic' | 'covalent' | 'precip') => void;
}

const DEMOS = [
  { key: 'ionic' as const, label: 'Na + Cl → Ionic bond', zs: [11, 17] },
  { key: 'covalent' as const, label: 'C + O → Polar covalent', zs: [6, 8] },
  { key: 'precip' as const, label: 'Ag + Cl → Precipitation (lattice)', zs: [47, 17] },
];

export function SelectionTray({ onDemoScenario }: SelectionTrayProps) {
  const { selectedElements, removeElement, clearSelection, multiSelectMode, setMultiSelectMode, setSelectedElements } = useSelection();

  const handleDemo = useCallback((demo: typeof DEMOS[number]) => {
    setSelectedElements(demo.zs);
    onDemoScenario?.(demo.key);
  }, [setSelectedElements, onDemoScenario]);

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {/* Multi-select toggle */}
      <Button
        variant={multiSelectMode ? 'default' : 'outline'}
        size="sm"
        className="h-7 gap-1.5 text-xs"
        onClick={() => setMultiSelectMode(!multiSelectMode)}
      >
        {multiSelectMode ? <MousePointer className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        {multiSelectMode ? 'Add mode ON' : 'Add mode'}
      </Button>

      {/* Demo scenarios */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Demo scenarios
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-popover border-border z-50">
          {DEMOS.map(d => (
            <DropdownMenuItem key={d.key} onClick={() => handleDemo(d)} className="text-xs cursor-pointer">
              {d.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selected element badges */}
      {selectedElements.length > 0 && (
        <>
          <span className="text-xs text-muted-foreground font-medium">Selected:</span>
          {selectedElements.map(Z => {
            const el = byZ(Z);
            if (!el) return null;
            const color = CATEGORY_COLORS[el.category] || '#9aa6c8';
            return (
              <Badge
                key={Z}
                variant="outline"
                className="gap-1.5 px-2 py-1 cursor-default"
                style={{ borderColor: `${color}55`, background: `${color}15` }}
              >
                <span className="font-bold">{el.sym}</span>
                <span className="text-foreground/70">{el.name}</span>
                <button
                  onClick={() => removeElement(Z)}
                  className="ml-1 hover:text-destructive transition-colors"
                  aria-label={`Remove ${el.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {selectedElements.length > 1 && (
            <button onClick={clearSelection} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear all
            </button>
          )}
        </>
      )}
    </div>
  );
}
