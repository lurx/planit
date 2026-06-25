import { useCallback, useEffect, useRef } from 'react';

import { createFrameScheduler } from './frame-scheduler.util';
import type { FrameScheduler } from './frame-scheduler.types';

/**
 * Drive a render callback through a coalescing animation-frame scheduler. Returns a stable
 * `requestRender` that callers invoke on any change (doc mutation, resize, camera move); bursts
 * collapse to one frame. The latest `render` is always used via a ref, so callers can pass a
 * fresh closure each render without re-subscribing.
 */
export function useRenderLoop(render: () => void): () => void {
  const renderRef = useRef(render);
  renderRef.current = render;

  const schedulerRef = useRef<FrameScheduler | null>(null);
  if (schedulerRef.current === null) {
    schedulerRef.current = createFrameScheduler(() => renderRef.current());
  }

  const requestRender = useCallback(() => {
    schedulerRef.current?.request();
  }, []);

  useEffect(() => {
    const scheduler = schedulerRef.current;
    return () => scheduler?.cancel();
  }, []);

  return requestRender;
}
