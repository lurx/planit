import type { ShapeType } from './shape.types';

/** A freshly created shape carries no text until the user edits it (Phase 1, T3.6). */
export const DEFAULT_SHAPE_TEXT = '';

/** The shape kinds Planit supports in the MVP, in toolbar order. */
export const SHAPE_TYPES = [
  'rect',
  'ellipse',
  'line',
  'arrow',
] as const satisfies readonly ShapeType[];
