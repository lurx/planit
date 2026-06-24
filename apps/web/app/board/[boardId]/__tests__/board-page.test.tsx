import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BoardPage } from '../board-page.component';

describe('BoardPage', () => {
  it('renders the board container', () => {
    render(<BoardPage boardId="demo" />);

    expect(screen.getByTestId('board-page')).toBeInTheDocument();
  });

  it('shows the board id', () => {
    render(<BoardPage boardId="abc-123" />);

    expect(screen.getByText('abc-123')).toBeInTheDocument();
  });
});
