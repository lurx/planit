import { screenToWorld } from '@planit/shared';
import { useCallback, useEffect, useRef, useState } from 'react';

import { findTopmostShapeAt } from '../selection';
import { TEXT_HIT_TOLERANCE_PX } from './text-editing.constants';
import type { UseTextEditingParams, UseTextEditingResult } from './text-editing.types';

/**
 * Own the "which shape is being text-edited" state and open it on double-click. Double-clicking a
 * shape (select tool only) starts editing it; `commitText` writes the new text to the doc and
 * closes, `cancelEditing` closes without writing. The editor auto-closes when editing is disabled.
 */
export function useTextEditing({
  targetRef,
  board,
  camera,
  enabled,
}: UseTextEditingParams): UseTextEditingResult {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingIdRef = useRef(editingId);
  editingIdRef.current = editingId;
  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  const commitText = useCallback(
    (text: string) => {
      const id = editingIdRef.current;
      if (id) {
        board.updateShape(id, { text });
      }
      setEditingId(null);
    },
    [board],
  );

  const cancelEditing = useCallback(() => setEditingId(null), []);

  // Close an open editor when editing is disabled (e.g. switching to a drawing tool).
  useEffect(() => {
    if (!enabled) {
      setEditingId(null);
    }
  }, [enabled]);

  useEffect(() => {
    const element = targetRef.current;
    if (!element || !enabled) {
      return;
    }

    const handleDoubleClick = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const world = screenToWorld(
        { x: event.clientX - rect.left, y: event.clientY - rect.top },
        cameraRef.current,
      );
      const hitId = findTopmostShapeAt(
        board.getShapes(),
        world,
        TEXT_HIT_TOLERANCE_PX / cameraRef.current.zoom,
      );
      if (hitId) {
        setEditingId(hitId);
      }
    };

    element.addEventListener('dblclick', handleDoubleClick);
    return () => element.removeEventListener('dblclick', handleDoubleClick);
  }, [targetRef, board, enabled]);

  return { editingId, commitText, cancelEditing };
}
