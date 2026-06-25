import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useRenderLoop } from '../use-render-loop.hook';

describe('useRenderLoop', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('schedules a frame when requestRender is called', () => {
    const render = vi.fn();
    const { result } = renderHook(() => useRenderLoop(render));

    act(() => result.current());

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending frame on unmount', () => {
    const { result, unmount } = renderHook(() => useRenderLoop(vi.fn()));

    act(() => result.current());
    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('returns a stable requestRender across renders', () => {
    const { result, rerender } = renderHook(({ onRender }) => useRenderLoop(onRender), {
      initialProps: { onRender: vi.fn() },
    });
    const first = result.current;

    rerender({ onRender: vi.fn() });

    expect(result.current).toBe(first);
  });
});
