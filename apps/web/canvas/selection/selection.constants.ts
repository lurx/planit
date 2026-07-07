/** Screen-space slop (px) added when hit-testing thin shapes; divided by zoom into world units. */
export const SELECT_TOLERANCE_PX = 6;

/** Screen-space grab radius (px) for resize handles; divided by zoom into world units. */
export const RESIZE_HANDLE_HIT_PX = 12;

/** Smallest a shape may be resized to, in world units. */
export const MIN_SHAPE_SIZE = 10;

/** Keys that delete the current selection. */
export const DELETE_KEYS: ReadonlySet<string> = new Set(['Delete', 'Backspace']);
