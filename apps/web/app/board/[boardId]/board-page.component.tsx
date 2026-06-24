import type { BoardPageProps } from './board-page.types';

import styles from './board-page.module.scss';

export function BoardPage({ boardId }: BoardPageProps) {
  return (
    <main className={styles.board} data-testid="board-page">
      <div className={styles.placeholder}>
        <span className={styles.label}>Board</span>
        <code className={styles.id}>{boardId}</code>
        <p className={styles.hint}>Canvas engine lands in Milestone 2.</p>
      </div>
    </main>
  );
}
