import { useMemo } from 'react';
import { X } from 'lucide-react';
import { ELEMENT_BY_Z } from '@/data/elements';
import { ELEMENT_DETAILS } from '@/data/elementDetails';
import { ATOMIC_RADII } from '@/data/atomicRadii';
import { CATEGORY_COLORS } from '@/data/categoryColors';

interface Props {
  zPair: [number, number];
  onClose: () => void;
}

interface BarRow {
  label: string;
  unit: string;
  a: number | null;
  b: number | null;
  max: number;
}

function CompareBar({ label, unit, a, b, max, colorA, colorB }: BarRow & { colorA: string; colorB: string }) {
  const pctA = a != null ? (a / max) * 100 : 0;
  const pctB = b != null ? (b / max) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground/60 text-[10px]">{unit}</span>
      </div>
      <div className="flex items-center gap-2">
        {/* A bar (right-aligned, grows left) */}
        <div className="flex-1 flex justify-end">
          <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden relative">
            <div
              className="absolute right-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pctA}%`, backgroundColor: colorA }}
            />
          </div>
        </div>
        <div className="w-[70px] text-center flex items-center justify-between text-[11px] font-mono">
          <span className="text-foreground">{a != null ? a : '—'}</span>
          <span className="text-muted-foreground/40 mx-1">vs</span>
          <span className="text-foreground">{b != null ? b : '—'}</span>
        </div>
        {/* B bar (left-aligned, grows right) */}
        <div className="flex-1">
          <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden relative">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pctB}%`, backgroundColor: colorB }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ElementComparison({ zPair, onClose }: Props) {
  const [zA, zB] = zPair;
  const elA = ELEMENT_BY_Z.get(zA);
  const elB = ELEMENT_BY_Z.get(zB);
  const detA = ELEMENT_DETAILS[zA];
  const detB = ELEMENT_DETAILS[zB];

  const colorA = elA ? (CATEGORY_COLORS[elA.category] ?? '#9aa6c8') : '#9aa6c8';
  const colorB = elB ? (CATEGORY_COLORS[elB.category] ?? '#9aa6c8') : '#9aa6c8';

  const bars: BarRow[] = useMemo(() => {
    if (!elA || !elB) return [];
    const massA = detA ? parseFloat(detA.mass) : null;
    const massB = detB ? parseFloat(detB.mass) : null;
    const radA = ATOMIC_RADII[zA] ?? null;
    const radB = ATOMIC_RADII[zB] ?? null;

    return [
      { label: 'Atomic Number', unit: 'Z', a: zA, b: zB, max: Math.max(zA, zB, 1) },
      { label: 'Atomic Mass', unit: 'u', a: massA, b: massB, max: Math.max(massA ?? 0, massB ?? 0, 1) },
      { label: 'Electronegativity', unit: 'Pauling', a: elA.en, b: elB.en, max: Math.max(elA.en ?? 0, elB.en ?? 0, 0.1) },
      { label: 'Atomic Radius', unit: 'pm', a: radA, b: radB, max: Math.max(radA ?? 0, radB ?? 0, 1) },
      { label: 'Period', unit: '', a: elA.period, b: elB.period, max: Math.max(elA.period, elB.period, 1) },
      { label: 'Group', unit: '', a: elA.group, b: elB.group, max: Math.max(elA.group ?? 0, elB.group ?? 0, 1) },
    ];
  }, [zA, zB, elA, elB, detA, detB]);

  if (!elA || !elB) return null;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 w-[460px] max-w-[95%] animate-fade-in">
      <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-3">
            {/* Element A badge */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white shadow-inner"
                style={{ backgroundColor: colorA }}
              >
                {elA.sym}
              </span>
              <span className="text-sm font-bold text-foreground">{elA.name}</span>
            </div>

            <span className="text-xs text-muted-foreground font-bold">VS</span>

            {/* Element B badge */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white shadow-inner"
                style={{ backgroundColor: colorB }}
              >
                {elB.sym}
              </span>
              <span className="text-sm font-bold text-foreground">{elB.name}</span>
            </div>
          </div>

          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Bars */}
        <div className="px-4 pb-3 space-y-2.5">
          {bars.map(row => (
            <CompareBar key={row.label} {...row} colorA={colorA} colorB={colorB} />
          ))}
        </div>

        {/* Config row */}
        <div className="border-t border-border/30 px-4 py-2.5 grid grid-cols-2 gap-3 text-[10px]">
          <div>
            <div className="text-muted-foreground mb-0.5">e⁻ config</div>
            <div className="text-foreground font-mono leading-snug">{detA?.electronConfig ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-0.5">e⁻ config</div>
            <div className="text-foreground font-mono leading-snug">{detB?.electronConfig ?? '—'}</div>
          </div>
        </div>

        <div className="text-center text-[10px] text-muted-foreground/50 pb-2">
          Shift+Click two elements to compare
        </div>
      </div>
    </div>
  );
}
