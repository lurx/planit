import { MAX_ZOOM, MIN_ZOOM, screenToWorld, worldToScreen } from '@planit/shared';
import type { Camera } from '@planit/shared';
import { describe, expect, it } from 'vitest';

import { applyWheelGesture, getWheelZoomFactor, zoomCameraAtCenter } from '../viewport.helpers';

const IDENTITY = { x: 0, y: 0, zoom: 1 } satisfies Camera;

describe('getWheelZoomFactor', () => {
  it('returns 1 for no scroll', () => {
    expect(getWheelZoomFactor(0)).toBe(1);
  });

  it('zooms in when scrolling up (negative delta)', () => {
    expect(getWheelZoomFactor(-100)).toBeGreaterThan(1);
  });

  it('zooms out when scrolling down (positive delta)', () => {
    expect(getWheelZoomFactor(100)).toBeLessThan(1);
  });
});

describe('applyWheelGesture (pan)', () => {
  it('pans by the inverse scroll delta when not zooming', () => {
    const next = applyWheelGesture(IDENTITY, {
      deltaX: 40,
      deltaY: -20,
      isZoom: false,
      anchor: { x: 0, y: 0 },
    });

    // pan(camera, -40, 20) at zoom 1 → x -= -40/1, y -= 20/1.
    expect(next).toEqual({ x: 40, y: -20, zoom: 1 });
  });
});

describe('applyWheelGesture (zoom)', () => {
  it('zooms toward the anchor, keeping the anchored world point fixed', () => {
    const anchor = { x: 200, y: 150 };
    const anchorWorldBefore = screenToWorld(anchor, IDENTITY);

    const next = applyWheelGesture(IDENTITY, { deltaX: 0, deltaY: -100, isZoom: true, anchor });
    const anchorScreenAfter = worldToScreen(anchorWorldBefore, next);

    expect(next.zoom).toBeGreaterThan(1);
    expect(anchorScreenAfter.x).toBeCloseTo(anchor.x, 8);
    expect(anchorScreenAfter.y).toBeCloseTo(anchor.y, 8);
  });

  it('clamps zoom-out to the minimum', () => {
    const next = applyWheelGesture(
      { x: 0, y: 0, zoom: MIN_ZOOM },
      { deltaX: 0, deltaY: 10000, isZoom: true, anchor: { x: 0, y: 0 } },
    );

    expect(next.zoom).toBe(MIN_ZOOM);
  });
});

describe('zoomCameraAtCenter', () => {
  it('anchors the zoom at the viewport centre', () => {
    const next = zoomCameraAtCenter(IDENTITY, 800, 600, 2);
    const centerWorldBefore = screenToWorld({ x: 400, y: 300 }, IDENTITY);
    const centerScreenAfter = worldToScreen(centerWorldBefore, next);

    expect(next.zoom).toBe(2);
    expect(centerScreenAfter.x).toBeCloseTo(400, 8);
    expect(centerScreenAfter.y).toBeCloseTo(300, 8);
  });

  it('clamps to the maximum zoom', () => {
    const next = zoomCameraAtCenter({ x: 0, y: 0, zoom: MAX_ZOOM }, 800, 600, 100);

    expect(next.zoom).toBe(MAX_ZOOM);
  });
});
