'use client';

import { DEFAULT_CAMERA, buildShapeQuadtree } from '@planit/shared';
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useWindowSize } from 'usehooks-ts';

import { Canvas2DRenderer } from '../renderer';
import { useRenderLoop } from '../render-loop';
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
 * for selection and remote cursors (T3.x). Each frame is driven by the coalescing render loop,
 * requested on doc mutations and viewport changes.
 */
export function BoardCanvas({ board, camera = DEFAULT_CAMERA }: BoardCanvasProps) {
  const gridRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  const { width, height } = useWindowSize();

  const render = useCallback(() => {
    const gridCanvas = gridRef.current;
    const shapesCanvas = shapesRef.current;
    if (!gridCanvas || !shapesCanvas || width === 0 || height === 0) {
      return;
    }

    const gridCtx = gridCanvas.getContext('2d');
    const shapesCtx = shapesCanvas.getContext('2d');
    if (!gridCtx || !shapesCtx) {
      return;
    }

    const viewport = { width, height, devicePixelRatio: getDevicePixelRatio() };
    const worldRect = getViewportWorldRect(camera, width, height);
    const visible = buildShapeQuadtree(board.getShapes()).query(worldRect);

    drawGrid(gridCtx, camera, viewport);
    new Canvas2DRenderer(shapesCtx).draw(visible, camera, viewport);
  }, [board, camera, width, height]);

  const requestRender = useRenderLoop(render);

  useEffect(() => board.observe(requestRender), [board, requestRender]);

  useEffect(() => {
    const dpr = getDevicePixelRatio();
    const layers: RefObject<HTMLCanvasElement | null>[] = [gridRef, shapesRef, overlayRef];
    for (const layer of layers) {
      if (layer.current) {
        syncCanvasSize(layer.current, width, height, dpr);
      }
    }
    requestRender();
  }, [width, height, camera, requestRender]);

  const renderLayer = (ref: RefObject<HTMLCanvasElement | null>, testId: string) => (
    <canvas ref={ref} className={styles['board-canvas__layer']} data-testid={testId} />
  );

  return (
    <div className={styles['board-canvas']} data-testid="board-canvas">
      {renderLayer(gridRef, 'board-canvas-grid')}
      {renderLayer(shapesRef, 'board-canvas-shapes')}
      {renderLayer(overlayRef, 'board-canvas-overlay')}
    </div>
  );
}
