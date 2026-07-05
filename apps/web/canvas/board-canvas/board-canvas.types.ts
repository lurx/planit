import type { BoardDoc } from '@planit/shared';

import type { ToolId } from '../tools';

export type BoardCanvasProps = {
  board: BoardDoc;
  tool: ToolId;
};
