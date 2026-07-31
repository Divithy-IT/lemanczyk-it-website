export const company = {
  name: "MICHAŁ LEMANCZYK IT",
  brand: "Lemanczyk-IT",
  email: "michal@lemanczyk-it.pl",
  phone: "+48 662 612 726",
  phoneHref: "+48662612726",
  address: "Ogrody 17/90, 85-870 Bydgoszcz",
  nip: "9532817901",
  regon: "544222506",
  github: "https://github.com/Divithy-IT",
};

export const navigation = [
  ["/", "Start"],
  ["/o-mnie", "O mnie"],
  ["/uslugi", "Usługi"],
  ["/portfolio", "Portfolio"],
  ["/technologie", "Technologie"],
  ["/kontakt", "Kontakt"],
] as const;

export const services = [
  {
    id: "aplikacje-webowe",
    title: "Aplikacje i strony internetowe",
    lead: "Buduję rozwiązania dopasowane do procesu firmy — od czytelnej strony ofertowej po dedykowaną aplikację.",
    items: ["firmowe strony i serwisy ofertowe", "dedykowane aplikacje webowe", "formularze i procesy online", "modernizacja, wydajność i naprawa błędów"],
  },
  {
    id: "panele-administracyjne",
    title: "Panele administracyjne",
    lead: "Porządkuję codzienne operacje w jednym bezpiecznym miejscu, z właściwym dostępem dla każdej roli.",
    items: ["dashboardy i statystyki", "użytkownicy, role i uprawnienia", "monitoring, raporty i historia działań", "integracje z backendem i bezpieczne logowanie"],
  },
  {
    id: "automatyzacja",
    title: "Automatyzacja procesów",
    lead: "Zamieniam powtarzalne czynności w przewidywalny proces, który oszczędza czas i ogranicza pomyłki.",
    items: ["przetwarzanie plików i danych", "generowanie treści i raportów", "import, eksport i harmonogramy", "narzędzia wewnętrzne oraz skrypty Python i Bash"],
  },
  {
    id: "integracje-api",
    title: "Integracje API",
    lead: "Łączę aplikacje i zewnętrzne usługi, dbając o autoryzację, limity, błędy i spójność danych.",
    items: ["REST API i JSON", "YouTube Data API", "Steam i dane serwerów gier", "synchronizacja danych i obsługa limitów"],
  },
  {
    id: "linux-vps",
    title: "Linux, VPS i utrzymanie",
    lead: "Przygotowuję stabilne środowisko dla aplikacji i pomagam bezpiecznie wdrażać oraz utrzymywać usługi.",
    items: ["Ubuntu Server, nginx, systemd i SSH", "DNS, HTTPS/TLS i bazy danych", "GitHub Actions i CI/CD", "backup, restore, monitoring, watchdog i analiza logów"],
  },
  {
    id: "ecommerce",
    title: "Rozwój sklepów internetowych",
    lead: "Wspieram rozwój istniejącego e-commerce: funkcje, dane, integracje, wydajność i problemy techniczne.",
    items: ["rozwój i utrzymanie funkcji", "naprawa błędów i optymalizacja", "integracje, dane i SQL", "narzędzia administracyjne i automatyzacja obsługi"],
  },
  {
    id: "serwery-gier",
    title: "Serwery gier i narzędzia dedykowane",
    lead: "Niszowy przykład systemów szytych na miarę: panel, automatyzacja i infrastruktura współpracują jako jedna całość.",
    items: ["panele zarządzania i monitoring", "RCON, SteamCMD i Workshop", "SourceMod, SourcePawn i statystyki", "backupy, aktualizacje i kontrola usług systemd"],
  },
] as const;

export const projects = [
  {
    id: "lemanczyk-platform",
    title: "Lemanczyk Platform",
    status: "Projekt rozwijany",
    problem: "Bezpieczne zarządzanie kilkoma serwerami gier, użytkownikami i operacjami z jednego miejsca.",
    solution: "Dedykowany panel dla Minecraft i Left 4 Dead 2 z rolami Admin i Player, statystykami, rankingami, kampaniami Workshop, monitoringiem, backupami i kontrolowanym dostępem do RCON.",
    contribution: "Projekt, implementacja aplikacji i paneli, integracje, własne pluginy SourceMod, automatyzacja usług, CI, wdrożenie i dokumentacja.",
    tech: ["Python", "FastAPI", "JavaScript", "HTML", "CSS", "SQLite", "SourcePawn", "SourceMod", "SteamCMD", "RCON", "nginx", "systemd", "Bash", "GitHub Actions"],
    result: "Spójne narzędzie upraszcza zarządzanie usługami, kampaniami i dostępem oraz pozwala wcześniej zauważać problemy dzięki health checkom, logom i watchdogowi.",
    live: "https://gry.lemanczyk-it.pl",
    repo: "https://github.com/Divithy-IT/lemanczyk-platform",
  },
  {
    id: "youtube-automation",
    title: "Automatyzacja tworzenia i publikacji filmów",
    status: "Projekt prywatny",
    problem: "Wielostopniowe przygotowanie wielu materiałów wideo i publikacji wymaga powtarzalnych operacji.",
    solution: "Automatyzacja analizy nagrań, składania materiałów i krótkich form, miniaturek, opisów, kolejki oraz harmonogramu publikacji z integracją YouTube Data API.",
    contribution: "Projekt procesu, przetwarzanie plików, integracja API, obsługa kolejki, błędów i metadanych publikacji.",
    tech: ["Python", "YouTube Data API", "przetwarzanie plików", "JSON", "harmonogramy"],
    result: "Powtarzalny proces łączy przygotowanie materiału i publikację, ograniczając liczbę ręcznych kroków.",
    note: "Kod pozostaje prywatny — szczegóły techniczne są dostępne podczas rozmowy.",
  },
  {
    id: "lekkaforma",
    title: "LekkaForma — strona pracowni architektonicznej",
    status: "W trakcie realizacji",
    problem: "Pracownia potrzebuje nowoczesnej strony, która czytelnie przedstawi ofertę, realizacje i charakter pracy.",
    solution: "Projekt strony wizytówkowej z naciskiem na klarowną prezentację pracowni i jej realizacji.",
    contribution: "Projektowanie struktury, interfejsu i wdrożenia strony.",
    tech: ["Technologie zostaną opisane po zakończeniu prac"],
    result: "Projekt jest w trakcie — bez publikowania niezatwierdzonych materiałów i niepotwierdzonych rezultatów.",
  },
  {
    id: "lemanczyk-it",
    title: "Strona firmowa Lemanczyk-IT",
    status: "Projekt własny",
    problem: "Prosta wizytówka nie przedstawiała pełnego zakresu usług ani doświadczenia.",
    solution: "Wielostronicowy serwis ofertowy z osobnymi adresami SEO, portfolio, ofertą, formularzem kontaktowym i polityką prywatności.",
    contribution: "Strategia treści, projekt, implementacja, zabezpieczenia formularza, optymalizacja i wdrożenie na własnym VPS.",
    tech: ["React", "TypeScript", "Vite", "PHP", "nginx", "Linux", "HTTPS"],
    result: "Oferta, doświadczenie i droga do kontaktu są uporządkowane wokół potrzeb potencjalnego klienta.",
    live: "https://lemanczyk-it.pl",
  },
] as const;
