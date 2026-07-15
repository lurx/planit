import { getShapeBounds, hitTestShape, rectsIntersect } from '@planit/shared';
import type { BoardDoc, Point, Rect, Shape, ShapePatch } from '@planit/shared';

/** The topmost shape (last in z-order) hit by `point`, or `null` when the point hits nothing. */
export function findTopmostShapeAt(
  shapes: readonly Shape[],
  point: Point,
  tolerance: number,
): string | null {
  for (let index = shapes.length - 1; index >= 0; index -= 1) {
    const shape = shapes[index];
    if (shape && hitTestShape(shape, point, tolerance)) {
      return shape.id;
    }
  }
  return null;
}

/** Ids of every shape whose bounds intersect `rect` — the marquee's catch. */
export function getShapeIdsInRect(shapes: readonly Shape[], rect: Rect): string[] {
  return shapes
    .filter((shape) => rectsIntersect(getShapeBounds(shape), rect))
    .map((shape) => shape.id);
}

/** The normalized (non-negative extent) world rect spanned by two drag points. */
export function rectFromPoints(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

/** A patch that translates `shape` by `(dx, dy)`, mapped onto its geometry family's fields. */
export function moveShapePatch(shape: Shape, dx: number, dy: number): ShapePatch {
  if (shape.type === 'line' || shape.type === 'arrow') {
    return { x1: shape.x1 + dx, y1: shape.y1 + dy, x2: shape.x2 + dx, y2: shape.y2 + dy };
  }
  return { x: shape.x + dx, y: shape.y + dy };
}

/** Add `id` if absent, remove it if present — the shift-click set operation. Returns a new set. */
export function toggleId(selection: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(selection);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

/** Remove every `id` from the board, returning how many shapes were actually deleted. */
export function deleteShapes(board: BoardDoc, ids: Iterable<string>): number {
  let removed = 0;
  for (const id of ids) {
    if (board.removeShape(id)) {
      removed += 1;
    }
  }
  return removed;
}
