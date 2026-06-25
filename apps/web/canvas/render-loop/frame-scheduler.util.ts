import type { CancelFrame, FrameScheduler, RequestFrame } from './frame-scheduler.types';

const defaultRequestFrame: RequestFrame = (callback) => requestAnimationFrame(callback);
const defaultCancelFrame: CancelFrame = (handle) => cancelAnimationFrame(handle);

/**
 * Create a frame scheduler that collapses bursts of `request()` calls into one rAF callback —
 * so N document mutations in a tick trigger a single render. `raf`/`caf` are injectable for
 * tests. The frame callbacks are injected (not closed over) so this stays a pure factory.
 */
export function createFrameScheduler(
  onFrame: () => void,
  raf: RequestFrame = defaultRequestFrame,
  caf: CancelFrame = defaultCancelFrame,
): FrameScheduler {
  let handle: number | null = null;

  const tick: FrameRequestCallback = () => {
    handle = null;
    onFrame();
  };

  return {
    request() {
      if (handle !== null) {
        return;
      }
      handle = raf(tick);
    },
    cancel() {
      if (handle !== null) {
        caf(handle);
        handle = null;
      }
    },
  };
}
