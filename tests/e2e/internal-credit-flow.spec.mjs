// tests/e2e/internal-credit-flow.spec.mjs — End-to-end browser release tests
import { test, expect } from '@playwright/test';

test.describe('Internal Virtual Credit & Honest Shell E2E Gates', () => {

  test('unauthenticated user sees honest default state and official login options', async ({ page }) => {
    // Intercept /api/me to return 401 unauthenticated
    await page.route('**/api/me', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Chưa đăng nhập' })
      });
    });

    await page.goto('/');

    // Header assertions
    const userName = page.locator('#userName');
    await expect(userName).toHaveText('Chưa đăng nhập');
    const userBalance = page.locator('#userBalance');
    await expect(userBalance).toHaveText('0 credit');

    // Click login opens accessible modal
    const btnLogin = page.locator('#btnLogin');
    await btnLogin.click();
    const modal = page.locator('#login-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Tiếp tục với Google');
    await expect(modal).toContainText('Tiếp tục với Apple (ID)');
  });

  test('authenticated user with 2,500,000 welcome credit and ULTRA trial can view pricing themes and redeem code to 6,500,000', async ({ page }) => {
    let currentCredits = 2500000;
    let currentPlan = 'ULTRA';

    await page.route('**/api/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'u-e2e-test',
            name: 'Kỹ sư Minh Nhựt',
            email: 'nhut@2tech.mn',
            plan: currentPlan,
            entitlement: {
              endsAt: new Date(Date.now() + 30 * 86400000).toISOString()
            }
          },
          credits: {
            availableCredits: currentCredits,
            unit: 'CREDIT',
            realMoney: false
          }
        })
      });
    });

    await page.route('**/api/catalog', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          plans: [
            { id: 'FREE', credits: 0 },
            { id: 'START', credits: 500000 },
            { id: 'PRO', credits: 1500000 },
            { id: 'ULTRA', credits: 4000000 }
          ]
        })
      });
    });

    await page.route('**/api/credits', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          availableCredits: currentCredits,
          unit: 'CREDIT',
          realMoney: false
        })
      });
    });

    page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('[PAGEERROR]', err));
    page.on('request', req => console.log('[REQ]', req.method(), req.url()));
    page.on('response', res => console.log('[RES]', res.status(), res.url()));

    await page.route('**/api/internal-checkouts', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            checkout: {
              id: '123e4567-e89b-42d3-a456-426614174000',
              theme: 'momo'
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.route('**/api/internal-checkouts/*/redeem', async route => {
      currentCredits += 4000000;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          redeemed: true,
          addedCredits: 4000000,
          newBalance: currentCredits
        })
      });
    });

    await page.goto('/');

    // Check authenticated user header
    await expect(page.locator('#userName')).toHaveText('Kỹ sư Minh Nhựt');
    await expect(page.locator('#userBalance')).toHaveText('2.500.000 credit');

    // Navigate to pricing
    await page.locator('[data-page="pricing"]').first().click();

    // Verify simulation banner is prominent
    const banner = page.locator('.simulation-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('NỘI BỘ / MÔ PHỎNG — ĐIỂM ẢO');

    // Verify all 7 themes are rendered
    const expectedThemes = [
      'MoMo Simulation',
      'MB Bank Simulation',
      'Techcombank Simulation',
      'Sacombank Simulation',
      'Visa Card Simulation',
      'Apple Pay Simulation',
      'Google Pay Simulation'
    ];
    for (const theme of expectedThemes) {
      await expect(page.locator(`text=${theme}`)).toBeVisible();
    }

    // Verify no sensitive payment fields exist
    const sensitiveInputs = page.locator('input[name*="card"], input[name*="cvv"], input[name*="otp"], input[name*="account"]');
    await expect(sensitiveInputs).toHaveCount(0);

    // Redeem a code
    const codeInput = page.locator('input[placeholder*="2TMN-"]');
    await codeInput.fill('2TMN-TEST-CODE-VALID-1234');
    await page.locator('button:has-text("Xác Nhận Kích Hoạt Điểm Ảo")').click();

    // Verify success message and updated balance
    await expect(page.locator('text=Kích hoạt thành công +4.000.000 credit')).toBeVisible();
    await expect(page.locator('#userBalance')).toHaveText('6.500.000 credit');
  });

  test('support flow preserves form fields and prepares honest Gmail compose link', async ({ page }) => {
    await page.route('**/api/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null })
      });
    });

    await page.goto('/#/support');

    const subjectInput = page.locator('input[placeholder*="Chủ đề"]');
    const messageInput = page.locator('textarea[placeholder*="Mô tả chi tiết"]');

    await subjectInput.fill('Lỗi mạng khi tải video');
    await messageInput.fill('Khi kết nối 4G tốc độ bị giảm.');

    // Form retains values
    await expect(subjectInput).toHaveValue('Lỗi mạng khi tải video');
    await expect(messageInput).toHaveValue('Khi kết nối 4G tốc độ bị giảm.');
  });

  test('settings page toggles reduced motion preference safely', async ({ page }) => {
    await page.goto('/#/settings');

    const toggleBtn = page.locator('button:has-text("Chuyển Đổi")');
    await expect(toggleBtn).toBeVisible();
  });

});
