import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { render } from "../.prerender/entry-server.js";

// The sitemap lists public routes; page components own their content and metadata.
const sitemap = await readFile("sitemap.xml", "utf8");
const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => {
  const parsed = new URL(url);
  if (parsed.origin !== "https://lemanczyk-it.pl" || parsed.search || parsed.hash) {
    throw new Error(`Unexpected sitemap URL: ${url}`);
  }
  return parsed.pathname;
});
if (!routes.includes("/") || new Set(routes).size !== routes.length) throw new Error("Invalid sitemap routes");

const escapeHtml = value => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const template = await readFile("dist/index.html", "utf8");
for (const route of [...routes, "/404"]) {
  const { markup, metadata } = render(route);
  if (metadata.path !== route) throw new Error(`No matching page for ${route}`);
  const canonical = `https://lemanczyk-it.pl${route}`;
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const schema = metadata.schema ? JSON.stringify(metadata.schema).replace(/</g, "\\u003c") : "null";
  const html = template
    .replace(/<title>.*?<\/title>/s, () => `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?"/s, () => `<meta name="description" content="${description}"`)
    .replace(/<meta name="robots" content=".*?"/s, () => `<meta name="robots" content="${escapeHtml(metadata.robots)}"`)
    .replace(/<link rel="canonical" href=".*?"/s, () => `<link rel="canonical" href="${canonical}"`)
    .replace(/<meta property="og:title" content=".*?"/s, () => `<meta property="og:title" content="${title}"`)
    .replace(/<meta property="og:description" content=".*?"/s, () => `<meta property="og:description" content="${description}"`)
    .replace(/<meta property="og:url" content=".*?"/s, () => `<meta property="og:url" content="${canonical}"`)
    .replace(/<script type="application\/ld\+json">.*?<\/script>/s, () => `<script id="page-schema" type="application/ld+json">${schema}</script>`)
    .replace(/<div id="root">.*?<\/div>/s, () => `<div id="root" data-prerendered="true">${markup}</div>`);
  const output = route === "/" ? "dist/index.html" : path.join("dist", route.slice(1), "index.html");
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, html);
  console.log(`Prerendered ${route}: ${Buffer.byteLength(markup)} bytes of HTML`);
}

for (const file of ["robots.txt", "sitemap.xml", "og-image.svg", "site.webmanifest", "favicon.ico", "favicon.svg", "hero-system-desktop.svg", "hero-system-mobile.svg"]) {
  await copyFile(file, path.join("dist", file));
}
await mkdir("dist/api", { recursive: true });
for (const file of ["contact.php", "contact-config.php", "contact_lib.php", "SmtpMailer.php"]) await copyFile(`api/${file}`, `dist/api/${file}`);
