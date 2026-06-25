/** Items per node before it subdivides (until {@link DEFAULT_MAX_DEPTH}). */
export const DEFAULT_QUADTREE_CAPACITY = 8;

/** Hard recursion cap so degenerate inputs (coincident shapes) can't subdivide forever. */
export const DEFAULT_QUADTREE_MAX_DEPTH = 8;
