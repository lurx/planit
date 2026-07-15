import { getResizeHandles, pointInRect, RESIZE_HANDLE_POSITIONS, SHAPES } from '@planit/shared';
import type {
  BoxShape,
  Point,
  Rect,
  ResizeHandlePosition,
  Shape,
  ShapePatch,
} from '@planit/shared';

/** The single box shape (rect/ellipse) that should show resize handles, or `null`. */
export function getResizeTarget(shapes: readonly Shape[]): BoxShape | null {
  if (shapes.length !== 1) {
    return null;
  }
  const [shape] = shapes;
  if (!shape) {
    return null;
  }
  return shape.type === SHAPES.RECT || shape.type === SHAPES.ELLIPSE || shape.type === SHAPES.TEXT
    ? shape
    : null;
}

/** The resize handle whose (world-space, `handleSize`-square) rect contains `point`, or `null`. */
export function findHandleAt(
  bounds: Rect,
  point: Point,
  handleSize: number,
): ResizeHandlePosition | null {
  const handles = getResizeHandles(bounds, handleSize);
  for (const position of RESIZE_HANDLE_POSITIONS) {
    if (pointInRect(point, handles[position])) {
      return position;
    }
  }
  return null;
}

const affectsLeft = (handle: ResizeHandlePosition): boolean =>
  handle === 'top-left' || handle === 'left' || handle === 'bottom-left';
const affectsRight = (handle: ResizeHandlePosition): boolean =>
  handle === 'top-right' || handle === 'right' || handle === 'bottom-right';
const affectsTop = (handle: ResizeHandlePosition): boolean =>
  handle === 'top-left' || handle === 'top' || handle === 'top-right';
const affectsBottom = (handle: ResizeHandlePosition): boolean =>
  handle === 'bottom-left' || handle === 'bottom' || handle === 'bottom-right';

/**
 * New bounds after dragging `handle` to `point`: the handle's edge(s) follow the pointer while
 * the opposite edge stays fixed, and width/height are clamped to at least `minSize`. No handle
 * controls both the left and right (or top and bottom) edge, so the clamps never interfere.
 */
export function resizeBounds(
  bounds: Rect,
  handle: ResizeHandlePosition,
  point: Point,
  minSize: number,
): Rect {
  let left = bounds.x;
  let right = bounds.x + bounds.width;
  let top = bounds.y;
  let bottom = bounds.y + bounds.height;

  if (affectsLeft(handle)) {
    left = Math.min(point.x, right - minSize);
  }
  if (affectsRight(handle)) {
    right = Math.max(point.x, left + minSize);
  }
  if (affectsTop(handle)) {
    top = Math.min(point.y, bottom - minSize);
  }
  if (affectsBottom(handle)) {
    bottom = Math.max(point.y, top + minSize);
  }

  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** A patch that resizes a box shape to `bounds`. */
export function resizeShapePatch(bounds: Rect): ShapePatch {
  return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
}
