import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// We run Vitest without globals, so Testing Library's automatic afterEach cleanup isn't
// registered — do it explicitly so each test starts with a fresh DOM.
afterEach(() => {
  cleanup();
});
