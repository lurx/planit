import { screenToWorld } from '@planit/shared';
import type { Point, Rect, Shape } from '@planit/shared';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SELECT_TOLERANCE_PX } from './selection.constants';
import {
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

type DragState = MoveDrag | MarqueeDrag;

const EMPTY_SELECTION: SelectionSet = new Set();

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
      if (!event.isPrimary || event.button !== 0) {
        return;
      }
      const world = toWorld(event.clientX, event.clientY);
      const additive = event.shiftKey || event.metaKey;
      const shapes = board.getShapes();
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
