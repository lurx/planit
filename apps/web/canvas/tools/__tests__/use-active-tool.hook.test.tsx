import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useActiveTool } from '../use-active-tool.hook';

function ToolHarness() {
  const { tool } = useActiveTool();
  return (
    <div>
      <span data-testid="tool">{tool}</span>
      <input data-testid="field" />
    </div>
  );
}

describe('useActiveTool shortcuts', () => {
  beforeEach(() => {
    render(<ToolHarness />);
  });

  it('defaults to the select tool', () => {
    expect(screen.getByTestId('tool')).toHaveTextContent('select');
  });

  it('switches tools on single-key shortcuts', () => {
    fireEvent.keyDown(window, { key: 'r' });
    expect(screen.getByTestId('tool')).toHaveTextContent('rect');

    fireEvent.keyDown(window, { key: 'o' });
    expect(screen.getByTestId('tool')).toHaveTextContent('ellipse');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByTestId('tool')).toHaveTextContent('select');
  });

  it('ignores shortcuts while a modifier key is held', () => {
    fireEvent.keyDown(window, { key: 'r', metaKey: true });

    expect(screen.getByTestId('tool')).toHaveTextContent('select');
  });

  it('ignores shortcuts while typing in a field', () => {
    fireEvent.keyDown(screen.getByTestId('field'), { key: 'r' });

    expect(screen.getByTestId('tool')).toHaveTextContent('select');
  });
});
