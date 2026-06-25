import { describe, expect, it } from 'vitest';

import { createRect } from '../shape.factory';
import { buildShapeQuadtree } from '../shape.spatial.util';

describe('buildShapeQuadtree', () => {
  it('returns an empty result for no shapes', () => {
    const tree = buildShapeQuadtree([]);

    expect(tree.query({ x: 0, y: 0, width: 1000, height: 1000 })).toEqual([]);
  });

  it('queries the visible (culled) subset for a viewport', () => {
    const near = createRect({ id: 'near', x: 0, y: 0, width: 50, height: 50 });
    const far = createRect({ id: 'far', x: 5000, y: 5000, width: 50, height: 50 });
    const tree = buildShapeQuadtree([near, far]);

    const visible = tree.query({ x: -10, y: -10, width: 200, height: 200 });

    expect(visible.map((shape) => shape.id)).toEqual(['near']);
  });

  it('reflects a moved shape after rebuilding', () => {
    const before = createRect({ id: 's', x: 0, y: 0, width: 20, height: 20 });
    const viewport = { x: -5, y: -5, width: 50, height: 50 };

    expect(
      buildShapeQuadtree([before])
        .query(viewport)
        .map((s) => s.id),
    ).toEqual(['s']);

    const after = createRect({ id: 's', x: 800, y: 800, width: 20, height: 20 });

    expect(buildShapeQuadtree([after]).query(viewport)).toEqual([]);
    expect(
      buildShapeQuadtree([after])
        .query({ x: 790, y: 790, width: 50, height: 50 })
        .map((s) => s.id),
    ).toEqual(['s']);
  });

  it('indexes a single shape (degenerate extent) correctly', () => {
    const only = createRect({ id: 'only', x: 100, y: 100, width: 0, height: 0 });
    const tree = buildShapeQuadtree([only]);

    expect(tree.query({ x: 90, y: 90, width: 30, height: 30 }).map((s) => s.id)).toEqual(['only']);
  });
});
