import { readFile } from "node:fs/promises";

const routes = ["", "o-mnie", "uslugi", "portfolio", "technologie", "kontakt", "polityka-prywatnosci", "dane-firmy"];
const titles = new Set();
const descriptions = new Set();
let failed = false;

for (const route of routes) {
  const file = route ? `dist/${route}/index.html` : "dist/index.html";
  const html = await readFile(file, "utf8");
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = html.match(/<meta name="description" content="(.*?)"/s)?.[1];
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  const expectedCanonical = `https://lemanczyk-it.pl/${route}`;
  const checks = [
    [title && !titles.has(title), "unikalny title"],
    [description && !descriptions.has(description), "unikalny description"],
    [html.includes(`rel="canonical" href="${expectedCanonical}"`), "canonical"],
    [h1Count === 1, "jeden H1"],
    [html.includes('<html lang="pl">'), "lang=pl"],
    [html.includes('property="og:title"'), "Open Graph"],
    [html.includes('application/ld+json'), "JSON-LD"],
  ];
  for (const [ok, label] of checks) {
    if (!ok) { console.error(`${file}: brak lub błąd — ${label}`); failed = true; }
  }
  if (title) titles.add(title);
  if (description) descriptions.add(description);
}

for (const file of ["dist/robots.txt", "dist/sitemap.xml", "dist/site.webmanifest", "dist/404/index.html", "dist/api/contact.php"]) {
  await readFile(file);
}
if (failed) process.exit(1);
console.log(`Sprawdzono ${routes.length} podstron: SEO i pliki techniczne OK.`);

const pagesSource = await readFile("src/app/components/Pages.tsx", "utf8");
const dataSource = await readFile("src/app/siteData.ts", "utf8");
const chromeSource = await readFile("src/app/components/SiteChrome.tsx", "utf8");
const literalIds = [...pagesSource.matchAll(/id="([a-z0-9-]+)"/g), ...chromeSource.matchAll(/id="([a-z0-9-]+)"/g)].map(match => match[1]);
const dataIds = [...dataSource.matchAll(/\bid:\s*"([a-z0-9-]+)"/g)].map(match => match[1]);
const allIds = [...literalIds, ...dataIds];
const invalidIds = allIds.filter(id => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id));
const duplicateDataIds = dataIds.filter((id, index) => dataIds.indexOf(id) !== index);
if (invalidIds.length || duplicateDataIds.length) throw new Error(`Błędne ID: ${invalidIds.join(", ")}; duplikaty danych: ${duplicateDataIds.join(", ")}`);
console.log(`Audyt fragmentów: ${allIds.length} deklaracji ID, poprawny format, brak duplikatów danych.`);
