import { expect, test } from '@playwright/test';

test('board renders stacked canvas layers and paints the grid', async ({ page }) => {
  await page.goto('/board/demo');

  const grid = page.getByTestId('board-canvas-grid');
  const shapes = page.getByTestId('board-canvas-shapes');
  const overlay = page.getByTestId('board-canvas-overlay');

  await expect(grid).toBeVisible();
  await expect(shapes).toBeVisible();
  await expect(overlay).toBeVisible();

  // The backing store is sized to the viewport.
  const width = await grid.evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    return canvas.width;
  });
  expect(width).toBeGreaterThan(0);

  // The grid layer actually painted: at least one non-transparent pixel.
  const gridHasInk = await grid.evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    if (!context) {
      return false;
    }
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] !== 0) {
        return true;
      }
    }
    return false;
  });
  expect(gridHasInk).toBe(true);

  // The shapes layer painted the seeded demo shapes too.
  const shapesHaveInk = await shapes.evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    if (!context) {
      return false;
    }
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] !== 0) {
        return true;
      }
    }
    return false;
  });
  expect(shapesHaveInk).toBe(true);
});
