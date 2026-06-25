import type { Camera } from './camera.types';

/** Zoom is clamped to this range — 10% to 800% — to keep the transform well-behaved. */
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;

/** A fresh board opens centred on the world origin at 100% zoom. */
export const DEFAULT_CAMERA = { x: 0, y: 0, zoom: 1 } as const satisfies Camera;
