import type { z } from 'zod';

import type {
  arrowShapeSchema,
  ellipseShapeSchema,
  lineShapeSchema,
  rectShapeSchema,
  shapeSchema,
  textShapeSchema,
} from './shape.schema';

export type RectShape = z.infer<typeof rectShapeSchema>;
export type EllipseShape = z.infer<typeof ellipseShapeSchema>;
export type TextShape = z.infer<typeof textShapeSchema>;
export type LineShape = z.infer<typeof lineShapeSchema>;
export type ArrowShape = z.infer<typeof arrowShapeSchema>;

export type Shape = z.infer<typeof shapeSchema>;
export type ShapeType = Shape['type'];

/** Box (`x, y, width, height`) vs segment (`x1, y1, x2, y2`) geometry families. */
export type BoxShape = RectShape | EllipseShape | TextShape;
export type SegmentShape = LineShape | ArrowShape;

/** Factory inputs — `id` is caller-supplied (factories stay pure); `text` defaults to empty. */
export type CreateBoxShapeInput = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
};

export type CreateSegmentShapeInput = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  text?: string;
};
