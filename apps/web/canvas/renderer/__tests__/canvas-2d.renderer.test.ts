import { createArrow, createEllipse, createLine, createRect } from '@planit/shared';
import type { Camera } from '@planit/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Canvas2DRenderer } from '../canvas-2d.renderer';
import { SHAPE_STROKE_WIDTH } from '../canvas-2d.renderer.constants';
import type { Canvas2DContext, Viewport } from '../renderer.types';

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

const IDENTITY_CAMERA = { x: 0, y: 0, zoom: 1 } satisfies Camera;
const VIEWPORT = { width: 800, height: 600, devicePixelRatio: 1 } satisfies Viewport;

describe('Canvas2DRenderer.draw', () => {
  let ctx: Canvas2DContext;
  let renderer: Canvas2DRenderer;

  beforeEach(() => {
    ctx = createMockContext();
    renderer = new Canvas2DRenderer(ctx);
  });

  it('clears the backing store then installs the camera transform', () => {
    renderer.draw([], IDENTITY_CAMERA, VIEWPORT);

    const calls = vi.mocked(ctx.setTransform).mock.calls;
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    // First reset to identity to clear, then the camera transform (identity here). `+ 0`
    // normalizes any negative-zero offsets.
    expect(calls[0]).toEqual([1, 0, 0, 1, 0, 0]);
    expect(calls[1]?.map((value) => value + 0)).toEqual([1, 0, 0, 1, 0, 0]);
  });

  it('folds devicePixelRatio and zoom into the transform and clear size', () => {
    renderer.draw([], { x: 10, y: 20, zoom: 2 }, { width: 400, height: 300, devicePixelRatio: 2 });

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    // a = zoom*dpr = 4; e = -x*zoom*dpr = -40; f = -y*zoom*dpr = -80.
    expect(vi.mocked(ctx.setTransform).mock.calls[1]).toEqual([4, 0, 0, 4, -40, -80]);
  });

  it('uses a world-space stroke width that scales with the camera', () => {
    renderer.draw([], { x: 0, y: 0, zoom: 4 }, VIEWPORT);

    expect(ctx.lineWidth).toBe(SHAPE_STROKE_WIDTH);
  });

  it('draws a rect as a path', () => {
    const rect = createRect({ id: 'r', x: 5, y: 10, width: 30, height: 20 });

    renderer.draw([rect], IDENTITY_CAMERA, VIEWPORT);

    expect(ctx.rect).toHaveBeenCalledWith(5, 10, 30, 20);
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });

  it('draws an ellipse from its centre and radii', () => {
    const ellipse = createEllipse({ id: 'e', x: 0, y: 0, width: 100, height: 60 });

    renderer.draw([ellipse], IDENTITY_CAMERA, VIEWPORT);

    expect(ctx.ellipse).toHaveBeenCalledWith(50, 30, 50, 30, 0, 0, Math.PI * 2);
  });

  it('draws a line as a single segment without an arrowhead', () => {
    const line = createLine({ id: 'l', x1: 0, y1: 0, x2: 100, y2: 0 });

    renderer.draw([line], IDENTITY_CAMERA, VIEWPORT);

    expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(100, 0);
    // Only the segment itself: one moveTo + one lineTo.
    expect(ctx.lineTo).toHaveBeenCalledTimes(1);
  });

  it('draws an arrow with an arrowhead (extra strokes from the tip)', () => {
    const arrow = createArrow({ id: 'a', x1: 0, y1: 0, x2: 100, y2: 0 });

    renderer.draw([arrow], IDENTITY_CAMERA, VIEWPORT);

    // Segment + two arrowhead barbs = three lineTo calls.
    expect(ctx.lineTo).toHaveBeenCalledTimes(3);
  });

  it('renders text centred on the shape when present', () => {
    const rect = createRect({ id: 'r', x: 0, y: 0, width: 100, height: 40, text: 'hi' });

    renderer.draw([rect], IDENTITY_CAMERA, VIEWPORT);

    expect(ctx.fillText).toHaveBeenCalledWith('hi', 50, 20);
  });

  it('skips text rendering for an empty label', () => {
    const rect = createRect({ id: 'r', x: 0, y: 0, width: 100, height: 40 });

    renderer.draw([rect], IDENTITY_CAMERA, VIEWPORT);

    expect(ctx.fillText).not.toHaveBeenCalled();
  });
});

describe('Canvas2DRenderer.hitTest', () => {
  const renderer = new Canvas2DRenderer(createMockContext());

  it('returns the topmost shape under the point', () => {
    const bottom = createRect({ id: 'bottom', x: 0, y: 0, width: 100, height: 100 });
    const top = createRect({ id: 'top', x: 0, y: 0, width: 100, height: 100 });

    expect(renderer.hitTest({ x: 50, y: 50 }, [bottom, top], 0)).toBe('top');
  });

  it('returns null when nothing is hit', () => {
    const rect = createRect({ id: 'r', x: 0, y: 0, width: 10, height: 10 });

    expect(renderer.hitTest({ x: 500, y: 500 }, [rect], 0)).toBeNull();
  });
});
