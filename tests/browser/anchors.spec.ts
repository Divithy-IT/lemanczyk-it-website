import { expect, Page, test } from "@playwright/test";

const routes = ["/", "/o-mnie", "/uslugi", "/portfolio", "/technologie", "/kontakt", "/polityka-prywatnosci", "/dane-firmy"];
const expectedAnchors = [
  "/#main-content", "/o-mnie#main-content", "/uslugi#main-content", "/portfolio#main-content", "/technologie#main-content", "/kontakt#main-content", "/polityka-prywatnosci#main-content", "/dane-firmy#main-content",
  "/uslugi#aplikacje-webowe", "/uslugi#panele-administracyjne", "/uslugi#automatyzacja", "/uslugi#integracje-api", "/uslugi#linux-vps", "/uslugi#ecommerce", "/uslugi#serwery-gier",
  "/portfolio#lemanczyk-platform", "/portfolio#youtube-automation", "/portfolio#lekkaforma", "/portfolio#lemanczyk-it",
];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", error => errors.push(error.message));
  return errors;
}

async function expectAnchorPosition(page: Page, url: string) {
  const fragment = decodeURIComponent(new URL(url, "http://local").hash.slice(1));
  const target = page.locator(`[id="${fragment}"]`);
  await expect(target).toBeVisible();
  await expect.poll(async () => target.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
    const reachedDocumentEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    return rect.top + 1 >= headerBottom && (rect.top < Math.min(innerHeight * .75, headerBottom + 180) || reachedDocumentEnd);
  }), { message: `${url}: target ma być poniżej headera i blisko góry viewportu` }).toBeTruthy();
  await expect(page).toHaveURL(new RegExp(`#${fragment}$`));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy();
}

for (const viewport of [{ name: "mobile", width: 375, height: 812 }, { name: "desktop", width: 1366, height: 800 }]) {
  test(`/uslugi#integracje-api: wejście i refresh na ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport); const errors = watchErrors(page);
    const response = await page.goto("/uslugi#integracje-api"); expect(response?.status()).toBeLessThan(400);
    await expectAnchorPosition(page, "/uslugi#integracje-api");
    await page.reload(); await expectAnchorPosition(page, "/uslugi#integracje-api"); expect(errors).toEqual([]);
  });
}

test("cross-page, same-page, back i forward zachowują fragment", async ({ page }) => {
  const errors = watchErrors(page); await page.goto("/");
  await page.locator('a[href="/uslugi#integracje-api"]').click(); await expectAnchorPosition(page, "/uslugi#integracje-api");
  await page.goto("/uslugi#aplikacje-webowe"); await expectAnchorPosition(page, "/uslugi#aplikacje-webowe");
  await page.evaluate(() => { location.hash = "integracje-api"; }); await expectAnchorPosition(page, "/uslugi#integracje-api");
  await page.goBack(); await expectAnchorPosition(page, "/uslugi#aplikacje-webowe");
  await page.goForward(); await expectAnchorPosition(page, "/uslugi#integracje-api"); expect(errors).toEqual([]);
});

test("historyczne anchory strony głównej kierują bez pętli", async ({ page }) => {
  for (const [hash, path] of [["kontakt", "/kontakt"], ["uslugi", "/uslugi"], ["portfolio", "/portfolio"], ["technologie", "/technologie"], ["o-mnie", "/o-mnie"]]) {
    await page.goto(`/#${hash}`); await expect(page).toHaveURL(new RegExp(`${path}$`));
  }
});

test("parametryczny audyt wszystkich wewnętrznych fragmentów z renderu i danych", async ({ page }) => {
  const discovered = new Set<string>(expectedAnchors);
  for (const route of routes) {
    await page.goto(route);
    const hrefs = await page.locator('a[href*="#"]').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href));
    for (const href of hrefs) { const url = new URL(href); if (url.origin === new URL(page.url()).origin && url.hash) discovered.add(`${url.pathname}${url.hash}`); }
  }
  const errors = watchErrors(page);
  for (const url of discovered) {
    const response = await page.goto(url); if (response) expect(response.status(), url).toBeLessThan(400);
    const id = decodeURIComponent(new URL(url, "http://local").hash.slice(1));
    expect(await page.locator(`[id="${id}"]`).count(), `${url}: dokładnie jeden target`).toBe(1);
    await expectAnchorPosition(page, url);
  }
  expect(errors).toEqual([]);
});
