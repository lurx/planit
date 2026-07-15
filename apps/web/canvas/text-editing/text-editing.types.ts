import type { BoardDoc, Camera, Shape } from '@planit/shared';
import type { RefObject } from 'react';

/** Screen-space geometry (px) for the text editor overlaying a shape. */
export type TextEditorMetrics = {
  left: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
};

export type UseTextEditingParams = {
  targetRef: RefObject<HTMLElement | null>;
  board: BoardDoc;
  camera: Camera;
  /** Whether double-click-to-edit is live (the select tool is active). */
  enabled: boolean;
};

export type UseTextEditingResult = {
  editingId: string | null;
  commitText: (text: string) => void;
  cancelEditing: () => void;
};

export type TextEditorProps = {
  shape: Shape;
  camera: Camera;
  onCommitAction: (text: string) => void;
  onCancelAction: () => void;
};
