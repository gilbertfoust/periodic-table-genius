import { useCallback, type ReactNode } from 'react';
import { X, Plus, MousePointer, Info } from 'lucide-react';
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

export type DemoKey = 'ionic' | 'covalent' | 'precip' | 'hcl_polar' | 'na_o_ionic' | 'fe_o_uncertain';

interface SelectionTrayProps {
  onDemoScenario?: (scenario: DemoKey) => void;
  children?: ReactNode;
}

const DEMOS: { key: DemoKey; label: string; zs: number[] }[] = [
  { key: 'ionic', label: 'Na + Cl → Ionic bond', zs: [11, 17] },
  { key: 'covalent', label: 'C + O → Polar covalent', zs: [6, 8] },
  { key: 'precip', label: 'Ag + Cl → Precipitation (lattice)', zs: [47, 17] },
  { key: 'hcl_polar', label: 'H + Cl → Polar covalent (dipole)', zs: [1, 17] },
  { key: 'na_o_ionic', label: 'Na + O → Ionic tendency', zs: [11, 8] },
  { key: 'fe_o_uncertain', label: 'Fe + O → Uncertain', zs: [26, 8] },
];

export function SelectionTray({ onDemoScenario, children }: SelectionTrayProps) {
  const { selectedElements, removeElement, clearSelection, multiSelectMode, setMultiSelectMode, setSelectedElements } = useSelection();

  const handleDemo = useCallback((demo: typeof DEMOS[number]) => {
    setSelectedElements(demo.zs);
    onDemoScenario?.(demo.key);
  }, [setSelectedElements, onDemoScenario]);

  return (
    <div className="space-y-2 mt-3">
      {/* Multi-select hint banner */}
      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground/80">
        <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
        <span>
          <span className="font-semibold text-foreground">Select up to 4 elements</span> to explore bonds & molecules in 3D.{' '}
          <span className="hidden sm:inline">On desktop, hold <kbd className="inline-flex items-center rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">Shift</kbd> + click, or turn on <strong>Add mode</strong> below.</span>
          <span className="sm:hidden">On mobile, simply tap each element to add it.</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
            Tutorial presets
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

      {/* Lab Workbook launcher (passed as children) */}
      {children}

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
    </div>
  );
}
