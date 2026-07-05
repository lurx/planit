import type { Point } from '@planit/shared';
import { describe, expect, it } from 'vitest';

import { createShapeFromDrag, isDrawTool } from '../tools.helpers';

const START: Point = { x: 30, y: 40 };
const END: Point = { x: 10, y: 90 };

describe('isDrawTool', () => {
  it('treats select as a non-drawing tool', () => {
    expect(isDrawTool('select')).toBe(false);
  });

  it('treats every shape tool as a drawing tool', () => {
    expect(isDrawTool('rect')).toBe(true);
    expect(isDrawTool('ellipse')).toBe(true);
    expect(isDrawTool('line')).toBe(true);
    expect(isDrawTool('arrow')).toBe(true);
  });
});

describe('createShapeFromDrag', () => {
  it('normalizes a rect to a top-left origin with non-negative extents', () => {
    const rect = createShapeFromDrag('rect', START, END, 'r1');

    expect(rect).toEqual({
      type: 'rect',
      id: 'r1',
      x: 10,
      y: 40,
      width: 20,
      height: 50,
      text: '',
    });
  });

  it('builds an ellipse from the same normalized box', () => {
    const ellipse = createShapeFromDrag('ellipse', START, END, 'e1');

    expect(ellipse).toMatchObject({ type: 'ellipse', x: 10, y: 40, width: 20, height: 50 });
  });

  it('keeps segment direction for a line (no normalization)', () => {
    const line = createShapeFromDrag('line', START, END, 'l1');

    expect(line).toMatchObject({ type: 'line', x1: 30, y1: 40, x2: 10, y2: 90 });
  });

  it('points an arrow from start to end', () => {
    const arrow = createShapeFromDrag('arrow', START, END, 'a1');

    expect(arrow).toMatchObject({ type: 'arrow', x1: 30, y1: 40, x2: 10, y2: 90 });
  });
});
