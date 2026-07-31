# Lemanczyk-IT Website

Kod publicznej strony firmowej [lemanczyk-it.pl](https://lemanczyk-it.pl): oferta usług programistycznych, portfolio, technologie, formularz kontaktowy i dokumenty SEO.

Repozytorium: [Divithy-IT/lemanczyk-it-website](https://github.com/Divithy-IT/lemanczyk-it-website)

## Stos

- React, TypeScript i React Router;
- Vite i Tailwind CSS;
- mały endpoint PHP dla formularza;
- statyczne dokumenty HTML generowane dla publicznych tras.

## Praca lokalna

```bash
npm ci
npm run dev
```

Pełna walidacja używana przez CI:

```bash
npm test
```

Workflow GitHub Actions wykonuje instalację zależności, build, kontrolę metadanych SEO, składni PHP, typowych wzorców sekretów i `git diff --check`. Nie wdraża automatycznie produkcji.
