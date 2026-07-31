import { readFile } from "node:fs/promises";
const chrome = await readFile("src/app/components/SiteChrome.tsx", "utf8");
const pages = await readFile("src/app/components/Pages.tsx", "utf8");
const styles = await readFile("src/styles/index.css", "utf8");
const data = await readFile("src/app/siteData.ts", "utf8");
const checks = [
  [chrome.includes("site-header-spacer") && styles.includes("position: fixed !important"), "fixed header z kompensacją"],
  [!chrome.includes("Bezpłatna wycena"), "brak CTA w menu"],
  [chrome.includes("aria-expanded={open}") && chrome.includes("aria-controls=\"mobile-menu\""), "ARIA menu"],
  [styles.includes("@media (min-width: 1024px)") && styles.includes("display: none !important"), "hamburger ukryty desktop"],
  [styles.includes("@media (max-width: 1023px)") && styles.includes("mobile-menu-button"), "hamburger mobile"],
  [pages.includes("hero-system-desktop.svg") && pages.includes("hero-system-mobile.svg") && pages.includes("<picture"), "warianty hero"],
  [data.includes("https://www.youtube.com/@Divithy") && pages.includes("Zobacz kanał YouTube"), "link YouTube"],
  [!data.includes("https://github.com/Divithy-IT/lemanczyk-platform"), "brak linku do prywatnego repo"],
  [pages.includes("michal-lemanczyk-689.webp") && pages.includes("about-portrait"), "responsywny portret"],
];
const failed = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failed.length) throw new Error(`Nieudane testy UI: ${failed.join(", ")}`);
console.log(`Testy regresyjne UI: ${checks.length} OK`);
