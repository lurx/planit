import { screenToWorld } from '@planit/shared';
import type { Point } from '@planit/shared';
import { useEffect, useRef, useState } from 'react';

import { MIN_DRAW_SIZE_PX, PREVIEW_SHAPE_ID } from './tools.constants';
import { createShapeFromDrag, isDrawTool } from './tools.helpers';
import type { UseShapeDrawingParams, UseShapeDrawingResult } from './tools.types';

type DrawState = {
  pointerId: number;
  startClient: Point;
  startWorld: Point;
};

/**
 * Wire drag-to-draw onto `targetRef` for the active drawing tool: pointer-down anchors the start
 * corner (world space), pointer-move updates a live preview shape, and pointer-up commits the
 * finished shape via `onCommit` — unless the drag was too small to count as anything but a click.
 *
 * The camera is read through a ref so listeners stay attached across pan/zoom; they re-bind only
 * when the tool or target changes. When `select` is active, no listeners are attached at all, so
 * the viewport's drag-pan takes over.
 */
export function useShapeDrawing({
  targetRef,
  tool,
  camera,
  onCommit,
}: UseShapeDrawingParams): UseShapeDrawingResult {
  const [previewShape, setPreviewShape] = useState<UseShapeDrawingResult['previewShape']>(null);
  const drawRef = useRef<DrawState | null>(null);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  useEffect(() => {
    const element = targetRef.current;
    if (!element || !isDrawTool(tool)) {
      return;
    }

    const toWorld = (clientX: number, clientY: number): Point => {
      const rect = element.getBoundingClientRect();
      return screenToWorld({ x: clientX - rect.left, y: clientY - rect.top }, cameraRef.current);
    };

    const handlePointerDown = (event: PointerEvent) => {
      // Only presses on a canvas layer draw — never the toolbar or text editor on top.
      if (!event.isPrimary || event.button !== 0 || !(event.target instanceof HTMLCanvasElement)) {
        return;
      }
      const startWorld = toWorld(event.clientX, event.clientY);
      drawRef.current = {
        pointerId: event.pointerId,
        startClient: { x: event.clientX, y: event.clientY },
        startWorld,
      };
      element.setPointerCapture(event.pointerId);
      setPreviewShape(createShapeFromDrag(tool, startWorld, startWorld, PREVIEW_SHAPE_ID));
    };

    const handlePointerMove = (event: PointerEvent) => {
      const draw = drawRef.current;
      if (!draw || draw.pointerId !== event.pointerId) {
        return;
      }
      const end = toWorld(event.clientX, event.clientY);
      setPreviewShape(createShapeFromDrag(tool, draw.startWorld, end, PREVIEW_SHAPE_ID));
    };

    const endDrag = (event: PointerEvent) => {
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
      drawRef.current = null;
      setPreviewShape(null);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const draw = drawRef.current;
      if (!draw || draw.pointerId !== event.pointerId) {
        return;
      }
      endDrag(event);

      const movedX = Math.abs(event.clientX - draw.startClient.x);
      const movedY = Math.abs(event.clientY - draw.startClient.y);
      if (Math.max(movedX, movedY) < MIN_DRAW_SIZE_PX) {
        return;
      }
      const end = toWorld(event.clientX, event.clientY);
      onCommit(createShapeFromDrag(tool, draw.startWorld, end, crypto.randomUUID()));
    };

    const handlePointerCancel = (event: PointerEvent) => {
      const draw = drawRef.current;
      if (!draw || draw.pointerId !== event.pointerId) {
        return;
      }
      endDrag(event);
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerCancel);
      drawRef.current = null;
    };
  }, [targetRef, tool, onCommit]);

  return { previewShape };
}
