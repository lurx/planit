import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Toolbar } from '../toolbar.component';
import type { ToolbarProps } from '../toolbar.types';

function renderToolbar(overrides: Partial<ToolbarProps> = {}) {
  const props: ToolbarProps = {
    activeTool: 'select',
    zoom: 1,
    onSelectToolAction: vi.fn(),
    onZoomInAction: vi.fn(),
    onZoomOutAction: vi.fn(),
    onResetViewAction: vi.fn(),
    ...overrides,
  };
  render(<Toolbar {...props} />);
  return props;
}

describe('Toolbar', () => {
  it('marks the active tool as pressed', () => {
    renderToolbar({ activeTool: 'rect' });

    expect(screen.getByRole('button', { name: 'Rectangle' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Select' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('selects a tool when its button is clicked', () => {
    const { onSelectToolAction } = renderToolbar();

    fireEvent.click(screen.getByRole('button', { name: 'Ellipse' }));

    expect(onSelectToolAction).toHaveBeenCalledWith('ellipse');
  });

  it('exposes a button for every tool including text and pan', () => {
    renderToolbar();

    expect(screen.getByRole('button', { name: 'Pan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Text' })).toBeInTheDocument();
  });

  it('renders the zoom percentage from the camera zoom', () => {
    renderToolbar({ zoom: 1.5 });

    expect(screen.getByTestId('toolbar-zoom')).toHaveTextContent('150%');
  });

  it('wires the zoom and reset controls to their handlers', () => {
    const { onZoomInAction, onZoomOutAction, onResetViewAction } = renderToolbar();

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset view' }));

    expect(onZoomInAction).toHaveBeenCalledTimes(1);
    expect(onZoomOutAction).toHaveBeenCalledTimes(1);
    expect(onResetViewAction).toHaveBeenCalledTimes(1);
  });
});
