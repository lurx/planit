import { expect, test } from '@playwright/test';

test('home page links through to a board', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Planit' })).toBeVisible();

  await page.getByRole('link', { name: 'Open a board' }).click();

  await expect(page).toHaveURL(/\/board\/demo$/);
  await expect(page.getByTestId('board-page')).toBeVisible();
});
