import { describe, expect, it } from 'vitest';

import type { Rect } from '../../geometry/geometry.types';
import type { QuadtreeItem } from '../quadtree.types';
import { Quadtree } from '../quadtree.util';

const WORLD = { x: 0, y: 0, width: 1000, height: 1000 } satisfies Rect;

function item(id: string, bounds: Rect): QuadtreeItem<string> {
  return { bounds, value: id };
}

function cell(x: number, y: number, size = 10): Rect {
  return { x, y, width: size, height: size };
}

describe('Quadtree.insert', () => {
  it('rejects an item whose bounds fall outside the boundary', () => {
    const tree = new Quadtree<string>(WORLD);

    expect(tree.insert(item('far', cell(5000, 5000)))).toBe(false);
  });

  it('accepts an item inside the boundary', () => {
    const tree = new Quadtree<string>(WORLD);

    expect(tree.insert(item('a', cell(10, 10)))).toBe(true);
  });
});

describe('Quadtree.query', () => {
  it('returns only items intersecting the range', () => {
    const tree = new Quadtree<string>(WORLD);
    tree.insert(item('near', cell(10, 10)));
    tree.insert(item('far', cell(900, 900)));

    const found = tree.query({ x: 0, y: 0, width: 100, height: 100 });

    expect(found).toEqual(['near']);
  });

  it('returns nothing when the range misses the boundary entirely', () => {
    const tree = new Quadtree<string>(WORLD);
    tree.insert(item('a', cell(10, 10)));

    expect(tree.query({ x: 5000, y: 5000, width: 10, height: 10 })).toEqual([]);
  });

  it('finds items after the node subdivides', () => {
    // capacity 2 forces a split once the third quadrant-local item lands.
    const tree = new Quadtree<string>(WORLD, 2);
    tree.insert(item('nw', cell(10, 10)));
    tree.insert(item('ne', cell(900, 10)));
    tree.insert(item('sw', cell(10, 900)));
    tree.insert(item('se', cell(900, 900)));

    expect(tree.query(WORLD).sort()).toEqual(['ne', 'nw', 'se', 'sw']);
    expect(tree.query({ x: 880, y: 880, width: 100, height: 100 })).toEqual(['se']);
  });

  it('keeps items that straddle a split at the parent and still finds them', () => {
    const tree = new Quadtree<string>(WORLD, 1);
    // Spans the centre, so it fits no single child quadrant — must stay at the root.
    tree.insert(item('center', { x: 400, y: 400, width: 200, height: 200 }));
    tree.insert(item('corner', cell(10, 10)));
    tree.insert(item('corner2', cell(20, 20)));

    expect(tree.query(WORLD).sort()).toEqual(['center', 'corner', 'corner2']);
    expect(tree.query({ x: 480, y: 480, width: 40, height: 40 })).toEqual(['center']);
  });

  it('keeps a straddler inserted after the node has already subdivided', () => {
    const tree = new Quadtree<string>(WORLD, 1);
    // Two corner items force the root to subdivide first...
    tree.insert(item('a', cell(10, 10)));
    tree.insert(item('b', cell(20, 20)));
    // ...then a centre-spanning item fits no child quadrant and stays at the root.
    tree.insert(item('straddle', { x: 400, y: 400, width: 200, height: 200 }));

    expect(tree.query({ x: 480, y: 480, width: 40, height: 40 })).toEqual(['straddle']);
    expect(tree.query(WORLD).sort()).toEqual(['a', 'b', 'straddle']);
  });

  it('stops subdividing at max depth for coincident items', () => {
    const tree = new Quadtree<string>(WORLD, 1, 2);
    const stacked = cell(10, 10);
    for (let i = 0; i < 20; i += 1) {
      tree.insert(item(`s${i}`, stacked));
    }

    expect(tree.query(cell(10, 10, 20))).toHaveLength(20);
  });
});
