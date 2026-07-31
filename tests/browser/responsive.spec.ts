import { expect, Page, test } from "@playwright/test";

const widths = [320, 375, 768, 1024, 1366, 1920];
const routes = ["/", "/o-mnie", "/uslugi", "/portfolio", "/technologie", "/kontakt", "/polityka-prywatnosci"];

for (const width of widths) test(`layout bez poziomego scrolla przy ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
  await expect(page.getByText("Bezpłatna wycena", { exact: true })).toHaveCount(0);
  if (width < 1024) await expect(page.locator(".mobile-menu-button")).toBeVisible(); else await expect(page.locator(".mobile-menu-button")).toBeHidden();
});

for (const viewport of [{ width: 375, height: 812 }, { width: 1366, height: 800 }]) {
  for (const route of routes) test(`header pozostaje przy viewport ${viewport.width}px ${route}`, async ({ page }) => {
    await page.setViewportSize(viewport); await page.goto(route); const header = page.locator(".site-header");
    await expect(header).toBeVisible(); expect(Math.abs((await header.boundingBox())?.y ?? 99)).toBeLessThanOrEqual(1);
    await page.evaluate(() => scrollTo(0, Math.min(1200, document.documentElement.scrollHeight - innerHeight))); await page.waitForTimeout(100);
    expect(Math.abs((await header.boundingBox())?.y ?? 99)).toBeLessThanOrEqual(1); await expect(header).toBeVisible();
    if (viewport.width < 1024) { const button = page.locator(".mobile-menu-button"); await button.focus(); await page.keyboard.press("Enter"); await expect(button).toHaveAttribute("aria-expanded", "true"); await page.keyboard.press("Escape"); await expect(button).toHaveAttribute("aria-expanded", "false"); }
  });
}

test("/o-mnie zawiera właściwy responsywny portret", async ({ page }) => {
  await page.goto("/o-mnie"); const image = page.locator(".about-portrait img"); await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("alt", "Michał Lemanczyk — programista i właściciel Lemanczyk-IT"); await expect(image).toHaveAttribute("width", "516"); await expect(image).toHaveAttribute("height", "688");
  await expect(page.locator(".about-portrait source")).toHaveAttribute("srcset", /michal-lemanczyk-689\.webp/);
});

async function prepareForm(page: Page) {
  await page.addInitScript(() => { (window as any).turnstile = { render: (_el: unknown, options: any) => { setTimeout(() => options.callback("mock-token"), 0); return "widget"; }, reset: () => {}, remove: () => {} }; });
  await page.route("**/api/contact-config.php", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, captcha: { enabled: true, siteKey: "test-site-key" } }) }));
  await page.goto("/kontakt"); await page.getByLabel("Imię lub firma").fill("Firma Test"); await page.getByLabel("E-mail").fill("client@example.com"); await page.getByLabel("Temat").fill("Test"); await page.getByLabel("Opis projektu").fill("To jest poprawna wiadomość testowa formularza."); await page.getByRole("checkbox").check(); await expect(page.getByRole("button", { name: "Wyślij zapytanie" })).toBeEnabled();
}

test("frontend obsługuje sukces JSON, czyści formularz i uruchamia cooldown", async ({ page }) => {
  await page.route("**/api/contact.php", async route => { await new Promise(r => setTimeout(r, 500)); await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, code: "sent", message: "Wiadomość została wysłana. Dziękuję za kontakt." }) }); });
  await prepareForm(page); const button = page.locator('button[type="submit"]'); await button.click(); await expect(page.locator("form")).toHaveAttribute("aria-busy", "true"); await expect(button).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Wiadomość została wysłana"); await expect(page.getByLabel("Imię lub firma")).toHaveValue(""); await expect(page.getByText(/Ponowna wysyłka za/)).toBeVisible();
});

test("frontend nie pokazuje HTML ani Unexpected token", async ({ page }) => {
  await page.route("**/api/contact.php", route => route.fulfill({ status: 502, contentType: "text/html", body: "<html><h1>Bad Gateway</h1></html>" }));
  await prepareForm(page); await page.getByRole("button", { name: "Wyślij zapytanie" }).click(); const status = page.getByRole("status"); await expect(status).toContainText("Nie udało się teraz wysłać"); await expect(status).not.toContainText("Unexpected token"); await expect(status).not.toContainText("<html>");
});
