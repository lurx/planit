import { describe, expect, it } from 'vitest';

import { createArrow, createEllipse, createLine, createRect } from '../shape.factory';
import { getShapeBounds, hitTestShape } from '../shape.geometry.util';

describe('getShapeBounds', () => {
  it('returns the box geometry directly for a rect', () => {
    const rect = createRect({ id: 'r', x: 10, y: 20, width: 100, height: 50 });

    expect(getShapeBounds(rect)).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it('returns the box geometry directly for an ellipse', () => {
    const ellipse = createEllipse({ id: 'e', x: 0, y: 0, width: 30, height: 40 });

    expect(getShapeBounds(ellipse)).toEqual({ x: 0, y: 0, width: 30, height: 40 });
  });

  it('normalizes a line whose end precedes its start', () => {
    const line = createLine({ id: 'l', x1: 100, y1: 80, x2: 20, y2: 10 });

    expect(getShapeBounds(line)).toEqual({ x: 20, y: 10, width: 80, height: 70 });
  });

  it('computes bounds for an arrow', () => {
    const arrow = createArrow({ id: 'a', x1: 0, y1: 0, x2: 40, y2: 30 });

    expect(getShapeBounds(arrow)).toEqual({ x: 0, y: 0, width: 40, height: 30 });
  });
});

describe('hitTestShape', () => {
  it('hits inside a rect', () => {
    const rect = createRect({ id: 'r', x: 0, y: 0, width: 100, height: 100 });

    expect(hitTestShape(rect, { x: 50, y: 50 }, 0)).toBe(true);
    expect(hitTestShape(rect, { x: 150, y: 50 }, 0)).toBe(false);
  });

  it('hits inside an ellipse but misses its bounding-box corner', () => {
    const ellipse = createEllipse({ id: 'e', x: 0, y: 0, width: 100, height: 100 });

    expect(hitTestShape(ellipse, { x: 50, y: 50 }, 0)).toBe(true);
    expect(hitTestShape(ellipse, { x: 2, y: 2 }, 0)).toBe(false);
  });

  it('hits near a line within tolerance', () => {
    const line = createLine({ id: 'l', x1: 0, y1: 0, x2: 100, y2: 0 });

    expect(hitTestShape(line, { x: 50, y: 4 }, 5)).toBe(true);
    expect(hitTestShape(line, { x: 50, y: 20 }, 5)).toBe(false);
  });

  it('hits near an arrow within tolerance', () => {
    const arrow = createArrow({ id: 'a', x1: 0, y1: 0, x2: 0, y2: 100 });

    expect(hitTestShape(arrow, { x: 3, y: 50 }, 5)).toBe(true);
  });
});
