/** Shape paint styling. Sizes are in **world units** so they scale with the camera zoom — the
 * shapes, their strokes, text, and arrowheads are all content, not chrome. (The grid, which is
 * chrome, divides out zoom separately so it stays screen-constant.) */
export const SHAPE_STROKE_STYLE = '#e2e8f0';
export const SHAPE_FILL_STYLE = 'rgba(96, 165, 250, 0.12)';
export const SHAPE_STROKE_WIDTH = 2;

export const SHAPE_TEXT_COLOR = '#e2e8f0';
export const SHAPE_FONT_SIZE = 16;
export const SHAPE_FONT_FAMILY = 'system-ui, sans-serif';

export const ARROWHEAD_LENGTH = 12;
export const ARROWHEAD_ANGLE = Math.PI / 7;
