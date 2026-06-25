import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BoardPage } from '../board-page.component';

describe('BoardPage', () => {
  beforeEach(() => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the board container and canvas', () => {
    render(<BoardPage boardId="demo" />);

    expect(screen.getByTestId('board-page')).toBeInTheDocument();
    expect(screen.getByTestId('board-canvas')).toBeInTheDocument();
  });
});
