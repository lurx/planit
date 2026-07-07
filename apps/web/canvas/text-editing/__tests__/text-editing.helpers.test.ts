import { createRect } from '@planit/shared';
import type { Camera } from '@planit/shared';
import { describe, expect, it } from 'vitest';

import { getTextEditorMetrics } from '../text-editing.helpers';

// SHAPE_FONT_SIZE is 16 and TEXT_LINE_HEIGHT is 1.2 → line height 19.2 at zoom 1.
const RECT = createRect({ id: 'r', x: 0, y: 0, width: 100, height: 40, text: 'hi' });

describe('getTextEditorMetrics', () => {
  it('overlays the shape at zoom 1, vertically centred on a single line', () => {
    const camera: Camera = { x: 0, y: 0, zoom: 1 };

    expect(getTextEditorMetrics(RECT, camera)).toEqual({
      left: 0,
      top: 20 - 19.2 / 2,
      width: 100,
      height: 19.2,
      fontSize: 16,
    });
  });

  it('scales font, box, and position with zoom and pan', () => {
    const camera: Camera = { x: 10, y: 5, zoom: 2 };

    // topLeft screen = (0-10)*2, (0-5)*2 = (-20, -10); centreY = -10 + (40*2)/2 = 30.
    expect(getTextEditorMetrics(RECT, camera)).toEqual({
      left: -20,
      top: 30 - 38.4 / 2,
      width: 200,
      height: 38.4,
      fontSize: 32,
    });
  });
});
