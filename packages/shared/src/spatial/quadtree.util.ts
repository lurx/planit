import type { Rect } from '../geometry/geometry.types';
import { rectContainsRect, rectsIntersect } from '../geometry/geometry.util';
import { DEFAULT_QUADTREE_CAPACITY, DEFAULT_QUADTREE_MAX_DEPTH } from './quadtree.constants';
import type { QuadtreeItem } from './quadtree.types';

/**
 * A region quadtree for viewport culling. Items live in the deepest node whose quadrant fully
 * contains their bounds; items straddling a split stay at the parent, so each item is stored
 * exactly once and `query` never yields duplicates.
 *
 * Moves and deletions are handled by rebuilding (see `buildShapeQuadtree`) — cheap at the
 * MVP's shape counts and far simpler than in-place removal with node collapsing.
 */
export class Quadtree<T> {
  private readonly items: QuadtreeItem<T>[] = [];
  private children: Quadtree<T>[] | null = null;

  constructor(
    private readonly boundary: Rect,
    private readonly capacity: number = DEFAULT_QUADTREE_CAPACITY,
    private readonly maxDepth: number = DEFAULT_QUADTREE_MAX_DEPTH,
    private readonly depth: number = 0,
  ) {}

  /** Insert an item. Returns `false` if its bounds fall entirely outside this tree's boundary. */
  insert(item: QuadtreeItem<T>): boolean {
    if (!rectsIntersect(this.boundary, item.bounds)) {
      return false;
    }

    if (this.children) {
      const container = this.children.find((child) =>
        rectContainsRect(child.boundary, item.bounds),
      );
      if (container) {
        return container.insert(item);
      }
      this.items.push(item);
      return true;
    }

    this.items.push(item);
    if (this.items.length > this.capacity && this.depth < this.maxDepth) {
      this.subdivide();
    }
    return true;
  }

  /** Collect the values of every item whose bounds intersect `range`. */
  query(range: Rect, found: T[] = []): T[] {
    if (!rectsIntersect(this.boundary, range)) {
      return found;
    }

    for (const item of this.items) {
      if (rectsIntersect(item.bounds, range)) {
        found.push(item.value);
      }
    }

    if (this.children) {
      for (const child of this.children) {
        child.query(range, found);
      }
    }

    return found;
  }

  private subdivide(): void {
    const { x, y, width, height } = this.boundary;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const nextDepth = this.depth + 1;

    const makeChild = (childX: number, childY: number): Quadtree<T> =>
      new Quadtree<T>(
        { x: childX, y: childY, width: halfWidth, height: halfHeight },
        this.capacity,
        this.maxDepth,
        nextDepth,
      );

    const children = [
      makeChild(x, y),
      makeChild(x + halfWidth, y),
      makeChild(x, y + halfHeight),
      makeChild(x + halfWidth, y + halfHeight),
    ];
    this.children = children;

    const straddlers: QuadtreeItem<T>[] = [];
    for (const item of this.items) {
      const container = children.find((child) => rectContainsRect(child.boundary, item.bounds));
      if (container) {
        container.insert(item);
      } else {
        straddlers.push(item);
      }
    }

    this.items.length = 0;
    this.items.push(...straddlers);
  }
}
