import { BoardDoc, createRect } from '@planit/shared';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BoardCanvas } from '../board-canvas.component';

/** Queued frame callbacks, drained by {@link flushFrames} — models real (async) rAF ordering. */
const frames: FrameRequestCallback[] = [];

function flushFrames(): void {
  const pending = frames.splice(0);
  for (const frame of pending) {
    frame(0);
  }
}

describe('BoardCanvas', () => {
  beforeEach(() => {
    frames.length = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => frames.push(cb));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders three stacked canvas layers', () => {
    render(<BoardCanvas board={new BoardDoc()} tool="select" />);

    expect(screen.getByTestId('board-canvas-grid')).toBeInTheDocument();
    expect(screen.getByTestId('board-canvas-shapes')).toBeInTheDocument();
    expect(screen.getByTestId('board-canvas-overlay')).toBeInTheDocument();
  });

  it('requests a frame when the board document changes', () => {
    const board = new BoardDoc();
    render(<BoardCanvas board={board} tool="select" />);
    // Drain the mount frame so the scheduler is idle, then watch for a new request.
    flushFrames();
    vi.mocked(window.requestAnimationFrame).mockClear();

    board.addShape(createRect({ id: 'r', x: 0, y: 0, width: 10, height: 10 }));

    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });
});
