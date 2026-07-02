import { DEFAULT_CAMERA } from '@planit/shared';
import type { Camera } from '@planit/shared';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useViewport } from '../use-viewport.hook';

let latestCamera: Camera = DEFAULT_CAMERA;

function ViewportHarness() {
  const ref = useRef<HTMLDivElement>(null);
  const { camera } = useViewport(ref);
  latestCamera = camera;
  return <div ref={ref} data-testid="surface" />;
}

describe('useViewport wheel interaction', () => {
  beforeEach(() => {
    latestCamera = DEFAULT_CAMERA;
    render(<ViewportHarness />);
  });

  it('pans on a plain wheel scroll', () => {
    fireEvent.wheel(screen.getByTestId('surface'), { deltaX: 50, deltaY: -20 });

    expect(latestCamera).toEqual({ x: 50, y: -20, zoom: 1 });
  });

  it('zooms in on ctrl + wheel up', () => {
    fireEvent.wheel(screen.getByTestId('surface'), { deltaY: -100, ctrlKey: true });

    expect(latestCamera.zoom).toBeGreaterThan(1);
  });
});
