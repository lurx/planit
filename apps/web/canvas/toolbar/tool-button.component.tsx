'use client';

import { useCallback } from 'react';

import { ToolbarIcon } from './toolbar-icon.component';
import type { ToolButtonProps } from './toolbar.types';

import styles from './toolbar.module.scss';

/** One tool button: an icon that highlights when its tool is active and selects it on click. */
export function ToolButton({ button, isActive, onSelectAction }: ToolButtonProps) {
  const handleClick = useCallback(() => onSelectAction(button.id), [onSelectAction, button.id]);

  const className = isActive
    ? `${styles['toolbar__button']} ${styles['toolbar__button--active']}`
    : styles['toolbar__button'];

  return (
    <button
      type="button"
      className={className}
      title={`${button.label} (${button.shortcut})`}
      aria-label={button.label}
      aria-pressed={isActive}
      onClick={handleClick}
    >
      <ToolbarIcon path={button.icon} />
    </button>
  );
}
