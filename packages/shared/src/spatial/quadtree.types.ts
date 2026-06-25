import type { Rect } from '../geometry/geometry.types';

/** An entry in a {@link Quadtree}: a payload `value` indexed by its world-space `bounds`. */
export type QuadtreeItem<T> = {
  bounds: Rect;
  value: T;
};
