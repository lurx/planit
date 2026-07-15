import type { ToolbarIconProps } from './toolbar.types';

import styles from './toolbar.module.scss';

/** A single-path SVG glyph, stroked in the current text colour. */
export function ToolbarIcon({ path }: ToolbarIconProps) {
  return (
    <svg className={styles['toolbar__icon']} viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
