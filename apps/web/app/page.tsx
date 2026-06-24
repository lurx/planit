import Link from 'next/link';

import styles from './page.module.scss';

const SAMPLE_BOARD_ID = 'demo';

export default function HomePage() {
  return (
    <main className={styles.home}>
      <h1 className={styles.title}>Planit</h1>
      <p className={styles.subtitle}>Real-time collaborative whiteboard.</p>
      <Link className={styles.cta} href={`/board/${SAMPLE_BOARD_ID}`}>
        Open a board
      </Link>
    </main>
  );
}
