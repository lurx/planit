import { getShapeBounds, worldToScreen } from '@planit/shared';
import type { Camera, Shape } from '@planit/shared';

import { SHAPE_FONT_SIZE } from '../renderer/canvas-2d.renderer.constants';
import { TEXT_LINE_HEIGHT } from './text-editing.constants';
import type { TextEditorMetrics } from './text-editing.types';

/**
 * Screen-space box and font size for the editor overlaying `shape`. It mirrors the canvas text —
 * the same world font size scaled by zoom, on a single line vertically centred on the shape — so
 * the DOM editor and the rendered text stay aligned at any zoom or pan.
 */
export function getTextEditorMetrics(shape: Shape, camera: Camera): TextEditorMetrics {
  const bounds = getShapeBounds(shape);
  const topLeft = worldToScreen({ x: bounds.x, y: bounds.y }, camera);
  const fontSize = SHAPE_FONT_SIZE * camera.zoom;
  const lineHeight = fontSize * TEXT_LINE_HEIGHT;
  const centerY = topLeft.y + (bounds.height * camera.zoom) / 2;

  return {
    left: topLeft.x,
    top: centerY - lineHeight / 2,
    width: bounds.width * camera.zoom,
    height: lineHeight,
    fontSize,
  };
}
