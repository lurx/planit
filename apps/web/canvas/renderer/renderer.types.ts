import type { Camera, Shape } from '@planit/shared';

/**
 * The exact subset of `CanvasRenderingContext2D` the Canvas 2D renderer touches. Depending on
 * this narrow shape (rather than the full context) keeps canvas calls isolated to the renderer
 * and lets unit tests pass a lightweight mock. A real 2D context structurally satisfies it.
 */
export type Canvas2DContext = Pick<
  CanvasRenderingContext2D,
  | 'clearRect'
  | 'beginPath'
  | 'rect'
  | 'ellipse'
  | 'moveTo'
  | 'lineTo'
  | 'stroke'
  | 'fill'
  | 'fillText'
  | 'lineWidth'
  | 'strokeStyle'
  | 'fillStyle'
  | 'font'
  | 'textAlign'
  | 'textBaseline'
> & {
  // Narrowed to the six-number form (drop the DOMMatrix overload) so mocked call args type
  // cleanly as numbers. A real CanvasRenderingContext2D still satisfies this signature.
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
};

/** Device viewport the renderer clears and scales for. `width`/`height` are CSS pixels. */
export type Viewport = {
  width: number;
  height: number;
  devicePixelRatio: number;
};

/**
 * The pluggable rendering backend (Architecture §3). Canvas 2D today; a `WebGLRenderer` could
 * implement the same contract later without touching input, CRDT, or culling. Callers pass the
 * already-culled, world-space shapes each frame — the renderer is stateless between draws.
 */
export type Renderer = {
  draw(shapes: readonly Shape[], camera: Camera, viewport: Viewport): void;
  /** Topmost shape id whose geometry is hit by `worldPoint` within `tolerance`, else `null`. */
  hitTest(
    worldPoint: { x: number; y: number },
    shapes: readonly Shape[],
    tolerance: number,
  ): string | null;
};
