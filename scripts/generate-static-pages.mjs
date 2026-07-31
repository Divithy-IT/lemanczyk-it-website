import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const pages = {
  "": ["Programista Full Stack – aplikacje, automatyzacje i VPS | Lemanczyk-IT", "Dedykowane aplikacje webowe, automatyzacje, integracje API oraz rozwiązania Linux i VPS. Doświadczenie programistyczne od 2019 roku.", "Dedykowane aplikacje webowe, automatyzacje i rozwiązania serwerowe"],
  "o-mnie": ["Programista Full Stack z doświadczeniem od 2019 roku | Lemanczyk-IT", "Poznaj Michała Lemanczyka — programistę rozwijającego aplikacje, sklepy internetowe, automatyzacje, API oraz rozwiązania Linux i VPS.", "Programista z doświadczeniem od 2019 roku"],
  "uslugi": ["Usługi programistyczne – aplikacje, API, automatyzacje i Linux | Lemanczyk-IT", "Aplikacje webowe, panele administracyjne, automatyzacje, integracje API, rozwój e-commerce oraz wdrożenia na Linux i VPS.", "Usługi programistyczne dla firm"],
  "portfolio": ["Portfolio programisty – aplikacje webowe i automatyzacje | Lemanczyk-IT", "Zobacz projekty: panel zarządzania serwerami gier, automatyzację materiałów wideo, LekkaForma i stronę Lemanczyk-IT.", "Portfolio aplikacji i automatyzacji"],
  "technologie": ["Technologie – Python, JavaScript, SQL, Linux i API | Lemanczyk-IT", "Technologie wykorzystywane w pracy i projektach: Python, JavaScript, FastAPI, SQL, Linux, nginx, API i GitHub Actions.", "Technologie używane w pracy i projektach"],
  "kontakt": ["Kontakt i wycena usług programistycznych | Lemanczyk-IT", "Opisz aplikację, automatyzację, integrację API lub problem z serwerem. Wstępna rozmowa i orientacyjna wycena są bezpłatne.", "Kontakt i wycena projektu"],
  "polityka-prywatnosci": ["Polityka prywatności | Lemanczyk-IT", "Informacje o przetwarzaniu danych z formularza kontaktowego, logach technicznych i prywatności w serwisie Lemanczyk-IT.", "Polityka prywatności"],
  "dane-firmy": ["Dane firmy | Lemanczyk-IT", "Dane rejestrowe działalności MICHAŁ LEMANCZYK IT.", "Dane firmy Lemanczyk-IT"],
  "404": ["Nie znaleziono strony | Lemanczyk-IT", "Podany adres nie istnieje. Wróć na stronę główną Lemanczyk-IT.", "Ta strona nie istnieje"],
};

const template = await readFile("dist/index.html", "utf8");
for (const [route, [title, description, heading]] of Object.entries(pages)) {
  const canonical = `https://lemanczyk-it.pl/${route}`;
  const html = template
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/<meta name="description" content=".*?"/s, `<meta name="description" content="${description}"`)
    .replace(/<link rel="canonical" href=".*?"/s, `<link rel="canonical" href="${canonical}"`)
    .replace(/<meta property="og:title" content=".*?"/s, `<meta property="og:title" content="${title}"`)
    .replace(/<meta property="og:description" content=".*?"/s, `<meta property="og:description" content="${description}"`)
    .replace(/<meta property="og:url" content=".*?"/s, `<meta property="og:url" content="${canonical}"`)
    .replace(/<div id="root">.*?<\/div>/s, `<div id="root"><main><h1>${heading}</h1><p>${description}</p></main></div>`);
  const output = route ? path.join("dist", route, "index.html") : "dist/index.html";
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, html);
}

for (const file of ["robots.txt", "sitemap.xml", "og-image.svg", "site.webmanifest", "favicon.ico", "favicon.svg"]) {
  await copyFile(file, path.join("dist", file));
}
await mkdir("dist/api", { recursive: true });
await copyFile("api/contact.php", "dist/api/contact.php");
