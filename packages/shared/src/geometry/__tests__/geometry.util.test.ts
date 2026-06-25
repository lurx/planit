import { describe, expect, it } from 'vitest';

import type { Rect } from '../geometry.types';
import {
  getResizeHandles,
  pointInEllipse,
  pointInRect,
  pointNearSegment,
  rectsIntersect,
} from '../geometry.util';

const UNIT_RECT = { x: 0, y: 0, width: 100, height: 100 } satisfies Rect;

describe('pointInRect', () => {
  it('returns true for an interior point', () => {
    expect(pointInRect({ x: 50, y: 50 }, UNIT_RECT)).toBe(true);
  });

  it('returns true on the edge', () => {
    expect(pointInRect({ x: 0, y: 100 }, UNIT_RECT)).toBe(true);
  });

  it.each([
    ['left', { x: -1, y: 50 }],
    ['right', { x: 101, y: 50 }],
    ['above', { x: 50, y: -1 }],
    ['below', { x: 50, y: 101 }],
  ])('returns false when %s of the rect', (_side, point) => {
    expect(pointInRect(point, UNIT_RECT)).toBe(false);
  });
});

describe('pointInEllipse', () => {
  it('returns true at the centre', () => {
    expect(pointInEllipse({ x: 50, y: 50 }, UNIT_RECT)).toBe(true);
  });

  it('returns false at a corner of the bounding box', () => {
    expect(pointInEllipse({ x: 0, y: 0 }, UNIT_RECT)).toBe(false);
  });

  it('returns true on the ellipse edge', () => {
    expect(pointInEllipse({ x: 100, y: 50 }, UNIT_RECT)).toBe(true);
  });

  it('returns false for a zero-width (degenerate) ellipse', () => {
    expect(pointInEllipse({ x: 0, y: 5 }, { x: 0, y: 0, width: 0, height: 10 })).toBe(false);
  });

  it('returns false for a zero-height (degenerate) ellipse', () => {
    expect(pointInEllipse({ x: 5, y: 0 }, { x: 0, y: 0, width: 10, height: 0 })).toBe(false);
  });
});

describe('pointNearSegment', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 100, y: 0 };

  it('returns true for a point on the segment', () => {
    expect(pointNearSegment({ x: 50, y: 0 }, a, b, 1)).toBe(true);
  });

  it('returns true within tolerance perpendicular to the segment', () => {
    expect(pointNearSegment({ x: 50, y: 3 }, a, b, 5)).toBe(true);
  });

  it('returns false beyond tolerance', () => {
    expect(pointNearSegment({ x: 50, y: 20 }, a, b, 5)).toBe(false);
  });

  it('clamps to the start endpoint (projection < 0)', () => {
    expect(pointNearSegment({ x: -10, y: 0 }, a, b, 5)).toBe(false);
    expect(pointNearSegment({ x: -3, y: 0 }, a, b, 5)).toBe(true);
  });

  it('clamps to the end endpoint (projection > 1)', () => {
    expect(pointNearSegment({ x: 110, y: 0 }, a, b, 5)).toBe(false);
    expect(pointNearSegment({ x: 103, y: 0 }, a, b, 5)).toBe(true);
  });

  it('treats a zero-length segment as its single point', () => {
    expect(pointNearSegment({ x: 2, y: 0 }, a, a, 5)).toBe(true);
    expect(pointNearSegment({ x: 10, y: 0 }, a, a, 5)).toBe(false);
  });
});

describe('rectsIntersect', () => {
  it('returns true for overlapping rects', () => {
    expect(rectsIntersect(UNIT_RECT, { x: 50, y: 50, width: 100, height: 100 })).toBe(true);
  });

  it('returns true when edges touch', () => {
    expect(rectsIntersect(UNIT_RECT, { x: 100, y: 0, width: 10, height: 10 })).toBe(true);
  });

  it.each([
    ['b right of a', { x: 200, y: 0, width: 10, height: 10 }],
    ['b left of a', { x: -20, y: 0, width: 10, height: 10 }],
    ['b below a', { x: 0, y: 200, width: 10, height: 10 }],
    ['b above a', { x: 0, y: -20, width: 10, height: 10 }],
  ])('returns false when %s', (_case, other) => {
    expect(rectsIntersect(UNIT_RECT, other)).toBe(false);
  });
});

describe('getResizeHandles', () => {
  it('places eight centred handles around the bounds', () => {
    const handles = getResizeHandles(UNIT_RECT, 10);

    expect(handles['top-left']).toEqual({ x: -5, y: -5, width: 10, height: 10 });
    expect(handles['bottom-right']).toEqual({ x: 95, y: 95, width: 10, height: 10 });
    expect(handles.top).toEqual({ x: 45, y: -5, width: 10, height: 10 });
    expect(handles.right).toEqual({ x: 95, y: 45, width: 10, height: 10 });
    expect(Object.keys(handles)).toHaveLength(8);
  });
});
