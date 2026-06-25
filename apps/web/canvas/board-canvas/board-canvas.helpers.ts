import type { Camera, Rect } from '@planit/shared';
import { screenToWorld, toCanvasTransform } from '@planit/shared';

import type { Canvas2DContext, Viewport } from '../renderer';
import {
  FALLBACK_DEVICE_PIXEL_RATIO,
  GRID_LINE_STYLE,
  GRID_LINE_WIDTH_PX,
  GRID_SPACING_WORLD,
} from './board-canvas.constants';

/** The world-space rectangle currently visible in a `width × height` (CSS px) viewport. */
export function getViewportWorldRect(camera: Camera, width: number, height: number): Rect {
  const topLeft = screenToWorld({ x: 0, y: 0 }, camera);
  const bottomRight = screenToWorld({ x: width, y: height }, camera);

  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  };
}

/** Current device pixel ratio, falling back when the environment doesn't expose one. */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined' || !window.devicePixelRatio) {
    return FALLBACK_DEVICE_PIXEL_RATIO;
  }
  return window.devicePixelRatio;
}

/** Size a canvas's backing store to device pixels while keeping its CSS box at `width × height`. */
export function syncCanvasSize(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  devicePixelRatio: number,
): void {
  canvas.width = Math.round(width * devicePixelRatio);
  canvas.height = Math.round(height * devicePixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

/** Paint the background grid in world space on its own layer. */
export function drawGrid(ctx: Canvas2DContext, camera: Camera, viewport: Viewport): void {
  const { width, height, devicePixelRatio: dpr } = viewport;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width * dpr, height * dpr);

  const transform = toCanvasTransform(camera);
  ctx.setTransform(
    transform.a * dpr,
    transform.b * dpr,
    transform.c * dpr,
    transform.d * dpr,
    transform.e * dpr,
    transform.f * dpr,
  );

  const world = getViewportWorldRect(camera, width, height);
  const startX = Math.floor(world.x / GRID_SPACING_WORLD) * GRID_SPACING_WORLD;
  const startY = Math.floor(world.y / GRID_SPACING_WORLD) * GRID_SPACING_WORLD;
  const endX = world.x + world.width;
  const endY = world.y + world.height;

  ctx.lineWidth = GRID_LINE_WIDTH_PX / camera.zoom;
  ctx.strokeStyle = GRID_LINE_STYLE;
  ctx.beginPath();
  for (let x = startX; x <= endX; x += GRID_SPACING_WORLD) {
    ctx.moveTo(x, world.y);
    ctx.lineTo(x, endY);
  }
  for (let y = startY; y <= endY; y += GRID_SPACING_WORLD) {
    ctx.moveTo(world.x, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();
}
