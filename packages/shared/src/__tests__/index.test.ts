import { describe, expect, it } from 'vitest';

import { SHARED_PACKAGE_NAME } from '../index';

describe('@planit/shared', () => {
  it('exposes its package name', () => {
    expect(SHARED_PACKAGE_NAME).toBe('@planit/shared');
  });
});
