'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, KeyboardEvent } from 'react';

import { SHAPE_FONT_FAMILY, SHAPE_TEXT_COLOR } from '../renderer/canvas-2d.renderer.constants';
import { getTextEditorMetrics } from './text-editing.helpers';
import type { TextEditorProps } from './text-editing.types';

import styles from './text-editor.module.scss';

/**
 * The DOM `<textarea>` overlay for inline text editing. It is positioned and scaled by the camera
 * to sit exactly over the shape's canvas text. Enter (without Shift) or blur commits; Escape
 * cancels. A `done` guard stops the trailing blur from committing twice after Enter/Escape.
 */
export function TextEditor({ shape, camera, onCommitAction, onCancelAction }: TextEditorProps) {
  const [value, setValue] = useState(shape.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const doneRef = useRef(false);

  const metrics = useMemo(() => getTextEditorMetrics(shape, camera), [shape, camera]);
  const style = useMemo<CSSProperties>(
    () => ({
      left: `${metrics.left}px`,
      top: `${metrics.top}px`,
      width: `${metrics.width}px`,
      height: `${metrics.height}px`,
      fontSize: `${metrics.fontSize}px`,
      lineHeight: `${metrics.height}px`,
      fontFamily: SHAPE_FONT_FAMILY,
      color: SHAPE_TEXT_COLOR,
    }),
    [metrics],
  );

  const commit = () => {
    if (doneRef.current) {
      return;
    }
    doneRef.current = true;
    onCommitAction(value);
  };

  const cancel = () => {
    if (doneRef.current) {
      return;
    }
    doneRef.current = true;
    onCancelAction();
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => setValue(event.target.value);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.select();
    }
  }, []);

  return (
    <textarea
      ref={textareaRef}
      className={styles['text-editor']}
      style={style}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={commit}
    />
  );
}
