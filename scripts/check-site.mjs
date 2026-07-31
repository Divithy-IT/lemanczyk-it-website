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
