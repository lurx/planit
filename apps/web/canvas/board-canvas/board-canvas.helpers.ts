import type { Camera, Rect, Shape } from '@planit/shared';
import { getShapeBounds, screenToWorld, toCanvasTransform } from '@planit/shared';

import type { Canvas2DContext, Viewport } from '../renderer';
import {
  FALLBACK_DEVICE_PIXEL_RATIO,
  GRID_LINE_STYLE,
  GRID_LINE_WIDTH_PX,
  GRID_SPACING_WORLD,
  MARQUEE_FILL_STYLE,
  MARQUEE_OUTLINE_STYLE,
  MARQUEE_OUTLINE_WIDTH_PX,
  SELECTION_OUTLINE_STYLE,
  SELECTION_OUTLINE_WIDTH_PX,
  SELECTION_PADDING_PX,
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
/** Install the camera transform (with DPR baked in) so subsequent draws work in world space. */
function applyCameraTransform(ctx: Canvas2DContext, camera: Camera, dpr: number): void {
  const transform = toCanvasTransform(camera);
  ctx.setTransform(
    transform.a * dpr,
    transform.b * dpr,
    transform.c * dpr,
    transform.d * dpr,
    transform.e * dpr,
    transform.f * dpr,
  );
}

export function drawGrid(ctx: Canvas2DContext, camera: Camera, viewport: Viewport): void {
  const { width, height, devicePixelRatio: dpr } = viewport;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width * dpr, height * dpr);
  applyCameraTransform(ctx, camera, dpr);

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

/**
 * Paint selection chrome on the overlay layer: a screen-constant outline around each selected
 * shape plus the in-progress marquee. Layered on top of the overlay's preview pass, so it sets
 * the camera transform without clearing (selection and drawing preview never coexist).
 */
export function drawSelectionOverlay(
  ctx: Canvas2DContext,
  camera: Camera,
  viewport: Viewport,
  selectedShapes: readonly Shape[],
  marquee: Rect | null,
): void {
  if (selectedShapes.length === 0 && !marquee) {
    return;
  }
  applyCameraTransform(ctx, camera, viewport.devicePixelRatio);

  if (selectedShapes.length > 0) {
    const padding = SELECTION_PADDING_PX / camera.zoom;
    ctx.lineWidth = SELECTION_OUTLINE_WIDTH_PX / camera.zoom;
    ctx.strokeStyle = SELECTION_OUTLINE_STYLE;
    ctx.beginPath();
    for (const shape of selectedShapes) {
      const bounds = getShapeBounds(shape);
      ctx.rect(
        bounds.x - padding,
        bounds.y - padding,
        bounds.width + padding * 2,
        bounds.height + padding * 2,
      );
    }
    ctx.stroke();
  }

  if (marquee) {
    ctx.beginPath();
    ctx.rect(marquee.x, marquee.y, marquee.width, marquee.height);
    ctx.fillStyle = MARQUEE_FILL_STYLE;
    ctx.fill();
    ctx.lineWidth = MARQUEE_OUTLINE_WIDTH_PX / camera.zoom;
    ctx.strokeStyle = MARQUEE_OUTLINE_STYLE;
    ctx.stroke();
  }
}
