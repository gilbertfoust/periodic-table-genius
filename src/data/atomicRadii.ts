/**
 * Empirical atomic radii in picometers (pm).
 * Sources: Wikipedia / WebElements. null = no reliable data.
 * Used for 3D cube scaling in the periodic table visualization.
 */
export const ATOMIC_RADII: Record<number, number | null> = {
  1: 25, 2: 120,
  3: 145, 4: 105, 5: 85, 6: 70, 7: 65, 8: 60, 9: 50, 10: 160,
  11: 180, 12: 150, 13: 125, 14: 110, 15: 100, 16: 100, 17: 100, 18: 71,
  19: 220, 20: 180, 21: 160, 22: 140, 23: 135, 24: 140, 25: 140, 26: 140,
  27: 135, 28: 135, 29: 135, 30: 135, 31: 130, 32: 125, 33: 115, 34: 115,
  35: 115, 36: 88,
  37: 235, 38: 200, 39: 180, 40: 155, 41: 145, 42: 145, 43: 135, 44: 130,
  45: 135, 46: 140, 47: 160, 48: 155, 49: 155, 50: 145, 51: 145, 52: 140,
  53: 140, 54: 108,
  55: 260, 56: 215, 57: 195, 58: 185, 59: 185, 60: 185, 61: 185, 62: 185,
  63: 185, 64: 180, 65: 175, 66: 175, 67: 175, 68: 175, 69: 175, 70: 175,
  71: 175, 72: 155, 73: 145, 74: 135, 75: 135, 76: 130, 77: 135, 78: 135,
  79: 135, 80: 150, 81: 190, 82: 180, 83: 160, 84: 190, 85: null, 86: 120,
  87: null, 88: 215, 89: 195, 90: 180, 91: 180, 92: 175, 93: 175, 94: 175,
  95: 175, 96: null, 97: null, 98: null, 99: null, 100: null, 101: null,
  102: null, 103: null, 104: null, 105: null, 106: null, 107: null, 108: null,
  109: null, 110: null, 111: null, 112: null, 113: null, 114: null, 115: null,
  116: null, 117: null, 118: null,
};

// Min/max for normalization (excluding nulls)
const values = Object.values(ATOMIC_RADII).filter((v): v is number => v !== null);
export const RADIUS_MIN = Math.min(...values);
export const RADIUS_MAX = Math.max(...values);

/** Normalize radius to 0..1 range */
export function normalizeRadius(Z: number): number | null {
  const r = ATOMIC_RADII[Z];
  if (r == null) return null;
  return (r - RADIUS_MIN) / (RADIUS_MAX - RADIUS_MIN);
}
