import { SHAPE_TYPES } from '@planit/shared';

import type { ToolId } from './tools.types';

export const DEFAULT_TOOL = 'select' satisfies ToolId;

/** The shape-creating tools (one per shape kind). Membership drives `isDrawTool`. */
export const DRAW_TOOL_IDS: ReadonlySet<ToolId> = new Set(SHAPE_TYPES);

/**
 * Single-key shortcuts (lowercased `event.key` → tool). Escape returns to the select tool.
 * Annotated (not `satisfies`) so it can be indexed by an arbitrary key at lookup time.
 */
export const TOOL_SHORTCUTS: Record<string, ToolId | undefined> = {
  v: 'select',
  h: 'pan',
  r: 'rect',
  o: 'ellipse',
  t: 'text',
  l: 'line',
  a: 'arrow',
  escape: 'select',
};

/** Minimum drag distance (screen px) before a drag commits a shape; smaller drags are clicks. */
export const MIN_DRAW_SIZE_PX = 4;

/** Id for the in-progress preview shape — it lives only on the overlay, never in the doc. */
export const PREVIEW_SHAPE_ID = '__preview__';
