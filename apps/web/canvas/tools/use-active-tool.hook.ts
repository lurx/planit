import { useEffect, useState } from 'react';

import { DEFAULT_TOOL, TOOL_SHORTCUTS } from './tools.constants';
import type { ToolId, UseActiveToolResult } from './tools.types';

/** True when the event originates from an editable field, where shortcuts must not fire. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
}

/**
 * Own the active tool and bind single-key shortcuts (V select, R rect, O ellipse, L line,
 * A arrow, Esc select). Shortcuts are ignored while typing in a field or when a modifier key is
 * held, so they never clash with browser or text-editing shortcuts.
 */
export function useActiveTool(): UseActiveToolResult {
  const [tool, setTool] = useState<ToolId>(DEFAULT_TOOL);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) {
        return;
      }
      const next = TOOL_SHORTCUTS[event.key.toLowerCase()];
      if (next) {
        setTool(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { tool, setTool };
}
