'use client';

import { buildShapeQuadtree } from '@planit/shared';
import type { Shape } from '@planit/shared';
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useWindowSize } from 'usehooks-ts';

import { Canvas2DRenderer } from '../renderer';
import { useRenderLoop } from '../render-loop';
import { isDrawTool, useShapeDrawing } from '../tools';
import { useViewport } from '../viewport';
import {
  drawGrid,
  getDevicePixelRatio,
  getViewportWorldRect,
  syncCanvasSize,
} from './board-canvas.helpers';
import type { BoardCanvasProps } from './board-canvas.types';

import styles from './board-canvas.module.scss';

/**
 * The layered Canvas 2D board. Three stacked canvases keep concerns isolated: a grid layer, the
 * shapes layer (culled via the quadtree, painted by the renderer), and an overlay layer reserved
 * for selection and remote cursors (T3.x). Pan/zoom comes from useViewport; each frame is driven
 * by the coalescing render loop, requested on doc mutations and viewport changes.
 */
export function BoardCanvas({ board, tool }: BoardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const { camera } = useViewport(containerRef, { dragPanEnabled: !isDrawTool(tool) });

  const { width, height } = useWindowSize();

  const commitShape = useCallback((shape: Shape) => board.addShape(shape), [board]);

  const { previewShape } = useShapeDrawing({
    targetRef: containerRef,
    tool,
    camera,
    onCommit: commitShape,
  });

  const render = useCallback(() => {
    const gridCanvas = gridRef.current;
    const shapesCanvas = shapesRef.current;
    const overlayCanvas = overlayRef.current;
    if (!gridCanvas || !shapesCanvas || !overlayCanvas || width === 0 || height === 0) {
      return;
    }

    const gridCtx = gridCanvas.getContext('2d');
    const shapesCtx = shapesCanvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!gridCtx || !shapesCtx || !overlayCtx) {
      return;
    }

    const viewport = { width, height, devicePixelRatio: getDevicePixelRatio() };
    const worldRect = getViewportWorldRect(camera, width, height);
    const visible = buildShapeQuadtree(board.getShapes()).query(worldRect);

    drawGrid(gridCtx, camera, viewport);
    new Canvas2DRenderer(shapesCtx).draw(visible, camera, viewport);
    // The overlay carries the in-progress preview; an empty list clears it once the drag ends.
    new Canvas2DRenderer(overlayCtx).draw(previewShape ? [previewShape] : [], camera, viewport);
  }, [board, camera, width, height, previewShape]);

  const requestRender = useRenderLoop(render);

  useEffect(() => board.observe(requestRender), [board, requestRender]);

  // Size the backing stores only when the viewport (or DPR) changes — reassigning canvas.width
  // clears the bitmap, so we must not do it on every camera move.
  useEffect(() => {
    const dpr = getDevicePixelRatio();
    const layers: RefObject<HTMLCanvasElement | null>[] = [gridRef, shapesRef, overlayRef];
    for (const layer of layers) {
      if (layer.current) {
        syncCanvasSize(layer.current, width, height, dpr);
      }
    }
    requestRender();
  }, [width, height, requestRender]);

  // Repaint on camera changes (pan/zoom) or preview updates without resizing the canvases.
  useEffect(() => {
    requestRender();
  }, [camera, previewShape, requestRender]);

  const surfaceClassName = isDrawTool(tool)
    ? `${styles['board-canvas']} ${styles['board-canvas--drawing']}`
    : styles['board-canvas'];

  const renderLayer = (ref: RefObject<HTMLCanvasElement | null>, testId: string) => (
    <canvas ref={ref} className={styles['board-canvas__layer']} data-testid={testId} />
  );

  return (
    <div ref={containerRef} className={surfaceClassName} data-testid="board-canvas">
      {renderLayer(gridRef, 'board-canvas-grid')}
      {renderLayer(shapesRef, 'board-canvas-shapes')}
      {renderLayer(overlayRef, 'board-canvas-overlay')}
    </div>
  );
}
