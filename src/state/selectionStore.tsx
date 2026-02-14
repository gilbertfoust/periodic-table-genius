import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';

export type OverlayMode = 'category' | 'en' | 'an' | 'group';

interface SelectionState {
  selectedElements: number[];
  activeOverlay: OverlayMode;
  searchQuery: string;
  multiSelectMode: boolean;
  selectElement: (Z: number, multi?: boolean) => void;
  removeElement: (Z: number) => void;
  clearSelection: () => void;
  setOverlay: (mode: OverlayMode) => void;
  setSearchQuery: (q: string) => void;
  setMultiSelectMode: (on: boolean) => void;
  setSelectedElements: (zs: number[]) => void;
}

const SelectionContext = createContext<SelectionState | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedElements, setSelectedElements] = useState<number[]>([8]);
  const [activeOverlay, setActiveOverlay] = useState<OverlayMode>('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [multiSelectMode, setMultiSelectMode] = useState(false);

  const selectElement = useCallback((Z: number, multi = false) => {
    setSelectedElements(prev => {
      if (multi) {
        if (prev.includes(Z)) return prev.filter(z => z !== Z);
        if (prev.length >= 6) return prev;
        return [...prev, Z];
      }
      return [Z];
    });
  }, []);

  const removeElement = useCallback((Z: number) => {
    setSelectedElements(prev => prev.filter(z => z !== Z));
  }, []);

  const clearSelection = useCallback(() => setSelectedElements([]), []);

  return (
    <SelectionContext.Provider value={{
      selectedElements,
      activeOverlay,
      searchQuery,
      multiSelectMode,
      selectElement,
      removeElement,
      clearSelection,
      setOverlay: setActiveOverlay,
      setSearchQuery,
      setMultiSelectMode,
      setSelectedElements,
    }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}
