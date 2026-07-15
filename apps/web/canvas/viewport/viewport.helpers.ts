import type { Camera, Point } from '@planit/shared';
import { pan, zoomAt } from '@planit/shared';

import { ZOOM_WHEEL_SENSITIVITY } from './viewport.constants';
import type { WheelGesture } from './viewport.types';

/**
 * Map a wheel `deltaY` to a multiplicative zoom factor. Scrolling up (negative delta) zooms in
 * (factor > 1); scrolling down zooms out (factor < 1). Exponential so zoom feels uniform.
 */
export function getWheelZoomFactor(deltaY: number): number {
  return Math.exp(-deltaY * ZOOM_WHEEL_SENSITIVITY);
}

/** Apply a wheel gesture to the camera: zoom toward the anchor, or pan by the scroll delta. */
export function applyWheelGesture(camera: Camera, gesture: WheelGesture): Camera {
  if (gesture.isZoom) {
    return zoomAt(camera, gesture.anchor, camera.zoom * getWheelZoomFactor(gesture.deltaY));
  }
  return pan(camera, -gesture.deltaX, -gesture.deltaY);
}

/** Zoom by a factor anchored at the centre of a `width × height` viewport (toolbar buttons). */
export function zoomCameraAtCenter(
  camera: Camera,
  width: number,
  height: number,
  factor: number,
): Camera {
  const center: Point = { x: width / 2, y: height / 2 };
  return zoomAt(camera, center, camera.zoom * factor);
}
