import { useSelection, type OverlayMode } from '@/state/useSelectionStore';

const OVERLAYS: { mode: OverlayMode; label: string }[] = [
  { mode: 'category', label: 'Category' },
  { mode: 'en', label: 'Electronegativity' },
  { mode: 'an', label: 'Atomic #' },
  { mode: 'group', label: 'Group' },
];

export function OverlayToggle() {
  const { activeOverlay, setOverlay } = useSelection();

  return (
    <div className="flex flex-wrap gap-2">
      {OVERLAYS.map(o => (
        <button
          key={o.mode}
          onClick={() => setOverlay(o.mode)}
          className={`
            px-3 py-1.5 rounded-full text-xs font-medium border transition-all
            ${activeOverlay === o.mode
              ? 'bg-emerald-400/14 border-emerald-400/35 text-foreground'
              : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary/60'
            }
          `}
          aria-pressed={activeOverlay === o.mode}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
