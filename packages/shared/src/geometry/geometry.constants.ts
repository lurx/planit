import type { ResizeHandlePosition } from './geometry.types';

/** Resize handles in a stable clockwise-ish order, for deterministic iteration/rendering. */
export const RESIZE_HANDLE_POSITIONS = [
  'top-left',
  'top',
  'top-right',
  'right',
  'bottom-right',
  'bottom',
  'bottom-left',
  'left',
] as const satisfies readonly ResizeHandlePosition[];
