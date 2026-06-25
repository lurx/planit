import { DEFAULT_CAMERA } from '@planit/shared';
import { describe, expect, it, vi } from 'vitest';

import type { Canvas2DContext } from '../../renderer';
import { drawGrid, getViewportWorldRect, syncCanvasSize } from '../board-canvas.helpers';

function createMockContext(): Canvas2DContext {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    ellipse: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    lineWidth: 0,
    strokeStyle: '#000',
    fillStyle: '#000',
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
  };
}

describe('getViewportWorldRect', () => {
  it('returns the full viewport at the identity camera', () => {
    expect(getViewportWorldRect(DEFAULT_CAMERA, 800, 600)).toEqual({
      x: 0,
      y: 0,
      width: 800,
      height: 600,
    });
  });

  it('accounts for pan and zoom', () => {
    expect(getViewportWorldRect({ x: 100, y: 50, zoom: 2 }, 800, 600)).toEqual({
      x: 100,
      y: 50,
      width: 400,
      height: 300,
    });
  });
});

describe('syncCanvasSize', () => {
  it('sizes the backing store to device pixels and the CSS box to logical px', () => {
    const canvas = document.createElement('canvas');

    syncCanvasSize(canvas, 400, 300, 2);

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
    expect(canvas.style.width).toBe('400px');
    expect(canvas.style.height).toBe('300px');
  });
});

describe('drawGrid', () => {
  it('clears the layer and strokes grid lines under the camera transform', () => {
    const ctx = createMockContext();

    drawGrid(ctx, DEFAULT_CAMERA, { width: 200, height: 200, devicePixelRatio: 1 });

    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
  });
});
