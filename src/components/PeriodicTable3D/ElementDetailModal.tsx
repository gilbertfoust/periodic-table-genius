import { useMemo } from 'react';
import { X, Atom, FlaskConical, History, Dna, Thermometer, Flame, Weight, Zap } from 'lucide-react';
import { ELEMENT_BY_Z } from '@/data/elements';
import { ELEMENT_DETAILS } from '@/data/elementDetails';
import { ATOMIC_RADII } from '@/data/atomicRadii';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { ELEMENT_EXTENDED } from '@/data/elementExtended';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  Z: number;
  onClose: () => void;
}

function StatCard({ icon: Icon, label, value, unit }: { icon: typeof Atom; label: string; value: string | number | null | undefined; unit?: string }) {
  return (
    <div className="bg-muted/30 rounded-xl px-3 py-2.5 space-y-0.5">
      <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="text-sm font-mono font-bold text-foreground">
        {value != null ? `${value}${unit ? ` ${unit}` : ''}` : '—'}
      </div>
    </div>
  );
}

export function ElementDetailModal({ Z, onClose }: Props) {
  const el = ELEMENT_BY_Z.get(Z);
  const detail = ELEMENT_DETAILS[Z];
  const radius = ATOMIC_RADII[Z];
  const ext = ELEMENT_EXTENDED[Z];
  const catColor = el ? (CATEGORY_COLORS[el.category] ?? '#9aa6c8') : '#666';

  if (!el) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-[520px] max-w-[95vw] max-h-[85vh] bg-card/98 backdrop-blur-2xl border border-border/60 rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero header */}
        <div
          className="relative px-6 pt-6 pb-4"
          style={{ background: `linear-gradient(135deg, ${catColor}22, transparent 70%)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            {/* Big symbol badge */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
              style={{ backgroundColor: catColor }}
            >
              {el.sym}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground font-mono">#{el.Z}</div>
              <h2 className="text-xl font-black text-foreground leading-tight">{el.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground bg-muted/20">
                  {el.category}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground bg-muted/20">
                  {detail?.state ?? 'unknown'} at STP
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground bg-muted/20">
                  Period {el.period} · Group {el.group ?? 'f-block'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(85vh-130px)]">
          <div className="px-6 pb-6 space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <StatCard icon={Weight} label="Atomic Mass" value={detail?.mass} unit="u" />
              <StatCard icon={Zap} label="Electronegativity" value={el.en} unit="Pauling" />
              <StatCard icon={Atom} label="Atomic Radius" value={radius} unit="pm" />
              <StatCard icon={Thermometer} label="Melting Point" value={ext?.meltingPoint} unit="°C" />
              <StatCard icon={Flame} label="Boiling Point" value={ext?.boilingPoint} unit="°C" />
              <StatCard icon={Weight} label="Density" value={ext?.density} unit="g/cm³" />
            </div>

            {/* Electron configuration */}
            <div className="bg-muted/20 rounded-xl px-4 py-3 border border-border/20">
              <div className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1.5">
                <Dna className="h-3 w-3" /> Electron Configuration
              </div>
              <div className="text-sm font-mono text-foreground">{detail?.electronConfig ?? '—'}</div>
              {ext?.ionizationEnergy && (
                <div className="text-[11px] text-muted-foreground mt-1">
                  1st ionization energy: <span className="font-mono text-foreground">{ext.ionizationEnergy} kJ/mol</span>
                </div>
              )}
            </div>

            {/* Discovery */}
            {ext && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-primary" /> Discovery
                </h3>
                <div className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">{ext.discoveredBy}</span>
                  {' · '}{ext.discoveryYear}
                  {ext.discoveryNote && <span className="block text-[11px] mt-0.5">{ext.discoveryNote}</span>}
                </div>
              </div>
            )}

            {/* Uses */}
            {ext?.uses && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FlaskConical className="h-3.5 w-3.5 text-primary" /> Common Uses
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {ext.uses.map(use => (
                    <span key={use} className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/10 text-foreground border border-primary/20">
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Isotopes */}
            {ext?.isotopes && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Atom className="h-3.5 w-3.5 text-primary" /> Isotopes
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {ext.isotopes.map((iso, i) => (
                    <div key={i} className="flex items-center gap-3 text-[11px] bg-muted/20 rounded-lg px-3 py-1.5">
                      <span className="font-mono font-bold text-foreground w-16">{iso.mass.toFixed(3)}</span>
                      {iso.name && <span className="text-primary font-medium">{iso.name}</span>}
                      <span className="ml-auto text-muted-foreground">{iso.abundance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fun fact */}
            {ext?.funFact && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-foreground">
                <span className="text-primary font-bold">💡 </span>
                {ext.funFact}
              </div>
            )}

            {/* Fallback for elements without extended data */}
            {!ext && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Extended data (discovery, uses, isotopes) coming soon for {el.name}.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
