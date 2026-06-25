import { describe, expect, it } from 'vitest';

import { shapeSchema } from '../shape.schema';
import type { Shape } from '../shape.types';

const validRect = {
  type: 'rect',
  id: 'r1',
  x: 0,
  y: 0,
  width: 100,
  height: 40,
  text: '',
} satisfies Shape;

const validLine = {
  type: 'line',
  id: 'l1',
  x1: 0,
  y1: 0,
  x2: 10,
  y2: 10,
  text: '',
} satisfies Shape;

describe('shapeSchema parsing', () => {
  it('accepts a valid rect and round-trips it unchanged', () => {
    const parsed = shapeSchema.parse(validRect);

    expect(parsed).toEqual(validRect);
  });

  it('accepts a valid line', () => {
    expect(() => shapeSchema.parse(validLine)).not.toThrow();
  });

  it('rejects an unknown shape type', () => {
    const result = shapeSchema.safeParse({ ...validRect, type: 'triangle' });

    expect(result.success).toBe(false);
  });

  it('rejects an empty id', () => {
    const result = shapeSchema.safeParse({ ...validRect, id: '' });

    expect(result.success).toBe(false);
  });

  it('rejects negative box dimensions', () => {
    const result = shapeSchema.safeParse({ ...validRect, width: -1 });

    expect(result.success).toBe(false);
  });

  it('rejects non-finite geometry', () => {
    const result = shapeSchema.safeParse({ ...validLine, x2: Number.POSITIVE_INFINITY });

    expect(result.success).toBe(false);
  });

  it('rejects a box shape missing its geometry', () => {
    const result = shapeSchema.safeParse({ type: 'rect', id: 'r1', text: '' });

    expect(result.success).toBe(false);
  });
});

describe('discriminated narrowing', () => {
  it('narrows a parsed shape by its type discriminant', () => {
    const parsed = shapeSchema.parse(validRect);

    // Type-level narrowing: the box geometry is only reachable on box variants.
    if (parsed.type === 'rect' || parsed.type === 'ellipse') {
      expect(parsed.width).toBe(100);
    } else {
      throw new Error('expected a box shape');
    }
  });
});
