'use client';

import { BoardDoc, createArrow, createEllipse, createRect } from '@planit/shared';
import { useMemo } from 'react';

import { BoardCanvas } from '@/canvas/board-canvas';

import type { BoardPageProps } from './board-page.types';

import styles from './board-page.module.scss';

export function BoardPage({ boardId }: BoardPageProps) {
  const board = useMemo(() => {
    const doc = new BoardDoc();
    // Seed shapes so a fresh board isn't empty; draw more with the creation tools (R/O/L/A).
    doc.addShape(
      createRect({
        id: `${boardId}-rect`,
        x: 120,
        y: 120,
        width: 220,
        height: 130,
        text: 'Planit',
      }),
    );
    doc.addShape(
      createEllipse({ id: `${boardId}-ellipse`, x: 420, y: 160, width: 160, height: 160 }),
    );
    doc.addShape(createArrow({ id: `${boardId}-arrow`, x1: 360, y1: 360, x2: 540, y2: 420 }));
    return doc;
  }, [boardId]);

  return (
    <main className={styles.board} data-testid="board-page">
      <BoardCanvas board={board} />
    </main>
  );
}
