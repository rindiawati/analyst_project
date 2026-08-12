import { test, expect } from "@playwright/test";

const uniqueEmail = () => `e2e+${Date.now()}@example.com`;
const PASSWORD = "test12345";

/**
 * Critical path for Running Track AI:
 * register -> login (no auto-login) -> dashboard empty state -> log a run ->
 * run appears on the dashboard.
 *
 * NOTE: the register endpoint is IP-rate-limited (10/min), so avoid fanning out
 * into many tests that each register.
 */
test("user can register, log in, and log a run", async ({ page }) => {
  const email = uniqueEmail();

  // 1. Register. runtrack does NOT auto-login: it redirects to /login.
  await page.goto("/register");
  await page.fill("[name=email]", email);
  await page.fill("[name=password]", PASSWORD);
  await page.click("button[type=submit]");
  await expect(page).toHaveURL(/\/login$/);

  // 2. Log in -> dashboard.
  await page.fill("[name=email]", email);
  await page.fill("[name=password]", PASSWORD);
  await page.click("button[type=submit]");
  await expect(page).toHaveURL(/\/dashboard/);

  // 3. Dashboard loaded for a user with no runs (Recent runs list was removed;
  //    verify the primary CTA is present instead of the old empty state).
  await expect(
    page.getByRole("link", { name: /log a run/i }),
  ).toBeVisible();

  // 4. Log a run.
  await page.getByRole("link", { name: /log a run/i }).click();
  await expect(page).toHaveURL(/\/activities\/new/);
  await page.fill("[name=distance]", "5.2");
  await page.fill("[name=minutes]", "28");
  // Leave runDate at its default (today) so the run lands in the chart's
  // current-week window.
  await page.click("button[type=submit]");

  // 5. Back on dashboard; the run is reflected in the chart window total
  //    ("Total: 5.2 km ..."). The Recent runs list is gone, so we assert here.
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(/Total: 5\.2 km/)).toBeVisible();
});
