import { describe, expect, it, vi } from 'vitest';

import { createFrameScheduler } from '../frame-scheduler.util';

describe('createFrameScheduler', () => {
  it('coalesces multiple requests into a single frame', () => {
    const raf = vi.fn<(cb: FrameRequestCallback) => number>().mockReturnValue(1);
    const scheduler = createFrameScheduler(() => {}, raf);

    scheduler.request();
    scheduler.request();
    scheduler.request();

    expect(raf).toHaveBeenCalledTimes(1);
  });

  it('runs onFrame on tick and allows scheduling the next frame', () => {
    let tick: FrameRequestCallback = () => {};
    const raf = vi.fn((cb: FrameRequestCallback) => {
      tick = cb;
      return 7;
    });
    const onFrame = vi.fn();
    const scheduler = createFrameScheduler(onFrame, raf);

    scheduler.request();
    tick(0);

    expect(onFrame).toHaveBeenCalledTimes(1);

    scheduler.request();
    expect(raf).toHaveBeenCalledTimes(2);
  });

  it('cancels a pending frame by its handle', () => {
    const raf = vi.fn<(cb: FrameRequestCallback) => number>().mockReturnValue(42);
    const caf = vi.fn();
    const scheduler = createFrameScheduler(() => {}, raf, caf);

    scheduler.request();
    scheduler.cancel();

    expect(caf).toHaveBeenCalledWith(42);
  });

  it('treats cancel as a no-op when nothing is scheduled', () => {
    const caf = vi.fn();
    const scheduler = createFrameScheduler(
      () => {},
      vi.fn<(cb: FrameRequestCallback) => number>().mockReturnValue(1),
      caf,
    );

    scheduler.cancel();

    expect(caf).not.toHaveBeenCalled();
  });

  it('can schedule again after cancelling', () => {
    const raf = vi.fn<(cb: FrameRequestCallback) => number>().mockReturnValue(1);
    const scheduler = createFrameScheduler(() => {}, raf, vi.fn());

    scheduler.request();
    scheduler.cancel();
    scheduler.request();

    expect(raf).toHaveBeenCalledTimes(2);
  });
});
