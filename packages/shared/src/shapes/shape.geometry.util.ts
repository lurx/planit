import type { Point, Rect } from '../geometry/geometry.types';
import { pointInEllipse, pointInRect, pointNearSegment } from '../geometry/geometry.util';
import { SHAPES } from './shape.constants';
import type { Shape } from './shape.types';

/** The axis-aligned bounding box of a shape, in world space. */
export function getShapeBounds(shape: Shape): Rect {
  switch (shape.type) {
    case SHAPES.RECT:
    case SHAPES.ELLIPSE:
    case SHAPES.TEXT:
      return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
    case SHAPES.LINE:
    case SHAPES.ARROW:
      return {
        x: Math.min(shape.x1, shape.x2),
        y: Math.min(shape.y1, shape.y2),
        width: Math.abs(shape.x2 - shape.x1),
        height: Math.abs(shape.y2 - shape.y1),
      };
  }
}

/**
 * Is the world-space `point` a hit on `shape`? Boxes test their fill (rect/ellipse), segments
 * test proximity within `tolerance` (line/arrow) — tolerance is the caller's world-space slop.
 */
export function hitTestShape(shape: Shape, point: Point, tolerance: number): boolean {
  switch (shape.type) {
    case SHAPES.RECT:
    case SHAPES.TEXT:
      return pointInRect(point, getShapeBounds(shape));
    case SHAPES.ELLIPSE:
      return pointInEllipse(point, getShapeBounds(shape));
    case SHAPES.LINE:
    case SHAPES.ARROW:
      return pointNearSegment(
        point,
        { x: shape.x1, y: shape.y1 },
        { x: shape.x2, y: shape.y2 },
        tolerance,
      );
  }
}
