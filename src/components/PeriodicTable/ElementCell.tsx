import { memo, useCallback } from 'react';
import type { Element } from '@/data/elements';
import type { OverlayMode } from '@/state/selectionStore';
import { CATEGORY_COLORS } from '@/data/categoryColors';
import { normalize, hslFromT } from '@/utils/elementHelpers';

interface ElementCellProps {
  element: Element;
  overlay: OverlayMode;
  isSelected: boolean;
  isDimmed: boolean;
  enMin: number;
  enMax: number;
  mini?: boolean;
  onClick: (Z: number, e: React.MouseEvent) => void;
  onTouchSelect?: (Z: number) => void;
}

export const ElementCell = memo(function ElementCell({
  element, overlay, isSelected, isDimmed, enMin, enMax, mini, onClick, onTouchSelect
}: ElementCellProps) {
  let bgStyle = 'rgba(255,255,255,0.04)';

  if (overlay === 'category') {
    const col = CATEGORY_COLORS[element.category] || '#9aa6c8';
    bgStyle = `linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)), linear-gradient(180deg, ${col}40, ${col}12)`;
  } else if (overlay === 'en' && typeof element.en === 'number') {
    const t = normalize(element.en, enMin, enMax);
    if (t !== null) {
      const col = hslFromT(t);
      bgStyle = `linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)), linear-gradient(180deg, ${col.replace(')', '/0.33)')}, ${col.replace(')', '/0.11)')})`;
    }
  }

  let overlayTag: string | null = null;
  if (overlay === 'an') overlayTag = `#${element.Z}`;
  if (overlay === 'group') overlayTag = element.group === null ? 'f' : `G${element.group}`;

  // On touch devices, use touchEnd to handle selection and suppress the
  // subsequent synthetic click to prevent double-firing.
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (onTouchSelect) {
      e.preventDefault();
      onTouchSelect(element.Z);
    }
  }, [onTouchSelect, element.Z]);

  return (
    <button
      onClick={(e) => onClick(element.Z, e)}
      onTouchEnd={onTouchSelect ? handleTouchEnd : undefined}
      className={`
        relative rounded-xl border text-left transition-all duration-150 cursor-pointer
        hover:-translate-y-0.5 hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring
        ${mini ? 'min-h-[56px] p-1.5' : 'min-h-[58px] p-2'}
        ${isSelected ? 'border-emerald-400/55 shadow-[inset_0_0_0_3px_rgba(102,240,166,0.15)]' : 'border-border'}
      `}
      style={{
        background: bgStyle,
        opacity: isDimmed ? 0.35 : 1,
      }}
      aria-label={`${element.name} (${element.sym})`}
    >
      <span className="absolute top-1.5 left-2 text-[10px] text-foreground/75">{element.Z}</span>
      <div className={`font-bold tracking-wide mt-2.5 ${mini ? 'text-base' : 'text-lg'}`}>
        {element.sym}
      </div>
      <div className="text-[10px] text-foreground/70 mt-0.5 truncate">{element.name}</div>
      {overlayTag && (
        <span className="absolute right-1.5 top-1.5 text-[10px] px-1.5 py-0.5 rounded-full border border-foreground/14 bg-background/20 text-foreground/85 backdrop-blur-sm">
          {overlayTag}
        </span>
      )}
    </button>
  );
});
