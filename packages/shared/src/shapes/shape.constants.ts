import type { ShapeType } from './shape.types';

/** A freshly created shape carries no text until the user edits it (Phase 1, T3.6). */
export const DEFAULT_SHAPE_TEXT = '';

/** A text shape is only its label, so it starts with a visible placeholder instead of empty. */
export const DEFAULT_TEXT_LABEL = 'Text';

/**
 * Named handles for each shape kind — the single source of truth for the `type` discriminant.
 * The zod schemas build their literals from these, so `ShapeType` is derived *from* `SHAPES`;
 * that's why this can't be `satisfies Record<string, ShapeType>` (it would reference itself).
 */
export const SHAPES = {
  RECT: 'rect',
  ELLIPSE: 'ellipse',
  TEXT: 'text',
  LINE: 'line',
  ARROW: 'arrow',
} as const satisfies Record<string, string>;

/** The shape kinds Planit supports in the MVP, in toolbar order (derived from {@link SHAPES}). */
export const SHAPE_TYPES: readonly ShapeType[] = Object.values(SHAPES);
