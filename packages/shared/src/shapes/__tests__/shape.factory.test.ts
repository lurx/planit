import { describe, expect, it } from 'vitest';

import { createArrow, createEllipse, createLine, createRect, createText } from '../shape.factory';
import { shapeSchema } from '../shape.schema';

describe('createRect', () => {
  it('builds a rect from box geometry', () => {
    const rect = createRect({ id: 'r1', x: 10, y: 20, width: 100, height: 50, text: 'hi' });

    expect(rect).toEqual({
      type: 'rect',
      id: 'r1',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      text: 'hi',
    });
  });

  it('defaults text to an empty string when omitted', () => {
    const rect = createRect({ id: 'r1', x: 0, y: 0, width: 1, height: 1 });

    expect(rect.text).toBe('');
  });
});

describe('createText', () => {
  it('builds a text shape from box geometry', () => {
    const text = createText({ id: 't1', x: 5, y: 6, width: 120, height: 24, text: 'label' });

    expect(text).toEqual({
      type: 'text',
      id: 't1',
      x: 5,
      y: 6,
      width: 120,
      height: 24,
      text: 'label',
    });
  });

  it('defaults to a visible placeholder label when text is omitted', () => {
    expect(createText({ id: 't1', x: 0, y: 0, width: 1, height: 1 }).text).toBe('Text');
  });
});

describe('createEllipse', () => {
  it('builds an ellipse from box geometry', () => {
    const ellipse = createEllipse({ id: 'e1', x: 5, y: 5, width: 30, height: 30, text: 'o' });

    expect(ellipse.type).toBe('ellipse');
    expect(ellipse).toMatchObject({ id: 'e1', x: 5, y: 5, width: 30, height: 30, text: 'o' });
  });

  it('defaults text to an empty string when omitted', () => {
    expect(createEllipse({ id: 'e1', x: 0, y: 0, width: 1, height: 1 }).text).toBe('');
  });
});

describe('createLine', () => {
  it('builds a line from segment geometry', () => {
    const line = createLine({ id: 'l1', x1: 0, y1: 0, x2: 10, y2: 10, text: 'seg' });

    expect(line).toEqual({
      type: 'line',
      id: 'l1',
      x1: 0,
      y1: 0,
      x2: 10,
      y2: 10,
      text: 'seg',
    });
  });

  it('defaults text to an empty string when omitted', () => {
    expect(createLine({ id: 'l1', x1: 0, y1: 0, x2: 1, y2: 1 }).text).toBe('');
  });
});

describe('createArrow', () => {
  it('builds an arrow from segment geometry', () => {
    const arrow = createArrow({ id: 'a1', x1: 1, y1: 2, x2: 3, y2: 4, text: 'to' });

    expect(arrow.type).toBe('arrow');
    expect(arrow).toMatchObject({ id: 'a1', x1: 1, y1: 2, x2: 3, y2: 4, text: 'to' });
  });

  it('defaults text to an empty string when omitted', () => {
    expect(createArrow({ id: 'a1', x1: 0, y1: 0, x2: 1, y2: 1 }).text).toBe('');
  });
});

describe('factory output validity', () => {
  it('produces shapes that satisfy the zod schema', () => {
    const shapes = [
      createRect({ id: 'r', x: 0, y: 0, width: 10, height: 10 }),
      createEllipse({ id: 'e', x: 0, y: 0, width: 10, height: 10 }),
      createText({ id: 't', x: 0, y: 0, width: 10, height: 10 }),
      createLine({ id: 'l', x1: 0, y1: 0, x2: 10, y2: 10 }),
      createArrow({ id: 'a', x1: 0, y1: 0, x2: 10, y2: 10 }),
    ];

    for (const shape of shapes) {
      expect(() => shapeSchema.parse(shape)).not.toThrow();
    }
  });
});
