import type { Camera, Shape, ShapeType } from '@planit/shared';
import type { RefObject } from 'react';

/** The subset of tools that create shapes by dragging — one per shape kind. */
export type DrawToolId = ShapeType;

/**
 * The active interaction tool. `select` manipulates existing shapes, `pan` navigates the canvas,
 * and the rest ({@link DrawToolId}, one per shape kind) draw new shapes.
 */
export type ToolId = 'select' | 'pan' | DrawToolId;

export type UseActiveToolResult = {
  tool: ToolId;
  setTool: (tool: ToolId) => void;
};

export type UseShapeDrawingParams = {
  targetRef: RefObject<HTMLElement | null>;
  tool: ToolId;
  camera: Camera;
  /** Commit a finished shape to the document (typically `board.addShape`). */
  onCommit: (shape: Shape) => void;
};

export type UseShapeDrawingResult = {
  /** The shape currently being dragged out, for painting on the overlay layer; `null` when idle. */
  previewShape: Shape | null;
};
