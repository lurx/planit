import { SHAPES } from '@planit/shared';

import type { ToolButton } from './toolbar.types';

/** Tool buttons in display order: select and pan, then one per shape kind. */
export const TOOL_BUTTONS: readonly ToolButton[] = [
  { id: 'select', label: 'Select', shortcut: 'V', icon: 'M5 3l14 7-6 2-2 6z' },
  {
    id: 'pan',
    label: 'Pan',
    shortcut: 'H',
    icon: 'M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3',
  },
  { id: SHAPES.RECT, label: 'Rectangle', shortcut: 'R', icon: 'M4 6h16v12H4z' },
  { id: SHAPES.ELLIPSE, label: 'Ellipse', shortcut: 'O', icon: 'M12 5a7 6 0 1 0 0.01 0z' },
  { id: SHAPES.TEXT, label: 'Text', shortcut: 'T', icon: 'M5 6h14M12 6v13' },
  { id: SHAPES.LINE, label: 'Line', shortcut: 'L', icon: 'M5 19L19 5' },
  { id: SHAPES.ARROW, label: 'Arrow', shortcut: 'A', icon: 'M5 19L19 5M11 5h8v8' },
];

/** SVG path data (24×24 viewBox) for the zoom controls. */
export const ZOOM_OUT_ICON = 'M6 12h12';
export const ZOOM_IN_ICON = 'M12 6v12M6 12h12';
export const RESET_VIEW_ICON = 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5';

/** Multiply a camera zoom (1 = 100%) into a whole-number percentage for the readout. */
export const ZOOM_PERCENT_SCALE = 100;
