import type { ArrowShape, BoxShape, Camera, Point, SegmentShape, Shape } from '@planit/shared';
import { getShapeBounds, hitTestShape, SHAPES, toCanvasTransform } from '@planit/shared';

import {
  ARROWHEAD_ANGLE,
  ARROWHEAD_LENGTH,
  SHAPE_FILL_STYLE,
  SHAPE_FONT_FAMILY,
  SHAPE_FONT_SIZE,
  SHAPE_STROKE_STYLE,
  SHAPE_STROKE_WIDTH,
  SHAPE_TEXT_COLOR,
} from './canvas-2d.renderer.constants';
import type { Canvas2DContext, Renderer, Viewport } from './renderer.types';

const TWO_PI = Math.PI * 2;

/**
 * Canvas 2D implementation of {@link Renderer}. Owns every `ctx` call; everything else in the
 * engine works in world space and never touches the canvas API directly.
 */
export class Canvas2DRenderer implements Renderer {
  constructor(private readonly ctx: Canvas2DContext) {}

  draw(shapes: readonly Shape[], camera: Camera, viewport: Viewport): void {
    const { ctx } = this;
    const { devicePixelRatio: dpr } = viewport;

    // Clear the whole backing store in device pixels, then install the camera transform with
    // the DPR baked in so world units map to crisp device pixels.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, viewport.width * dpr, viewport.height * dpr);

    const transform = toCanvasTransform(camera);
    ctx.setTransform(
      transform.a * dpr,
      transform.b * dpr,
      transform.c * dpr,
      transform.d * dpr,
      transform.e * dpr,
      transform.f * dpr,
    );

    // World-space stroke width: scales with the camera like the shapes it outlines.
    ctx.lineWidth = SHAPE_STROKE_WIDTH;

    for (const shape of shapes) {
      this.drawShape(shape);
    }
  }

  hitTest(worldPoint: Point, shapes: readonly Shape[], tolerance: number): string | null {
    // Topmost-first: later shapes paint on top, so iterate in reverse z-order.
    for (let index = shapes.length - 1; index >= 0; index -= 1) {
      const shape = shapes[index];
      if (shape && hitTestShape(shape, worldPoint, tolerance)) {
        return shape.id;
      }
    }
    return null;
  }

  private drawShape(shape: Shape): void {
    switch (shape.type) {
      case SHAPES.RECT:
        this.drawRect(shape);
        break;
      case SHAPES.ELLIPSE:
        this.drawEllipse(shape);
        break;
      case SHAPES.LINE:
        this.drawSegment(shape);
        break;
      case SHAPES.ARROW:
        this.drawArrow(shape);
        break;
      case SHAPES.TEXT:
        // No outline — a text shape renders only its label below.
        break;
    }
    this.drawText(shape);
  }

  private drawRect(shape: BoxShape): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.rect(shape.x, shape.y, shape.width, shape.height);
    this.fillAndStroke();
  }

  private drawEllipse(shape: BoxShape): void {
    const { ctx } = this;
    const radiusX = shape.width / 2;
    const radiusY = shape.height / 2;
    ctx.beginPath();
    ctx.ellipse(shape.x + radiusX, shape.y + radiusY, radiusX, radiusY, 0, 0, TWO_PI);
    this.fillAndStroke();
  }

  private drawSegment(shape: SegmentShape): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(shape.x1, shape.y1);
    ctx.lineTo(shape.x2, shape.y2);
    ctx.strokeStyle = SHAPE_STROKE_STYLE;
    ctx.stroke();
  }

  private drawArrow(shape: ArrowShape): void {
    this.drawSegment(shape);

    const { ctx } = this;
    const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
    const length = ARROWHEAD_LENGTH;

    ctx.beginPath();
    ctx.moveTo(shape.x2, shape.y2);
    ctx.lineTo(
      shape.x2 - length * Math.cos(angle - ARROWHEAD_ANGLE),
      shape.y2 - length * Math.sin(angle - ARROWHEAD_ANGLE),
    );
    ctx.moveTo(shape.x2, shape.y2);
    ctx.lineTo(
      shape.x2 - length * Math.cos(angle + ARROWHEAD_ANGLE),
      shape.y2 - length * Math.sin(angle + ARROWHEAD_ANGLE),
    );
    ctx.stroke();
  }

  private drawText(shape: Shape): void {
    if (shape.text.length === 0) {
      return;
    }

    const { ctx } = this;
    const bounds = getShapeBounds(shape);
    ctx.fillStyle = SHAPE_TEXT_COLOR;
    ctx.font = `${SHAPE_FONT_SIZE}px ${SHAPE_FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(shape.text, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  }

  private fillAndStroke(): void {
    const { ctx } = this;
    ctx.fillStyle = SHAPE_FILL_STYLE;
    ctx.fill();
    ctx.strokeStyle = SHAPE_STROKE_STYLE;
    ctx.stroke();
  }
}
