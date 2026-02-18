import { useCallback, useState, type ReactNode } from 'react';
import { X, Plus, MousePointer, Info, FlaskConical, Search } from 'lucide-react';
import { useSelection } from '@/state/selectionStore';
import { byZ, ELEMENTS } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

interface MoleculePreset {
  formula: string;
  name: string;
  zs: number[];       // atomic numbers in order (duplicates allowed)
  color: string;      // accent color for the chip
}

const MOLECULE_PRESETS: MoleculePreset[] = [
  { formula: 'H₂O',   name: 'Water',             zs: [1, 1, 8],       color: '#38bdf8' },
  { formula: 'CO₂',   name: 'Carbon dioxide',     zs: [6, 8, 8],       color: '#a3e635' },
  { formula: 'NH₃',   name: 'Ammonia',            zs: [7, 1, 1, 1],    color: '#c084fc' },
  { formula: 'CH₄',   name: 'Methane',            zs: [6, 1, 1, 1],    color: '#fb923c' },
  { formula: 'H₂O₂',  name: 'Hydrogen peroxide',  zs: [1, 1, 8, 8],    color: '#f472b6' },
  { formula: 'O₂',    name: 'Oxygen gas',         zs: [8, 8],          color: '#34d399' },
  { formula: 'N₂',    name: 'Nitrogen gas',       zs: [7, 7],          color: '#818cf8' },
  { formula: 'NaCl',  name: 'Table salt',         zs: [11, 17],        color: '#fbbf24' },
  { formula: 'HCl',   name: 'Hydrochloric acid',  zs: [1, 17],         color: '#f87171' },
  { formula: 'SO₂',   name: 'Sulfur dioxide',     zs: [16, 8, 8],      color: '#facc15' },
];

/** Parse a formula like "H2O2" or "C6H6" into an array of atomic numbers (capped at 4). */
function parseFormula(formula: string): number[] | null {
  const tokens = formula.trim().match(/([A-Z][a-z]?)(\d*)/g);
  if (!tokens) return null;
  const zs: number[] = [];
  for (const token of tokens) {
    const m = token.match(/^([A-Z][a-z]?)(\d*)$/);
    if (!m) continue;
    const [, sym, countStr] = m;
    const el = ELEMENTS.find(e => e.sym === sym);
    if (!el) return null; // unknown symbol → invalid
    const count = countStr ? parseInt(countStr, 10) : 1;
    for (let i = 0; i < count; i++) zs.push(el.Z);
  }
  if (zs.length === 0) return null;
  return zs.slice(0, 4); // cap at 4
}

export function SelectionTray({ onDemoScenario, children }: SelectionTrayProps) {
  const { selectedElements, removeElement, clearSelection, multiSelectMode, setMultiSelectMode, setSelectedElements } = useSelection();
  const [formulaInput, setFormulaInput] = useState('');
  const [formulaError, setFormulaError] = useState(false);

  const handleFormulaSubmit = useCallback(() => {
    const zs = parseFormula(formulaInput);
    if (!zs) { setFormulaError(true); return; }
    setFormulaError(false);
    setFormulaInput('');
    setSelectedElements(zs);
  }, [formulaInput, setSelectedElements]);

  const handleFormulaKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleFormulaSubmit();
    else if (formulaError) setFormulaError(false);
  }, [handleFormulaSubmit, formulaError]);

  const handleDemo = useCallback((demo: typeof DEMOS[number]) => {
    setSelectedElements(demo.zs);
    onDemoScenario?.(demo.key);
  }, [setSelectedElements, onDemoScenario]);

  const handlePreset = useCallback((preset: MoleculePreset) => {
    setSelectedElements(preset.zs);
  }, [setSelectedElements]);

  const activePreset = MOLECULE_PRESETS.find(p =>
    p.zs.length === selectedElements.length &&
    [...p.zs].sort().join(',') === [...selectedElements].sort().join(',')
  );


  return (
    <TooltipProvider delayDuration={300}>
    <div className="space-y-2 mt-3">
      {/* Molecule Presets */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FlaskConical className="h-3.5 w-3.5" />
          <span className="font-medium">Molecule presets</span>
          <span className="text-foreground/40">— click to explore in 3D</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MOLECULE_PRESETS.map(preset => {
            const isActive = activePreset?.formula === preset.formula;
            return (
              <Tooltip key={preset.formula}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handlePreset(preset)}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                    style={{
                      borderColor: isActive ? preset.color : `${preset.color}50`,
                      backgroundColor: isActive ? `${preset.color}25` : `${preset.color}10`,
                      color: isActive ? preset.color : `${preset.color}cc`,
                      boxShadow: isActive ? `0 0 8px ${preset.color}40` : 'none',
                    }}
                    aria-label={`Load ${preset.name}`}
                    aria-pressed={isActive}
                  >
                    {preset.formula}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-semibold">{preset.name}</p>
                  <p className="text-muted-foreground">{preset.zs.length} atom{preset.zs.length > 1 ? 's' : ''} • click to load</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Formula input */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          <span className="font-medium">Type a formula</span>
          <span className="text-foreground/40">— e.g. H2O, CH4, NH3, C2H6</span>
        </div>
        <div className="flex gap-2">
          <Input
            value={formulaInput}
            onChange={e => { setFormulaInput(e.target.value); setFormulaError(false); }}
            onKeyDown={handleFormulaKey}
            placeholder="e.g. H2O2"
            className={`h-8 text-sm font-mono max-w-[160px] ${formulaError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            aria-label="Enter a chemical formula"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={handleFormulaSubmit}
            disabled={!formulaInput.trim()}
          >
            Load
          </Button>
        </div>
        {formulaError && (
          <p className="text-xs text-destructive">Unknown formula — check element symbols and try again.</p>
        )}
      </div>

      {/* Multi-select hint banner */}
      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground/80">
        <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
        <span>
          <span className="font-semibold text-foreground">Select up to 4 elements</span> — pick the same element multiple times (e.g. H + H + O + O for H₂O₂).{' '}
          <span className="hidden sm:inline">Hold <kbd className="inline-flex items-center rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">Shift</kbd> + click to add, or enable <strong>Add mode</strong> below.</span>
          <span className="sm:hidden">Enable <strong>Add mode</strong> then tap each element to add it.</span>
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
          {selectedElements.map((Z, idx) => {
            const el = byZ(Z);
            if (!el) return null;
            const color = CATEGORY_COLORS[el.category] || '#9aa6c8';
            return (
              <Badge
                key={idx}
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
    </TooltipProvider>
  );
}
