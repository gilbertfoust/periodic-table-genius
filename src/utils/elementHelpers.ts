import { ELEMENTS, byZ, type Element } from '@/data/elements';
import { CATEGORY_COLORS } from '@/data/categoryColors';

export function clamp(x: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, x));
}

export function normalize(value: number | null, min: number, max: number): number | null {
  if (value === null || value === undefined) return null;
  if (max === min) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
}

export function hslFromT(t: number): string {
  const hue = 190 + (30 - 190) * t;
  const sat = 70;
  const lit = 42 + 12 * (1 - Math.abs(t - 0.5) * 2);
  return `hsl(${hue.toFixed(0)} ${sat}% ${lit.toFixed(0)}%)`;
}

export interface FindResult {
  Z?: number;
  __categoryFocus?: string;
  [key: string]: unknown;
}

export function findElement(query: string): (Element & { __categoryFocus?: string }) | FindResult | null {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return null;

  const asNum = Number(q);
  if (Number.isFinite(asNum) && asNum > 0) return byZ(asNum) || null;

  const catMatch = Object.keys(CATEGORY_COLORS).find(c => c.toLowerCase().includes(q));
  if (catMatch) return { __categoryFocus: catMatch };

  return ELEMENTS.find(e =>
    e.sym.toLowerCase() === q ||
    e.name.toLowerCase().includes(q)
  ) || null;
}

export function getEnRange(): { enMin: number; enMax: number } {
  const enValues = ELEMENTS.map(e => e.en).filter((v): v is number => typeof v === 'number');
  return {
    enMin: enValues.length ? Math.min(...enValues) : 0,
    enMax: enValues.length ? Math.max(...enValues) : 1,
  };
}

export function isElementMatch(e: Element, searchQuery: string, categoryFocus: string | null): boolean {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return true;
  if (categoryFocus) return e.category === categoryFocus;
  return (
    e.sym.toLowerCase().includes(q) ||
    e.name.toLowerCase().includes(q) ||
    String(e.Z) === q
  );
}
