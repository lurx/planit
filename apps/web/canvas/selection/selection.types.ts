import type { BoardDoc, Camera, Rect } from '@planit/shared';
import type { RefObject } from 'react';

/** The set of currently-selected shape ids. */
export type SelectionSet = ReadonlySet<string>;

export type UseSelectionParams = {
  targetRef: RefObject<HTMLElement | null>;
  board: BoardDoc;
  camera: Camera;
  /** Whether selection interaction is live (the select tool is active and nothing else owns the drag). */
  enabled: boolean;
};

export type UseSelectionResult = {
  selectedIds: SelectionSet;
  /** The in-progress marquee rectangle (world space), or `null` when not marquee-selecting. */
  marquee: Rect | null;
  clearSelection: () => void;
};
