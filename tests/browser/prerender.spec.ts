import { expect, test } from "@playwright/test";

test.skip(process.env.PLAYWRIGHT_PRODUCTION !== "1", "Tests the built HTML and hydration");
const routes = ["/", "/o-mnie", "/uslugi", "/portfolio", "/technologie", "/kontakt", "/polityka-prywatnosci", "/dane-firmy"];

test("pełna treść i nawigacja działają bez JavaScriptu na każdej trasie", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    expect((await page.locator("main").innerText()).length).toBeGreaterThan(250);
    expect(await page.locator('a[href="/uslugi"]').count()).toBeGreaterThan(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://lemanczyk-it.pl${route}`);
    const header = await response!.text();
    expect(header).toContain('data-prerendered="true"');
  }
  await page.goto("/");
  await page.locator('header a[href="/uslugi"]').first().click();
  await expect(page).toHaveURL(/\/uslugi$/);
  await expect(page.getByRole("heading", { name: "Linux, VPS i utrzymanie" })).toBeVisible();
  await context.close();
});

test("React przyłącza się do HTML bez błędów i zachowuje metadata przy nawigacji", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.route("**/api/contact-config.php", route => route.fulfill({ contentType: "application/json", body: '{"captcha":{"enabled":false}}' }));
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://lemanczyk-it.pl${route}`);
    await page.locator('header a[href="/uslugi"]').first().click();
    await expect(page).toHaveURL(/\/uslugi$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://lemanczyk-it.pl/uslugi");
  }
  expect(errors).toEqual([]);
});

test("nieistniejąca trasa zachowuje HTTP 404 i noindex po uruchomieniu React", async ({ page }) => {
  const response = await page.goto("/nieistniejaca-strona-testowa");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Ta strona nie istnieje" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
  await page.getByRole("link", { name: "Wróć na stronę główną" }).click();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow,max-image-preview:large");
});
