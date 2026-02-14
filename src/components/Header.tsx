import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSelection } from '@/state/selectionStore';
import { findElement } from '@/utils/elementHelpers';

export function Header() {
  const { searchQuery, setSearchQuery, selectElement } = useSelection();

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const hit = findElement(value);
    if (hit && 'Z' in hit && hit.Z) {
      selectElement(hit.Z as number);
    }
  };

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Chemistry Learning Lab
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Explore periodic patterns, inspect any element (1-118), and practice prediction with guided tutoring.
        </p>
      </div>
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder="H, Oxygen, 8, halogen…"
          className="pl-9 bg-secondary/50 border-border"
        />
      </div>
    </header>
  );
}
