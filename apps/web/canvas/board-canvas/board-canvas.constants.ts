/** World-space spacing between grid lines, and their appearance (px values divide out zoom). */
export const GRID_SPACING_WORLD = 50;
export const GRID_LINE_STYLE = 'rgba(148, 163, 184, 0.12)';
export const GRID_LINE_WIDTH_PX = 1;

/** Fallback device pixel ratio when `window.devicePixelRatio` is unavailable (e.g. jsdom). */
export const FALLBACK_DEVICE_PIXEL_RATIO = 1;

/** Selection chrome — screen-constant (px values divide out zoom) since it's UI, not content. */
export const SELECTION_OUTLINE_STYLE = '#60a5fa';
export const SELECTION_OUTLINE_WIDTH_PX = 1.5;
export const SELECTION_PADDING_PX = 2;

export const MARQUEE_FILL_STYLE = 'rgba(96, 165, 250, 0.12)';
export const MARQUEE_OUTLINE_STYLE = 'rgba(96, 165, 250, 0.8)';
export const MARQUEE_OUTLINE_WIDTH_PX = 1;

/** Resize handles: white squares with the selection-outline stroke, at a screen-constant size. */
export const RESIZE_HANDLE_SIZE_PX = 8;
export const RESIZE_HANDLE_FILL_STYLE = '#ffffff';
