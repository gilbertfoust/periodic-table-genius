import { useSelection } from '@/state/useSelectionStore';
import { CATEGORY_COLORS, CATEGORY_ORDER } from '@/data/categoryColors';

export function Legend() {
  const { activeOverlay } = useSelection();

  if (activeOverlay === 'category') {
    return (
      <div className="flex flex-wrap gap-2">
        {CATEGORY_ORDER.map(cat => (
          <div key={cat} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-secondary/30 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
            <span>{cat}</span>
          </div>
        ))}
      </div>
    );
  }

  const messages: Record<string, string> = {
    en: 'Overlay: electronegativity (color shows relative values where known; unknown values are neutral)',
    an: 'Overlay: atomic number shown as tag',
    group: 'Overlay: group shown as tag (f-block shows as "f")',
  };

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-secondary/30 text-xs text-muted-foreground">
      {messages[activeOverlay]}
    </div>
  );
}
