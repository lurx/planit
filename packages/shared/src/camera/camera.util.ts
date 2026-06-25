import type { Point } from '../geometry/geometry.types';
import { MAX_ZOOM, MIN_ZOOM } from './camera.constants';
import type { Camera, CanvasTransform } from './camera.types';

/** Clamp a zoom value into the supported `[MIN_ZOOM, MAX_ZOOM]` range. */
export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

/** Convert a world-space point to its screen-space pixel position under the camera. */
export function worldToScreen(world: Point, camera: Camera): Point {
  return {
    x: (world.x - camera.x) * camera.zoom,
    y: (world.y - camera.y) * camera.zoom,
  };
}

/** Convert a screen-space pixel position back to its world-space point under the camera. */
export function screenToWorld(screen: Point, camera: Camera): Point {
  return {
    x: screen.x / camera.zoom + camera.x,
    y: screen.y / camera.zoom + camera.y,
  };
}

/**
 * Pan the camera by a screen-space delta (e.g. a drag of `dx, dy` pixels). The world content
 * follows the cursor: dragging right by `dx` reveals content to the left.
 */
export function pan(camera: Camera, deltaScreenX: number, deltaScreenY: number): Camera {
  return {
    x: camera.x - deltaScreenX / camera.zoom,
    y: camera.y - deltaScreenY / camera.zoom,
    zoom: camera.zoom,
  };
}

/**
 * Zoom to `nextZoom` (clamped) while keeping the world point under `anchorScreen` pinned to
 * that same screen pixel — the standard "zoom toward the cursor" behaviour (PRD Challenge 1).
 */
export function zoomAt(camera: Camera, anchorScreen: Point, nextZoom: number): Camera {
  const zoom = clampZoom(nextZoom);
  const anchorWorld = screenToWorld(anchorScreen, camera);

  return {
    x: anchorWorld.x - anchorScreen.x / zoom,
    y: anchorWorld.y - anchorScreen.y / zoom,
    zoom,
  };
}

/**
 * Build the Canvas 2D affine transform for the camera, ready for `ctx.setTransform(...)`.
 * Applying it to a world point yields exactly `worldToScreen(point, camera)`.
 */
export function toCanvasTransform(camera: Camera): CanvasTransform {
  return {
    a: camera.zoom,
    b: 0,
    c: 0,
    d: camera.zoom,
    e: -camera.x * camera.zoom,
    f: -camera.y * camera.zoom,
  };
}
