import { createArrow, createEllipse, createLine, createRect } from '@planit/shared';
import type { CreateBoxShapeInput, Point, Shape } from '@planit/shared';

import type { DrawToolId, ToolId } from './tools.types';

/** Narrow a tool to a drawing tool (everything except `select`). */
export function isDrawTool(tool: ToolId): tool is DrawToolId {
  return tool !== 'select';
}

/** Normalize two drag corners into a top-left origin with non-negative extents. */
function toBoxInput(start: Point, end: Point, id: string): CreateBoxShapeInput {
  return {
    id,
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

/**
 * Build the shape a drag from `start` to `end` (world space) should produce for `tool`. Box
 * tools normalize the corners; segment tools keep direction so an arrow points start → end.
 */
export function createShapeFromDrag(tool: DrawToolId, start: Point, end: Point, id: string): Shape {
  switch (tool) {
    case 'rect':
      return createRect(toBoxInput(start, end, id));
    case 'ellipse':
      return createEllipse(toBoxInput(start, end, id));
    case 'line':
      return createLine({ id, x1: start.x, y1: start.y, x2: end.x, y2: end.y });
    case 'arrow':
      return createArrow({ id, x1: start.x, y1: start.y, x2: end.x, y2: end.y });
  }
}
