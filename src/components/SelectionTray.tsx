import { X } from 'lucide-react';
import { useSelection } from '@/state/useSelectionStore';
import { byZ } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { Badge } from '@/components/ui/badge';

export function SelectionTray() {
  const { selectedElements, removeElement, clearSelection } = useSelection();

  if (selectedElements.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
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
    </div>
  );
}
