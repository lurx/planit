import type { Camera, Point } from '@planit/shared';

/** A normalized wheel interaction: pan by default, zoom toward `anchor` when `isZoom`. */
export type WheelGesture = {
  deltaX: number;
  deltaY: number;
  /** True for pinch / ctrl / cmd + wheel (zoom); false for plain scroll (pan). */
  isZoom: boolean;
  /** Screen-space (canvas-local) point the zoom is anchored to. */
  anchor: Point;
};

export type UseViewportResult = {
  camera: Camera;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
};
