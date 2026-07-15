'use client';

import { ToolButton } from './tool-button.component';
import { ToolbarIcon } from './toolbar-icon.component';
import {
  RESET_VIEW_ICON,
  TOOL_BUTTONS,
  ZOOM_IN_ICON,
  ZOOM_OUT_ICON,
  ZOOM_PERCENT_SCALE,
} from './toolbar.constants';
import type { ToolButton as ToolButtonModel, ToolbarProps } from './toolbar.types';

import styles from './toolbar.module.scss';

/**
 * The floating board toolbar: tool selection (select / pan / one per shape kind) plus zoom
 * controls with a live percentage readout. Purely presentational — all state lives in the board.
 */
export function Toolbar({
  activeTool,
  zoom,
  onSelectToolAction,
  onZoomInAction,
  onZoomOutAction,
  onResetViewAction,
}: ToolbarProps) {
  const zoomPercent = Math.round(zoom * ZOOM_PERCENT_SCALE);

  const renderToolButton = (button: ToolButtonModel) => (
    <ToolButton
      key={button.id}
      button={button}
      isActive={button.id === activeTool}
      onSelectAction={onSelectToolAction}
    />
  );

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Board tools" data-testid="toolbar">
      <div className={styles['toolbar__group']}>{TOOL_BUTTONS.map(renderToolButton)}</div>

      <span className={styles['toolbar__divider']} aria-hidden="true" />

      <div className={styles['toolbar__group']}>
        <button
          type="button"
          className={styles['toolbar__button']}
          title="Zoom out"
          aria-label="Zoom out"
          onClick={onZoomOutAction}
        >
          <ToolbarIcon path={ZOOM_OUT_ICON} />
        </button>

        <span className={styles['toolbar__readout']} data-testid="toolbar-zoom">
          {zoomPercent}%
        </span>

        <button
          type="button"
          className={styles['toolbar__button']}
          title="Zoom in"
          aria-label="Zoom in"
          onClick={onZoomInAction}
        >
          <ToolbarIcon path={ZOOM_IN_ICON} />
        </button>

        <button
          type="button"
          className={styles['toolbar__button']}
          title="Reset view"
          aria-label="Reset view"
          onClick={onResetViewAction}
        >
          <ToolbarIcon path={RESET_VIEW_ICON} />
        </button>
      </div>
    </div>
  );
}
