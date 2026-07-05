import { createArrow, createRect } from '@planit/shared';
import type { Point } from '@planit/shared';
import { describe, expect, it } from 'vitest';

import {
  findTopmostShapeAt,
  getShapeIdsInRect,
  moveShapePatch,
  rectFromPoints,
  toggleId,
} from '../selection.helpers';

const BOTTOM = createRect({ id: 'bottom', x: 0, y: 0, width: 100, height: 100 });
const TOP = createRect({ id: 'top', x: 0, y: 0, width: 100, height: 100 });
const FAR = createRect({ id: 'far', x: 500, y: 500, width: 20, height: 20 });

describe('findTopmostShapeAt', () => {
  it('returns the last shape in z-order under the point', () => {
    expect(findTopmostShapeAt([BOTTOM, TOP], { x: 50, y: 50 }, 0)).toBe('top');
  });

  it('returns null when the point misses every shape', () => {
    expect(findTopmostShapeAt([BOTTOM, TOP], { x: 300, y: 300 }, 0)).toBeNull();
  });

  it('honours tolerance for thin shapes', () => {
    const arrow = createArrow({ id: 'a', x1: 0, y1: 0, x2: 100, y2: 0 });
    const justOff: Point = { x: 50, y: 4 };

    expect(findTopmostShapeAt([arrow], justOff, 0)).toBeNull();
    expect(findTopmostShapeAt([arrow], justOff, 6)).toBe('a');
  });
});

describe('getShapeIdsInRect', () => {
  it('catches shapes whose bounds intersect the marquee', () => {
    const ids = getShapeIdsInRect([BOTTOM, FAR], { x: 50, y: 50, width: 100, height: 100 });

    expect(ids).toEqual(['bottom']);
  });

  it('returns an empty list when nothing intersects', () => {
    expect(getShapeIdsInRect([BOTTOM], { x: 300, y: 300, width: 10, height: 10 })).toEqual([]);
  });
});

describe('rectFromPoints', () => {
  it('normalizes two corners into a top-left origin with non-negative extents', () => {
    expect(rectFromPoints({ x: 40, y: 10 }, { x: 10, y: 90 })).toEqual({
      x: 10,
      y: 10,
      width: 30,
      height: 80,
    });
  });
});

describe('moveShapePatch', () => {
  it('translates a box shape by its x/y', () => {
    expect(moveShapePatch(BOTTOM, 15, -5)).toEqual({ x: 15, y: -5 });
  });

  it('translates a segment shape by both endpoints', () => {
    const arrow = createArrow({ id: 'a', x1: 0, y1: 0, x2: 100, y2: 40 });

    expect(moveShapePatch(arrow, 10, 20)).toEqual({ x1: 10, y1: 20, x2: 110, y2: 60 });
  });
});

describe('toggleId', () => {
  it('adds an id that is absent', () => {
    expect([...toggleId(new Set(['a']), 'b')]).toEqual(['a', 'b']);
  });

  it('removes an id that is present', () => {
    expect([...toggleId(new Set(['a', 'b']), 'a')]).toEqual(['b']);
  });

  it('does not mutate the input set', () => {
    const original = new Set(['a']);
    toggleId(original, 'b');

    expect([...original]).toEqual(['a']);
  });
});
