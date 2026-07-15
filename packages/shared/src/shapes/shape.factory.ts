import { DEFAULT_SHAPE_TEXT, DEFAULT_TEXT_LABEL, SHAPES } from './shape.constants';
import type {
  ArrowShape,
  CreateBoxShapeInput,
  CreateSegmentShapeInput,
  EllipseShape,
  LineShape,
  RectShape,
  TextShape,
} from './shape.types';

export function createRect(input: CreateBoxShapeInput): RectShape {
  return {
    type: SHAPES.RECT,
    id: input.id,
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    text: input.text ?? DEFAULT_SHAPE_TEXT,
  };
}

export function createEllipse(input: CreateBoxShapeInput): EllipseShape {
  return {
    type: SHAPES.ELLIPSE,
    id: input.id,
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    text: input.text ?? DEFAULT_SHAPE_TEXT,
  };
}

export function createText(input: CreateBoxShapeInput): TextShape {
  return {
    type: SHAPES.TEXT,
    id: input.id,
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    text: input.text ?? DEFAULT_TEXT_LABEL,
  };
}

export function createLine(input: CreateSegmentShapeInput): LineShape {
  return {
    type: SHAPES.LINE,
    id: input.id,
    x1: input.x1,
    y1: input.y1,
    x2: input.x2,
    y2: input.y2,
    text: input.text ?? DEFAULT_SHAPE_TEXT,
  };
}

export function createArrow(input: CreateSegmentShapeInput): ArrowShape {
  return {
    type: SHAPES.ARROW,
    id: input.id,
    x1: input.x1,
    y1: input.y1,
    x2: input.x2,
    y2: input.y2,
    text: input.text ?? DEFAULT_SHAPE_TEXT,
  };
}
