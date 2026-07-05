import { createArrow, createEllipse, createRect } from '@planit/shared';
import type { Rect } from '@planit/shared';
import { describe, expect, it } from 'vitest';

import { findHandleAt, getResizeTarget, resizeBounds, resizeShapePatch } from '../resize.helpers';

const BOUNDS: Rect = { x: 0, y: 0, width: 100, height: 80 };
const MIN = 10;

describe('getResizeTarget', () => {
  it('returns the single selected box shape', () => {
    const rect = createRect({ id: 'r', x: 0, y: 0, width: 10, height: 10 });

    expect(getResizeTarget([rect])).toBe(rect);
  });

  it('returns null for a lone segment shape (no box to resize)', () => {
    const arrow = createArrow({ id: 'a', x1: 0, y1: 0, x2: 10, y2: 0 });

    expect(getResizeTarget([arrow])).toBeNull();
  });

  it('returns null unless exactly one shape is selected', () => {
    const a = createRect({ id: 'a', x: 0, y: 0, width: 10, height: 10 });
    const b = createRect({ id: 'b', x: 0, y: 0, width: 10, height: 10 });

    expect(getResizeTarget([])).toBeNull();
    expect(getResizeTarget([a, b])).toBeNull();
  });
});

describe('findHandleAt', () => {
  it('finds the corner handle under the point', () => {
    expect(findHandleAt(BOUNDS, { x: 0, y: 0 }, 8)).toBe('top-left');
    expect(findHandleAt(BOUNDS, { x: 100, y: 80 }, 8)).toBe('bottom-right');
  });

  it('finds an edge-midpoint handle', () => {
    expect(findHandleAt(BOUNDS, { x: 50, y: 0 }, 8)).toBe('top');
  });

  it('returns null when the point is on no handle', () => {
    expect(findHandleAt(BOUNDS, { x: 50, y: 40 }, 8)).toBeNull();
  });
});

describe('resizeBounds', () => {
  it('drags a corner, keeping the opposite corner fixed', () => {
    expect(resizeBounds(BOUNDS, 'bottom-right', { x: 140, y: 130 }, MIN)).toEqual({
      x: 0,
      y: 0,
      width: 140,
      height: 130,
    });
  });

  it('drags a top-left corner, moving the origin', () => {
    expect(resizeBounds(BOUNDS, 'top-left', { x: 20, y: 30 }, MIN)).toEqual({
      x: 20,
      y: 30,
      width: 80,
      height: 50,
    });
  });

  it('resizes only one axis for an edge handle', () => {
    expect(resizeBounds(BOUNDS, 'right', { x: 60, y: 999 }, MIN)).toEqual({
      x: 0,
      y: 0,
      width: 60,
      height: 80,
    });
  });

  it('clamps to the minimum size, keeping the fixed edge anchored', () => {
    // Dragging the right edge past the left edge clamps width to MIN, left edge unmoved.
    expect(resizeBounds(BOUNDS, 'right', { x: -50, y: 0 }, MIN)).toEqual({
      x: 0,
      y: 0,
      width: MIN,
      height: 80,
    });
  });
});

describe('resizeShapePatch', () => {
  it('maps bounds onto a box shape patch (ellipse keeps its aspect via width/height)', () => {
    const ellipse = createEllipse({ id: 'e', x: 0, y: 0, width: 100, height: 100 });
    const next = resizeBounds(getBounds(ellipse), 'bottom-right', { x: 200, y: 60 }, MIN);

    expect(resizeShapePatch(next)).toEqual({ x: 0, y: 0, width: 200, height: 60 });
  });
});

function getBounds(shape: { x: number; y: number; width: number; height: number }): Rect {
  return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
}
