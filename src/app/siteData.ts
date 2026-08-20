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
    items: ["dashboardy, statystyki i raporty", "użytkownicy, role i uprawnienia (RBAC)", "bezpieczne logowanie i ochrona operacji", "integracje z backendem, monitoring i historia działań"],
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
    lead: "Projektuję API i łączę aplikacje z innymi usługami, dbając o autoryzację, błędy i spójność danych.",
    items: ["REST, HTTP/JSON i dokumentacja OpenAPI", "lekkie agenty usług komunikujące się przez Unix socket", "YouTube, Steam i dane serwerów gier", "synchronizacja danych, limity i diagnostyka integracji"],
  },
  {
    id: "linux-vps",
    title: "Linux, VPS i utrzymanie",
    lead: "Przygotowuję stabilne środowisko dla aplikacji i pomagam bezpiecznie wdrażać oraz utrzymywać usługi.",
    items: ["Ubuntu Server, systemd, nginx i reverse proxy", "domeny, DNS oraz HTTPS/TLS", "Git, GitHub, CI/CD i automatyzacja wdrożeń", "backup, restore, retencja i testy integralności", "monitoring, health-checki, watchdogi i diagnostyka"],
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
    lead: "Własny projekt pokazuje, jak panel, automatyzacja i infrastruktura mogą współpracować jako jeden bezpieczny system.",
    items: ["CS 1.6 / ReHLDS, L4D2 / SourceMod i Minecraft / Paper", "publiczne statusy i panele administracyjne", "izolowane agenty dla każdej gry i kontrola usług systemd", "monitoring, aktualizacje, backup i sprawdzony restore"],
  },
] as const;

export const projects = [
  {
    id: "lemanczyk-platform",
    title: "Lemanczyk Platform",
    status: "Projekt własny · rozwijany",
    problem: "Bezpieczne zarządzanie kilkoma serwerami gier, użytkownikami i operacjami z jednego miejsca.",
    solution: "Panel łączy publiczne statusy i widoki administracyjne dla CS 1.6, Left 4 Dead 2 oraz Minecrafta. Oddzielne agenty każdej gry udostępniają kontrolowane API do sterowania, statystyk, map, kampanii, backupów i monitoringu.",
    contribution: "Architektura i podział odpowiedzialności między repozytoriami i usługami, frontend, API oraz kontrakty OpenAPI. Także auth, RBAC, CSRF, least privilege, allowlisty sudoers, CI/CD, wdrożenia i testy odtwarzania backupów.",
    tech: ["Python", "FastAPI", "JavaScript", "SQLite", "OpenAPI", "Unix sockets", "nginx", "systemd", "GitHub Actions", "Bash", "ReHLDS", "SourceMod", "Paper"],
    result: "Jeden panel zapewnia czytelny podgląd i kontrolę, a separacja usług, health-checki, watchdogi oraz testowany restore ograniczają wpływ awarii i ułatwiają bezpieczne utrzymanie.",
    note: "Własna realizacja techniczna rozwijana na prywatnej infrastrukturze — nie jest wdrożeniem klienta.",
    live: "https://gry.lemanczyk-it.pl",
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
    channel: "https://www.youtube.com/@Divithy",
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
    repo: "https://github.com/Divithy-IT/lemanczyk-it-website",
  },
] as const;
