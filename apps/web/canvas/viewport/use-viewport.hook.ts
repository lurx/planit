import { DEFAULT_CAMERA, pan } from '@planit/shared';
import type { Camera } from '@planit/shared';
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ZOOM_BUTTON_STEP } from './viewport.constants';
import { applyWheelGesture, zoomCameraAtCenter } from './viewport.helpers';
import type { UseViewportOptions, UseViewportResult } from './viewport.types';

type DragState = {
  pointerId: number;
  lastX: number;
  lastY: number;
};

/**
 * Own the board's camera and wire pan/zoom interaction onto `targetRef`:
 * - drag (primary button) pans, with pointer capture so it continues outside the element;
 * - plain wheel / two-finger trackpad pans; pinch or ctrl/cmd + wheel zooms toward the cursor.
 *
 * The wheel listener is attached natively (non-passive) so it can `preventDefault` the browser's
 * page zoom/scroll — React's synthetic wheel handler is passive and can't.
 */
export function useViewport(
  targetRef: RefObject<HTMLElement | null>,
  options: UseViewportOptions = {},
): UseViewportResult {
  const { dragPanEnabled = true } = options;
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) {
      return;
    }

    const toAnchor = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const anchor = toAnchor(event.clientX, event.clientY);
      const isZoom = event.ctrlKey || event.metaKey;
      setCamera((current) =>
        applyWheelGesture(current, { deltaX: event.deltaX, deltaY: event.deltaY, isZoom, anchor }),
      );
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!dragPanEnabled || !event.isPrimary || event.button !== 0) {
        return;
      }
      dragRef.current = { pointerId: event.pointerId, lastX: event.clientX, lastY: event.clientY };
      element.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      const deltaX = event.clientX - drag.lastX;
      const deltaY = event.clientY - drag.lastY;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      setCamera((current) => pan(current, deltaX, deltaY));
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (dragRef.current?.pointerId !== event.pointerId) {
        return;
      }
      dragRef.current = null;
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerUp);

    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [targetRef, dragPanEnabled]);

  const zoomAtViewportCenter = useCallback(
    (factor: number) => {
      const element = targetRef.current;
      if (!element) {
        return;
      }
      setCamera((current) =>
        zoomCameraAtCenter(current, element.clientWidth, element.clientHeight, factor),
      );
    },
    [targetRef],
  );

  const zoomIn = useCallback(() => zoomAtViewportCenter(ZOOM_BUTTON_STEP), [zoomAtViewportCenter]);
  const zoomOut = useCallback(
    () => zoomAtViewportCenter(1 / ZOOM_BUTTON_STEP),
    [zoomAtViewportCenter],
  );
  const resetView = useCallback(() => setCamera(DEFAULT_CAMERA), []);

  return { camera, zoomIn, zoomOut, resetView };
}
