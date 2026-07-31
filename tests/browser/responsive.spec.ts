import { expect, test } from "@playwright/test";

const widths = [320, 375, 768, 1024, 1366, 1920];
for (const width of widths) {
  test(`strona główna bez poziomego scrolla przy ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 }); await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
    await expect(page.locator(".site-header")).toHaveCSS("position", "sticky");
    await expect(page.getByText("Bezpłatna wycena", { exact: true })).toHaveCount(0);
    const menu = page.locator(".mobile-menu-button");
    if (width < 1024) await expect(menu).toBeVisible(); else await expect(menu).toBeHidden();
  });
}

test("mobilne menu otwiera się i zamyka klawiszem Escape", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); await page.goto("/");
  const button = page.locator(".mobile-menu-button"); await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true"); await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
});

test("hero korzysta z dwóch responsywnych zasobów", async ({ page }) => {
  await page.goto("/"); const picture = page.locator(".hero-illustration");
  await expect(picture.locator("source[media='(max-width: 767px)']")).toHaveAttribute("srcset", "/hero-system-mobile.svg");
  await expect(picture.locator("img")).toHaveAttribute("src", "/hero-system-desktop.svg");
});

test("portfolio zawiera bezpieczny link do kanału YouTube", async ({ page }) => {
  await page.goto("/portfolio"); const link = page.getByRole("link", { name: /Zobacz kanał YouTube/ });
  await expect(link).toHaveAttribute("href", "https://www.youtube.com/@Divithy");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
});
