import { ELEMENTS, type Element } from '@/data/elements';

export interface ElementPosition {
  element: Element;
  x: number;
  y: number;
  z: number;
}

const SPACING = 1.3;

/**
 * Compute 3D positions for every element in standard periodic-table layout.
 * Lanthanides/actinides with group=null get placed in two rows below the main grid.
 */
export function computePositions(): ElementPosition[] {
  const positions: ElementPosition[] = [];

  // Track lanthanide/actinide column offset
  let lanthanideCol = 0;
  let actinideCol = 0;

  for (const el of ELEMENTS) {
    let col: number;
    let row: number;

    if (el.group !== null) {
      // Standard main-grid element
      col = el.group - 1; // 0-indexed (0..17)
      row = el.period - 1; // 0-indexed (0..6)
    } else if (el.category === 'lanthanide') {
      // Lanthanides: Z 58-71 placed below with a gap
      col = 3 + lanthanideCol;
      row = 8.5;
      lanthanideCol++;
    } else {
      // Actinides: Z 90-103
      col = 3 + actinideCol;
      row = 9.5;
      actinideCol++;
    }

    // Center the table: 18 columns → center at 8.5, 10 rows → center at ~4.5
    const x = (col - 8.5) * SPACING;
    const y = -(row - 4.5) * SPACING;
    const z = 0;

    positions.push({ element: el, x, y, z });
  }

  return positions;
}

// Pre-compute once
export const TABLE_POSITIONS = computePositions();

// Bounding box for camera
export const TABLE_CENTER: [number, number, number] = [0, 0.5, 0];
export const CAMERA_START: [number, number, number] = [0, 0.5, 28];
