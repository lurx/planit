import { describe, expect, it } from 'vitest';

import type { Point } from '../../geometry/geometry.types';
import { MAX_ZOOM, MIN_ZOOM } from '../camera.constants';
import type { Camera } from '../camera.types';
import {
  clampZoom,
  pan,
  screenToWorld,
  toCanvasTransform,
  worldToScreen,
  zoomAt,
} from '../camera.util';

const CAMERAS = [
  { x: 0, y: 0, zoom: 1 },
  { x: 100, y: -50, zoom: 2 },
  { x: -320.5, y: 240.25, zoom: 0.5 },
] satisfies Camera[];

const POINTS = [
  { x: 0, y: 0 },
  { x: 12.5, y: -7.25 },
  { x: 1000, y: 2000 },
] satisfies Point[];

describe('clampZoom', () => {
  it('passes through a value already in range', () => {
    expect(clampZoom(1)).toBe(1);
  });

  it('clamps below the minimum', () => {
    expect(clampZoom(0.001)).toBe(MIN_ZOOM);
  });

  it('clamps above the maximum', () => {
    expect(clampZoom(1000)).toBe(MAX_ZOOM);
  });
});

describe('worldToScreen', () => {
  it('computes a known screen position', () => {
    const screen = worldToScreen({ x: 150, y: 100 }, { x: 100, y: 50, zoom: 2 });

    expect(screen).toEqual({ x: 100, y: 100 });
  });

  it('maps the camera origin to the screen origin', () => {
    expect(worldToScreen({ x: 100, y: 50 }, { x: 100, y: 50, zoom: 2 })).toEqual({ x: 0, y: 0 });
  });
});

describe('screen/world round-trip', () => {
  it('is the identity across cameras and points', () => {
    for (const camera of CAMERAS) {
      for (const world of POINTS) {
        const roundTripped = screenToWorld(worldToScreen(world, camera), camera);

        expect(roundTripped.x).toBeCloseTo(world.x, 10);
        expect(roundTripped.y).toBeCloseTo(world.y, 10);
      }
    }
  });
});

describe('pan', () => {
  it('offsets the camera by the screen delta divided by zoom', () => {
    const panned = pan({ x: 100, y: 100, zoom: 2 }, 40, -20);

    expect(panned).toEqual({ x: 80, y: 110, zoom: 2 });
  });

  it('keeps the zoom unchanged', () => {
    expect(pan({ x: 0, y: 0, zoom: 0.5 }, 10, 10).zoom).toBe(0.5);
  });
});

describe('zoomAt', () => {
  it('keeps the world point under the anchor pinned to that screen pixel', () => {
    const camera = { x: 100, y: 50, zoom: 1 } satisfies Camera;
    const anchor = { x: 200, y: 150 } satisfies Point;
    const anchorWorldBefore = screenToWorld(anchor, camera);

    const zoomed = zoomAt(camera, anchor, 3);
    const anchorScreenAfter = worldToScreen(anchorWorldBefore, zoomed);

    expect(zoomed.zoom).toBe(3);
    expect(anchorScreenAfter.x).toBeCloseTo(anchor.x, 10);
    expect(anchorScreenAfter.y).toBeCloseTo(anchor.y, 10);
  });

  it('clamps the requested zoom below the minimum', () => {
    expect(zoomAt({ x: 0, y: 0, zoom: 1 }, { x: 0, y: 0 }, 0).zoom).toBe(MIN_ZOOM);
  });

  it('clamps the requested zoom above the maximum', () => {
    expect(zoomAt({ x: 0, y: 0, zoom: 1 }, { x: 0, y: 0 }, 50).zoom).toBe(MAX_ZOOM);
  });
});

describe('toCanvasTransform', () => {
  it('reproduces worldToScreen when applied as an affine transform', () => {
    const camera = { x: -30, y: 80, zoom: 1.5 } satisfies Camera;
    const world = { x: 12, y: 34 } satisfies Point;
    const { a, b, c, d, e, f } = toCanvasTransform(camera);

    const applied = {
      x: a * world.x + c * world.y + e,
      y: b * world.x + d * world.y + f,
    };
    const expected = worldToScreen(world, camera);

    expect(applied.x).toBeCloseTo(expected.x, 10);
    expect(applied.y).toBeCloseTo(expected.y, 10);
  });
});
