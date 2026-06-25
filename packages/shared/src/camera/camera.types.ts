/**
 * The viewport camera over the infinite world plane.
 *
 * `(x, y)` is the **world** coordinate mapped to the viewport's top-left (screen origin);
 * `zoom` is screen pixels per world unit. Screen point `s` and world point `w` relate by:
 *
 *   s = (w - camera) * zoom        (worldToScreen)
 *   w = s / zoom + camera          (screenToWorld)
 */
export type Camera = {
  x: number;
  y: number;
  zoom: number;
};

/**
 * Components of a Canvas 2D affine transform, matching `ctx.setTransform(a, b, c, d, e, f)`.
 * A point maps as `(x, y) => (a*x + c*y + e, b*x + d*y + f)`.
 */
export type CanvasTransform = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
};
