import { getEnclosingRect } from '../geometry/geometry.util';
import { Quadtree } from '../spatial/quadtree.util';
import type { QuadtreeItem } from '../spatial/quadtree.types';
import { getShapeBounds } from './shape.geometry.util';
import type { Shape } from './shape.types';

/** Padding (world units) added around the shapes' extent so edge shapes sit inside the root. */
const ROOT_BOUNDARY_PADDING = 1;

/**
 * Build a {@link Quadtree} over `shapes`, deriving the root boundary from the shapes' own
 * extent (padded) so the unbounded world plane is never artificially clipped. Rebuild on any
 * add / move / delete, then `query(viewport)` to get the visible set for culling.
 */
export function buildShapeQuadtree(shapes: readonly Shape[]): Quadtree<Shape> {
  const items: QuadtreeItem<Shape>[] = shapes.map((shape) => ({
    bounds: getShapeBounds(shape),
    value: shape,
  }));

  const extent = getEnclosingRect(items.map((item) => item.bounds));
  const boundary = extent
    ? {
        x: extent.x - ROOT_BOUNDARY_PADDING,
        y: extent.y - ROOT_BOUNDARY_PADDING,
        width: extent.width + ROOT_BOUNDARY_PADDING * 2,
        height: extent.height + ROOT_BOUNDARY_PADDING * 2,
      }
    : { x: 0, y: 0, width: 0, height: 0 };

  const tree = new Quadtree<Shape>(boundary);
  for (const item of items) {
    tree.insert(item);
  }
  return tree;
}
