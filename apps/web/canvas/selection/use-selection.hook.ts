import { getShapeBounds, screenToWorld } from '@planit/shared';
import type { Point, Rect, ResizeHandlePosition, Shape } from '@planit/shared';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DELETE_KEYS,
  MIN_SHAPE_SIZE,
  RESIZE_HANDLE_HIT_PX,
  SELECT_TOLERANCE_PX,
} from './selection.constants';
import { findHandleAt, getResizeTarget, resizeBounds, resizeShapePatch } from './resize.helpers';
import {
  deleteShapes,
  findTopmostShapeAt,
  getShapeIdsInRect,
  moveShapePatch,
  rectFromPoints,
  toggleId,
} from './selection.helpers';
import type { SelectionSet, UseSelectionParams, UseSelectionResult } from './selection.types';

type MoveDrag = {
  kind: 'move';
  pointerId: number;
  startWorld: Point;
  /** Snapshot of each moved shape at drag start, so deltas apply from the origin without drift. */
  initial: readonly Shape[];
};

type MarqueeDrag = {
  kind: 'marquee';
  pointerId: number;
  startWorld: Point;
  additive: boolean;
};

type ResizeDrag = {
  kind: 'resize';
  pointerId: number;
  shapeId: string;
  handle: ResizeHandlePosition;
  /** The target's bounds at drag start — the resize is computed against these, not live bounds. */
  origBounds: Rect;
};

type DragState = MoveDrag | MarqueeDrag | ResizeDrag;

const EMPTY_SELECTION: SelectionSet = new Set();

/** True when the event originates from an editable field, where Delete/Backspace must not delete shapes. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
}

/**
 * Own the selection set and wire click/marquee-select and drag-to-move onto `targetRef` for the
 * select tool. Clicking a shape selects it (shift/meta toggles); dragging a selected shape moves
 * the whole selection; dragging empty space rubber-bands a marquee; clicking empty space clears.
 *
 * The camera and current selection are read through refs so listeners stay attached across pan,
 * zoom, and selection changes — they re-bind only when the target, board, or `enabled` changes.
 */
export function useSelection({
  targetRef,
  board,
  camera,
  enabled,
}: UseSelectionParams): UseSelectionResult {
  const [selectedIds, setSelectedIds] = useState<SelectionSet>(EMPTY_SELECTION);
  const [marquee, setMarquee] = useState<Rect | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  const clearSelection = useCallback(() => setSelectedIds(EMPTY_SELECTION), []);

  // Delete/Backspace removes the current selection. Always active (independent of the pointer
  // tool) so a selection can be deleted from any tool, but never while typing in a field.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!DELETE_KEYS.has(event.key) || isTypingTarget(event.target)) {
        return;
      }
      if (deleteShapes(board, selectedIdsRef.current) > 0) {
        event.preventDefault();
        setSelectedIds(EMPTY_SELECTION);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board]);

  useEffect(() => {
    const element = targetRef.current;
    if (!element || !enabled) {
      return;
    }

    const toWorld = (clientX: number, clientY: number): Point => {
      const rect = element.getBoundingClientRect();
      return screenToWorld({ x: clientX - rect.left, y: clientY - rect.top }, cameraRef.current);
    };

    const handlePointerDown = (event: PointerEvent) => {
      // Only presses on a canvas layer select/move — never the toolbar or text editor on top.
      if (!event.isPrimary || event.button !== 0 || !(event.target instanceof HTMLCanvasElement)) {
        return;
      }
      const world = toWorld(event.clientX, event.clientY);
      const additive = event.shiftKey || event.metaKey;
      const shapes = board.getShapes();

      // A single selected box shape shows resize handles; a press on one starts a resize and
      // takes priority over selecting or moving.
      const resizeTarget = getResizeTarget(
        shapes.filter((shape) => selectedIdsRef.current.has(shape.id)),
      );
      if (resizeTarget && !additive) {
        const bounds = getShapeBounds(resizeTarget);
        const handle = findHandleAt(bounds, world, RESIZE_HANDLE_HIT_PX / cameraRef.current.zoom);
        if (handle) {
          dragRef.current = {
            kind: 'resize',
            pointerId: event.pointerId,
            shapeId: resizeTarget.id,
            handle,
            origBounds: bounds,
          };
          element.setPointerCapture(event.pointerId);
          return;
        }
      }

      const hitId = findTopmostShapeAt(shapes, world, SELECT_TOLERANCE_PX / cameraRef.current.zoom);

      if (hitId === null) {
        if (!additive) {
          setSelectedIds(EMPTY_SELECTION);
        }
        dragRef.current = {
          kind: 'marquee',
          pointerId: event.pointerId,
          startWorld: world,
          additive,
        };
        setMarquee({ x: world.x, y: world.y, width: 0, height: 0 });
        element.setPointerCapture(event.pointerId);
        return;
      }

      if (additive) {
        // Shift/meta-click toggles membership without starting a move.
        setSelectedIds(toggleId(selectedIdsRef.current, hitId));
        return;
      }

      const selection = selectedIdsRef.current.has(hitId)
        ? selectedIdsRef.current
        : new Set([hitId]);
      setSelectedIds(selection);
      dragRef.current = {
        kind: 'move',
        pointerId: event.pointerId,
        startWorld: world,
        initial: shapes.filter((shape) => selection.has(shape.id)),
      };
      element.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      const world = toWorld(event.clientX, event.clientY);
      if (drag.kind === 'marquee') {
        setMarquee(rectFromPoints(drag.startWorld, world));
        return;
      }
      if (drag.kind === 'resize') {
        const bounds = resizeBounds(drag.origBounds, drag.handle, world, MIN_SHAPE_SIZE);
        board.updateShape(drag.shapeId, resizeShapePatch(bounds));
        return;
      }
      const deltaX = world.x - drag.startWorld.x;
      const deltaY = world.y - drag.startWorld.y;
      for (const shape of drag.initial) {
        board.updateShape(shape.id, moveShapePatch(shape, deltaX, deltaY));
      }
    };

    const releaseCapture = (pointerId: number) => {
      if (element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      dragRef.current = null;
      releaseCapture(event.pointerId);

      if (drag.kind === 'marquee') {
        const rect = rectFromPoints(drag.startWorld, toWorld(event.clientX, event.clientY));
        const caught = getShapeIdsInRect(board.getShapes(), rect);
        setSelectedIds((previous) =>
          drag.additive ? new Set([...previous, ...caught]) : new Set(caught),
        );
        setMarquee(null);
      }
    };

    const handlePointerCancel = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      dragRef.current = null;
      releaseCapture(event.pointerId);
      setMarquee(null);
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
      dragRef.current = null;
    };
  }, [targetRef, board, enabled]);

  return { selectedIds, marquee, clearSelection };
}
