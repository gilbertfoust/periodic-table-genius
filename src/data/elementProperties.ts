/**
 * Physical properties for all 118 elements.
 * Sources: IUPAC, WebElements, PubChem.
 * null = unknown / not applicable.
 */
export interface ElementPhysicalProps {
  meltingPoint: number | null;   // °C
  density: number | null;        // g/cm³ (at STP for gases, liquid for Hg/Br)
  ionizationEnergy: number | null; // kJ/mol (1st ionization)
}

export const ELEMENT_PROPERTIES: Record<number, ElementPhysicalProps> = {
  1:  { meltingPoint: -259.16, density: 0.00009, ionizationEnergy: 1312 },
  2:  { meltingPoint: null, density: 0.00018, ionizationEnergy: 2372 },
  3:  { meltingPoint: 180.5, density: 0.534, ionizationEnergy: 520 },
  4:  { meltingPoint: 1287, density: 1.85, ionizationEnergy: 900 },
  5:  { meltingPoint: 2075, density: 2.34, ionizationEnergy: 801 },
  6:  { meltingPoint: 3550, density: 2.27, ionizationEnergy: 1087 },
  7:  { meltingPoint: -210, density: 0.00125, ionizationEnergy: 1402 },
  8:  { meltingPoint: -218.8, density: 0.00143, ionizationEnergy: 1314 },
  9:  { meltingPoint: -219.6, density: 0.0017, ionizationEnergy: 1681 },
  10: { meltingPoint: -248.6, density: 0.0009, ionizationEnergy: 2081 },
  11: { meltingPoint: 97.8, density: 0.97, ionizationEnergy: 496 },
  12: { meltingPoint: 650, density: 1.74, ionizationEnergy: 738 },
  13: { meltingPoint: 660.3, density: 2.7, ionizationEnergy: 578 },
  14: { meltingPoint: 1414, density: 2.33, ionizationEnergy: 786 },
  15: { meltingPoint: 44.15, density: 1.82, ionizationEnergy: 1012 },
  16: { meltingPoint: 115.2, density: 2.07, ionizationEnergy: 1000 },
  17: { meltingPoint: -101.5, density: 0.0032, ionizationEnergy: 1251 },
  18: { meltingPoint: -189.3, density: 0.0018, ionizationEnergy: 1521 },
  19: { meltingPoint: 63.5, density: 0.86, ionizationEnergy: 419 },
  20: { meltingPoint: 842, density: 1.55, ionizationEnergy: 590 },
  21: { meltingPoint: 1541, density: 2.99, ionizationEnergy: 633 },
  22: { meltingPoint: 1668, density: 4.51, ionizationEnergy: 659 },
  23: { meltingPoint: 1910, density: 6.11, ionizationEnergy: 651 },
  24: { meltingPoint: 1907, density: 7.19, ionizationEnergy: 653 },
  25: { meltingPoint: 1246, density: 7.44, ionizationEnergy: 717 },
  26: { meltingPoint: 1538, density: 7.87, ionizationEnergy: 762 },
  27: { meltingPoint: 1495, density: 8.9, ionizationEnergy: 760 },
  28: { meltingPoint: 1455, density: 8.91, ionizationEnergy: 737 },
  29: { meltingPoint: 1085, density: 8.96, ionizationEnergy: 745 },
  30: { meltingPoint: 419.5, density: 7.13, ionizationEnergy: 906 },
  31: { meltingPoint: 29.76, density: 5.91, ionizationEnergy: 579 },
  32: { meltingPoint: 938.3, density: 5.32, ionizationEnergy: 762 },
  33: { meltingPoint: 817, density: 5.73, ionizationEnergy: 947 },
  34: { meltingPoint: 221, density: 4.81, ionizationEnergy: 941 },
  35: { meltingPoint: -7.2, density: 3.12, ionizationEnergy: 1140 },
  36: { meltingPoint: -157.4, density: 0.0037, ionizationEnergy: 1351 },
  37: { meltingPoint: 39.3, density: 1.53, ionizationEnergy: 403 },
  38: { meltingPoint: 777, density: 2.64, ionizationEnergy: 550 },
  39: { meltingPoint: 1522, density: 4.47, ionizationEnergy: 600 },
  40: { meltingPoint: 1855, density: 6.51, ionizationEnergy: 640 },
  41: { meltingPoint: 2477, density: 8.57, ionizationEnergy: 652 },
  42: { meltingPoint: 2623, density: 10.28, ionizationEnergy: 684 },
  43: { meltingPoint: 2157, density: 11.5, ionizationEnergy: 702 },
  44: { meltingPoint: 2334, density: 12.37, ionizationEnergy: 710 },
  45: { meltingPoint: 1964, density: 12.41, ionizationEnergy: 720 },
  46: { meltingPoint: 1555, density: 12.02, ionizationEnergy: 804 },
  47: { meltingPoint: 961.8, density: 10.49, ionizationEnergy: 731 },
  48: { meltingPoint: 321.1, density: 8.65, ionizationEnergy: 868 },
  49: { meltingPoint: 156.6, density: 7.31, ionizationEnergy: 558 },
  50: { meltingPoint: 231.9, density: 7.29, ionizationEnergy: 709 },
  51: { meltingPoint: 630.6, density: 6.69, ionizationEnergy: 834 },
  52: { meltingPoint: 449.5, density: 6.24, ionizationEnergy: 869 },
  53: { meltingPoint: 113.7, density: 4.93, ionizationEnergy: 1008 },
  54: { meltingPoint: -111.7, density: 0.0059, ionizationEnergy: 1170 },
  55: { meltingPoint: 28.4, density: 1.87, ionizationEnergy: 376 },
  56: { meltingPoint: 727, density: 3.51, ionizationEnergy: 503 },
  57: { meltingPoint: 920, density: 6.15, ionizationEnergy: 538 },
  58: { meltingPoint: 798, density: 6.77, ionizationEnergy: 534 },
  59: { meltingPoint: 931, density: 6.77, ionizationEnergy: 527 },
  60: { meltingPoint: 1016, density: 7.01, ionizationEnergy: 533 },
  61: { meltingPoint: 1042, density: 7.26, ionizationEnergy: 540 },
  62: { meltingPoint: 1074, density: 7.52, ionizationEnergy: 545 },
  63: { meltingPoint: 822, density: 5.24, ionizationEnergy: 547 },
  64: { meltingPoint: 1313, density: 7.9, ionizationEnergy: 593 },
  65: { meltingPoint: 1356, density: 8.23, ionizationEnergy: 566 },
  66: { meltingPoint: 1412, density: 8.55, ionizationEnergy: 573 },
  67: { meltingPoint: 1474, density: 8.8, ionizationEnergy: 581 },
  68: { meltingPoint: 1529, density: 9.07, ionizationEnergy: 589 },
  69: { meltingPoint: 1545, density: 9.32, ionizationEnergy: 597 },
  70: { meltingPoint: 819, density: 6.9, ionizationEnergy: 603 },
  71: { meltingPoint: 1663, density: 9.84, ionizationEnergy: 524 },
  72: { meltingPoint: 2233, density: 13.31, ionizationEnergy: 659 },
  73: { meltingPoint: 3017, density: 16.65, ionizationEnergy: 761 },
  74: { meltingPoint: 3422, density: 19.25, ionizationEnergy: 770 },
  75: { meltingPoint: 3186, density: 21.02, ionizationEnergy: 760 },
  76: { meltingPoint: 3033, density: 22.59, ionizationEnergy: 840 },
  77: { meltingPoint: 2446, density: 22.56, ionizationEnergy: 880 },
  78: { meltingPoint: 1768.3, density: 21.45, ionizationEnergy: 870 },
  79: { meltingPoint: 1064.2, density: 19.3, ionizationEnergy: 890 },
  80: { meltingPoint: -38.8, density: 13.55, ionizationEnergy: 1007 },
  81: { meltingPoint: 304, density: 11.85, ionizationEnergy: 589 },
  82: { meltingPoint: 327.5, density: 11.34, ionizationEnergy: 716 },
  83: { meltingPoint: 271.4, density: 9.78, ionizationEnergy: 703 },
  84: { meltingPoint: 254, density: 9.2, ionizationEnergy: 812 },
  85: { meltingPoint: 302, density: null, ionizationEnergy: 920 },
  86: { meltingPoint: -71, density: 0.0097, ionizationEnergy: 1037 },
  87: { meltingPoint: 27, density: 1.87, ionizationEnergy: 380 },
  88: { meltingPoint: 700, density: 5.5, ionizationEnergy: 509 },
  89: { meltingPoint: 1050, density: 10.07, ionizationEnergy: 499 },
  90: { meltingPoint: 1750, density: 11.72, ionizationEnergy: 587 },
  91: { meltingPoint: 1572, density: 15.37, ionizationEnergy: 568 },
  92: { meltingPoint: 1132.3, density: 19.05, ionizationEnergy: 598 },
  93: { meltingPoint: 644, density: 20.45, ionizationEnergy: 605 },
  94: { meltingPoint: 640, density: 19.82, ionizationEnergy: 585 },
  95: { meltingPoint: 1176, density: 13.69, ionizationEnergy: 578 },
  96: { meltingPoint: 1340, density: 13.51, ionizationEnergy: 581 },
  97: { meltingPoint: 986, density: 14.78, ionizationEnergy: 601 },
  98: { meltingPoint: 900, density: 15.1, ionizationEnergy: 608 },
  99: { meltingPoint: 860, density: null, ionizationEnergy: 619 },
  100: { meltingPoint: 1527, density: null, ionizationEnergy: 627 },
  101: { meltingPoint: 827, density: null, ionizationEnergy: 635 },
  102: { meltingPoint: 827, density: null, ionizationEnergy: 642 },
  103: { meltingPoint: 1627, density: null, ionizationEnergy: 470 },
  104: { meltingPoint: null, density: null, ionizationEnergy: 580 },
  105: { meltingPoint: null, density: null, ionizationEnergy: null },
  106: { meltingPoint: null, density: null, ionizationEnergy: null },
  107: { meltingPoint: null, density: null, ionizationEnergy: null },
  108: { meltingPoint: null, density: null, ionizationEnergy: null },
  109: { meltingPoint: null, density: null, ionizationEnergy: null },
  110: { meltingPoint: null, density: null, ionizationEnergy: null },
  111: { meltingPoint: null, density: null, ionizationEnergy: null },
  112: { meltingPoint: null, density: null, ionizationEnergy: null },
  113: { meltingPoint: null, density: null, ionizationEnergy: null },
  114: { meltingPoint: null, density: null, ionizationEnergy: null },
  115: { meltingPoint: null, density: null, ionizationEnergy: null },
  116: { meltingPoint: null, density: null, ionizationEnergy: null },
  117: { meltingPoint: null, density: null, ionizationEnergy: null },
  118: { meltingPoint: null, density: null, ionizationEnergy: null },
};

// Pre-computed ranges for normalization
function computeRange(key: keyof ElementPhysicalProps): { min: number; max: number } {
  const vals = Object.values(ELEMENT_PROPERTIES)
    .map(p => p[key])
    .filter((v): v is number => v != null && v > 0);
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

export const MP_RANGE = computeRange('meltingPoint');
export const DENSITY_RANGE = computeRange('density');
export const IE_RANGE = computeRange('ionizationEnergy');

export function normalizeProperty(Z: number, key: keyof ElementPhysicalProps): number | null {
  const props = ELEMENT_PROPERTIES[Z];
  if (!props) return null;
  const val = props[key];
  if (val == null) return null;
  const range = key === 'meltingPoint' ? MP_RANGE : key === 'density' ? DENSITY_RANGE : IE_RANGE;
  if (range.max === range.min) return 0.5;
  return Math.max(0, Math.min(1, (val - range.min) / (range.max - range.min)));
}
