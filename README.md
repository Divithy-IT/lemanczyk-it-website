# Lemanczyk-IT Website

Profesjonalna strona ofertowa Lemanczyk-IT, zbudowana z naciskiem na wydajność, dostępność, SEO i bezpieczną obsługę kontaktu. Wersja produkcyjna działa pod adresem [lemanczyk-it.pl](https://lemanczyk-it.pl).

## Podgląd

| Desktop | Mobile |
| --- | --- |
| ![Strona główna Lemanczyk-IT na desktopie](docs/images/home-desktop.png) | ![Strona główna Lemanczyk-IT na telefonie](docs/images/home-mobile.png) |

## Najważniejsze funkcje

- osobne, indeksowalne podstrony oferty, portfolio, technologii i kontaktu;
- responsywna nawigacja ze sticky headerem i pełną obsługą klawiatury;
- dedykowane warianty ilustracji hero dla desktopu i mobile;
- portfolio z bezpiecznymi linkami do publicznych realizacji i profili;
- formularz kontaktowy z walidacją backendową, Cloudflare Turnstile, honeypotem i limitem jednej skutecznej wiadomości na 180 sekund;
- uwierzytelniona wysyłka SMTP z konfiguracją poza repozytorium;
- statyczne dokumenty HTML dla robotów oraz strona 404.

## Podstrony

`/`, `/o-mnie`, `/uslugi`, `/portfolio`, `/technologie`, `/kontakt`, `/polityka-prywatnosci` oraz `/dane-firmy`.

## Technologie

- React 18, TypeScript i React Router;
- Vite 6 i Tailwind CSS;
- PHP 8 dla endpointu kontaktowego;
- lokalne SVG, semantyczny HTML i CSS;
- nginx i Linux w środowisku produkcyjnym.

## SEO

Każda publiczna trasa ma unikalny tytuł, opis, canonical, Open Graph i logiczny nagłówek H1. Projekt zawiera `sitemap.xml`, `robots.txt`, JSON-LD, manifest, favicony oraz statyczne fallbacki HTML generowane podczas buildu.

## Dostępność

Interfejs zapewnia skip link, widoczne focus states, etykiety formularza, semantyczną nawigację, sterowanie menu klawiaturą, obsługę Escape i `prefers-reduced-motion`. Ilustracje mają określone wymiary, co ogranicza CLS.

## Bezpieczeństwo

Endpoint kontaktowy ustala odbiorcę po stronie serwera, odrzuca próby wstrzyknięcia nagłówków, weryfikuje token Turnstile, ogranicza długość pól i częstotliwość wysyłki oraz zawsze zwraca kontrolowany JSON. Hasła SMTP, klucz CAPTCHA i sekret anonimizujący nigdy nie trafiają do kodu, frontendu ani GitHub Actions.

## Formularz kontaktowy

Mailer używa SMTP submission przez STARTTLS. `.env.example` dokumentuje wyłącznie nazwy wymaganych ustawień. Produkcyjna konfiguracja jest przechowywana poza repozytorium z uprawnieniami `0600`. Pole `From` należy do domeny serwisu, adres klienta trafia do `Reply-To`, a odbiorca jest stały.

Turnstile wymaga widgetu typu Managed ograniczonego do `lemanczyk-it.pl` i `www.lemanczyk-it.pl`. Klucze zapisuje interaktywnie `scripts/configure-turnstile-keys.sh`; publiczny site key trafia do przeglądarki przez kontrolowany endpoint, a secret key pozostaje wyłącznie po stronie serwera.

## Uruchomienie lokalne

Wymagane są Node.js 20+, npm oraz PHP 8 z rozszerzeniem `mbstring`.

```bash
npm ci
npm run dev
```

Serwer deweloperski Vite wyświetli adres lokalny. Formularz wymaga osobnego, lokalnego endpointu PHP lub mocka — nie należy kopiować sekretów produkcyjnych.

## Build

```bash
npm run build
```

Polecenie buduje zasoby Vite, generuje statyczne dokumenty publicznych tras i kopiuje bezpieczne pliki endpointu do `dist/`.

## Testy

```bash
npm test
```

Zestaw obejmuje build, kontrolę SEO i plików technicznych, regresje UI, lint PHP oraz testy formularza z mockowanymi błędami SMTP (timeout, uwierzytelnienie i niedostępny serwer).

## Deployment

Produkcja korzysta z atomowych wydań i symlinkowanego katalogu bieżącej wersji. Nowy build jest weryfikowany przed przełączeniem, a poprzednie wydanie pozostaje dostępne do rollbacku. Szczegóły infrastruktury i sekrety nie są częścią repozytorium.

Push na `main` z zielonym CI uruchamia workflow `Deploy` na self-hosted runnerze na VPS-ie. Runner buduje stronę na swoim koncie, a `deploy/deploy.py` instaluje gotowe `dist/` jako nowe wydanie i przełącza symlink. Wdrożeniem steruje wrapper `/usr/local/lib/lemanczyk-it-website/bin/website-deploy`, który przyjmuje wyłącznie czysty checkout o `HEAD` należącym do `origin/main`.

Wydanie nazywa się `RRRRMMDD-<7 znaków sha>` i jest wyznaczane z commita, więc dwukrotne wdrożenie tego samego commita nie tworzy drugiego katalogu i kończy się `changed=0`.

Ręcznie, z checkoutu na serwerze:

```bash
npm ci && npm run build
sudo ./deploy/deploy.py
sudo ./deploy/deploy.py --apply
```

`npm` nigdy nie jest uruchamiane przez roota — skrypty instalacyjne pakietów wykonują dowolny kod, więc build należy do konta nieuprzywilejowanego, a root dostaje gotowe `dist/`.

Deployer nie dotyka `/etc/`, więc sekrety w `/etc/lemanczyk-it/contact-mailer.env` pozostają nienaruszone; `api/contact-config.php` w repozytorium tylko je wczytuje. Nie dotyka też `/var/www/html`, `/var/www/cs16-fastdl` ani niczego należącego do pozostałych repozytoriów.

Po przełączeniu symlinka deployer sam sprawdza stronę: pobiera każdy adres kanoniczny zadeklarowany w `sitemap.xml` zbudowanego wydania i wymaga `200`. Jeśli którykolwiek nie odpowiada, symlink wraca na poprzednie wydanie, nginx i PHP-FPM są przeładowane, a wdrożenie kończy się błędem. Zielony workflow nie jest dowodem, że strona się otwiera — dowodem jest ten test.

Adresy kanoniczne nie mają końcowego ukośnika (`/o-mnie`, nie `/o-mnie/`). Wersja z ukośnikiem odpowiada przekierowaniem na kanoniczną i **to jest poprawne zachowanie**, a nie awaria.

Retencja jest automatyczna: wrapper zawsze wdraża z `--keep 10`, więc katalog wydań utrzymuje dziesięć najnowszych. Wydanie aktualnie serwowane oraz to, z którego właśnie schodzimy, nigdy nie są usuwane — cel natychmiastowego rollbacku zawsze przetrwa. Ręcznie limit ustawia się flagą, a `--keep 0` wyłącza retencję zupełnie.

Rollback to przełączenie symlinka na poprzednie wydanie, `nginx -t` i reload:

```bash
ls -la /var/www/lemanczyk-it-current
sudo ln -sfn /var/www/lemanczyk-it-releases/<poprzednie> /var/www/lemanczyk-it-current
sudo nginx -t && sudo systemctl reload nginx php8.3-fpm
```

Build wykonuje `cp index.source.html index.html`, więc oba pliki muszą być zgodne w repozytorium. Gdyby się rozjechały, build zabrudziłby drzewo, a wrapper odmówi wdrożenia — to celowe, bo publikowanie niespójnego repozytorium byłoby gorsze.

## GitHub Actions

Workflow CI uruchamia instalację zależności, build, testy, kontrolę składni, walidację planu wdrożenia, podstawowy secret scan oraz `git diff --check`. Samo CI nie wdraża; wdrożenie wykonuje osobny workflow `Deploy`, uruchamiany dopiero po zielonym CI na `main`.

## Lighthouse

Przed wydaniem sprawdzane są warianty mobile i desktop pod kątem Performance, Accessibility, Best Practices i SEO. Wyniki zależą od środowiska testowego i są dokumentowane w raporcie konkretnego wdrożenia.

## Autor

Projekt rozwija Michał Lemanczyk — [profil GitHub Divithy-IT](https://github.com/Divithy-IT).

## Prawa

Source code available for portfolio and educational review. All rights reserved.
