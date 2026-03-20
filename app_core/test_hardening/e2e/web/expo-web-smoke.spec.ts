import { test, expect } from '@playwright/test';







test.describe('Expo web + API', () => {



  test('loads Projects screen and reaches loaded or error state', async ({ page }) => {



    await page.goto('/');



    await expect(page.getByText('Projects', { exact: true })).toBeVisible({ timeout: 90_000 });



    await expect(



      page.getByText(/Recent Projects|Loading control center|Error:/)



    ).toBeVisible({ timeout: 120_000 });



  });



});




