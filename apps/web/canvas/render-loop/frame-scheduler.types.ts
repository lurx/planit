/** Coalesces many render requests into a single animation frame. */
export type FrameScheduler = {
  /** Schedule a frame if one isn't already pending (multiple calls collapse to one). */
  request: () => void;
  /** Cancel a pending frame, if any. */
  cancel: () => void;
};

export type RequestFrame = (callback: FrameRequestCallback) => number;
export type CancelFrame = (handle: number) => void;
