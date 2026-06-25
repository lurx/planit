import type { BoardDoc, Camera } from '@planit/shared';

export type BoardCanvasProps = {
  board: BoardDoc;
  /** Defaults to `DEFAULT_CAMERA`; pan/zoom interaction arrives in T3.1. */
  camera?: Camera;
};
