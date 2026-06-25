/** A point in 2D space. Used for both world-space and screen-space coordinates. */
export type Point = {
  x: number;
  y: number;
};

/** An axis-aligned rectangle: top-left `(x, y)` plus non-negative `width`/`height`. */
export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** The eight resize handles around a selection's bounding box. */
export type ResizeHandlePosition =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

export type ResizeHandles = Record<ResizeHandlePosition, Rect>;
