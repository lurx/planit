import type { Point, Rect, ResizeHandles } from './geometry.types';

/** Is the point inside (or on the edge of) the axis-aligned rectangle? */
export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/** Is the point inside the ellipse inscribed in `bounds`? A zero-area ellipse hits nothing. */
export function pointInEllipse(point: Point, bounds: Rect): boolean {
  const radiusX = bounds.width / 2;
  const radiusY = bounds.height / 2;

  if (radiusX <= 0 || radiusY <= 0) {
    return false;
  }

  const centerX = bounds.x + radiusX;
  const centerY = bounds.y + radiusY;
  const normalizedX = (point.x - centerX) / radiusX;
  const normalizedY = (point.y - centerY) / radiusY;

  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

/** Is the point within `tolerance` of the segment `a→b`? Handles zero-length segments. */
export function pointNearSegment(point: Point, a: Point, b: Point, tolerance: number): boolean {
  const segmentX = b.x - a.x;
  const segmentY = b.y - a.y;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;

  let t = 0;
  if (lengthSquared > 0) {
    const projection = ((point.x - a.x) * segmentX + (point.y - a.y) * segmentY) / lengthSquared;
    t = Math.min(1, Math.max(0, projection));
  }

  const closestX = a.x + t * segmentX;
  const closestY = a.y + t * segmentY;
  const deltaX = point.x - closestX;
  const deltaY = point.y - closestY;

  return deltaX * deltaX + deltaY * deltaY <= tolerance * tolerance;
}

/** Do two axis-aligned rectangles overlap? Touching edges count as intersecting. */
export function rectsIntersect(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

/** Does `outer` fully contain `inner` (edges inclusive)? */
export function rectContainsRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

/** The smallest rect enclosing all `rects`, or `null` when the list is empty. */
export function getEnclosingRect(rects: readonly Rect[]): Rect | null {
  if (rects.length === 0) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const rect of rects) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Build the eight resize-handle rects around `bounds`, each `handleSize` square and centred. */
export function getResizeHandles(bounds: Rect, handleSize: number): ResizeHandles {
  const half = handleSize / 2;
  const { x, y, width, height } = bounds;
  const midX = x + width / 2;
  const midY = y + height / 2;
  const right = x + width;
  const bottom = y + height;

  const handleAt = (centerX: number, centerY: number): Rect => ({
    x: centerX - half,
    y: centerY - half,
    width: handleSize,
    height: handleSize,
  });

  return {
    'top-left': handleAt(x, y),
    top: handleAt(midX, y),
    'top-right': handleAt(right, y),
    left: handleAt(x, midY),
    right: handleAt(right, midY),
    'bottom-left': handleAt(x, bottom),
    bottom: handleAt(midX, bottom),
    'bottom-right': handleAt(right, bottom),
  };
}
