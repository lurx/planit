import type { Camera, Shape } from '@planit/shared';
import type { RefObject } from 'react';

/** The active interaction tool. `select` manipulates existing shapes; the rest draw new ones. */
export type ToolId = 'select' | 'rect' | 'ellipse' | 'line' | 'arrow';

/** The subset of tools that create shapes by dragging. */
export type DrawToolId = Exclude<ToolId, 'select'>;

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
