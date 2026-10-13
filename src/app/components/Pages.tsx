import { ArrowRight, Check, ExternalLink, Github, Mail, Phone, Youtube } from "lucide-react";
import { Link } from "react-router";
import { company, projects, services } from "../siteData";
import { ContactForm } from "./ContactForm";
import { Seo } from "./Seo";

const pageMeta = {
  home: ["Programista Full Stack Bydgoszcz | Michał Lemanczyk", "Programista Full Stack z Bydgoszczy. Jednorazowe wsparcie i długoterminowa współpraca B2B: aplikacje, e-commerce, API i automatyzacje. Doświadczenie od 2019 r."],
  about: ["Michał Lemanczyk – programista Full Stack z Bydgoszczy", "Od 2019 roku rozwijam mdd.pl i rozwiązania e-commerce. Tworzę aplikacje, CMS, integracje API i automatyzacje. Przyjmuję dodatkowe projekty B2B."],
  services: ["Usługi i współpraca B2B – programista Full Stack | Lemanczyk-IT", "Jednorazowe wsparcie lub długoterminowy rozwój projektu po kilka godzin dziennie. Aplikacje, CMS, e-commerce, integracje API, automatyzacje i Linux."],
  portfolio: ["Portfolio – Laravel, aplikacje i automatyzacje | Lemanczyk-IT", "LekkaForma w Laravelu i Filamencie, publiczne narzędzia Python do wideo i YouTube oraz platforma FastAPI. Zobacz wykonany zakres prac i kod."],
  technologies: ["Technologie – React, Laravel, Python i API | Lemanczyk-IT", "Warsztat z moich projektów: React, TypeScript, PHP, Laravel, Filament, Python, FastAPI, FFmpeg, SQL, Linux i CI/CD. Przykłady w portfolio i na GitHubie."],
  contact: ["Kontakt – współpraca B2B z programistą | Lemanczyk-IT", "Porozmawiajmy o jednorazowym zadaniu lub stałym wsparciu projektu. Programista Full Stack z Bydgoszczy, dostępny po kilka godzin dziennie poza pracą zawodową."],
  privacy: ["Polityka prywatności | Lemanczyk-IT", "Informacje o danych z formularza kontaktowego, serwerów gier, statystyk graczy, logów technicznych i narzędzi wspierających rozwój Lemanczyk-IT."],
} as const;

const baseSchema = [
  { "@context": "https://schema.org", "@type": "WebSite", name: "Lemanczyk-IT", url: "https://lemanczyk-it.pl/" },
  { "@context": "https://schema.org", "@type": "Person", name: "Michał Lemanczyk", url: "https://lemanczyk-it.pl/o-mnie", sameAs: [company.github], jobTitle: "Programista Full Stack" },
  { "@context": "https://schema.org", "@type": "ProfessionalService", name: company.name, url: "https://lemanczyk-it.pl/", email: company.email, telephone: company.phoneHref, address: { "@type": "PostalAddress", streetAddress: "Ogrody 17/90", postalCode: "85-870", addressLocality: "Bydgoszcz", addressCountry: "PL" } },
];

function Eyebrow({ children }: { children: React.ReactNode }) { return <p className="eyebrow">{children}</p>; }
function PageHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return <section className="page-hero"><div className="site-container max-w-5xl"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p className="lead">{lead}</p></div></section>;
}
function FinalCta() {
  return <section className="section"><div className="site-container"><div className="cta-panel"><div><Eyebrow>Porozmawiajmy</Eyebrow><h2>Potrzebujesz wsparcia przy jednym zadaniu lub na dłużej?</h2><p>Opisz projekt i zakres pomocy. Ustalimy zadania, dostępność i sposób współpracy B2B.</p></div><div className="flex flex-wrap gap-3"><Link to="/kontakt" className="btn-light">Porozmawiajmy o projekcie</Link><Link to="/portfolio" className="btn-outline-light">Zobacz realizacje</Link></div></div></div></section>;
}
function Breadcrumb({ current }: { current: string }) { return <nav className="site-container breadcrumb" aria-label="Okruszki"><Link to="/">Start</Link><span aria-hidden="true">/</span><span aria-current="page">{current}</span></nav>; }

export function HomePage() {
  return <main id="main-content">
    <Seo title={pageMeta.home[0]} description={pageMeta.home[1]} path="/" schema={baseSchema} />
    <section className="hero">
      <div className="site-container grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
        <div><Eyebrow>Michał Lemanczyk · współpraca B2B</Eyebrow><h1>Programista Full Stack z Bydgoszczy</h1>
          <p className="lead">Pomagam firmom rozwijać aplikacje webowe i sklepy internetowe, integrować API oraz automatyzować procesy. Od 2019 roku pracuję nad rozwojem mdd.pl i rozwiązań e-commerce.</p>
          <p className="lead-small">Przyjmuję jednorazowe zadania i długoterminową współpracę przy projektach. Mogę przeznaczyć na dodatkowe wsparcie po kilka godzin dziennie poza pracą zawodową.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/portfolio" className="btn-primary">Zobacz portfolio <ArrowRight size={18} /></Link><Link to="/uslugi#wspolpraca-b2b" className="btn-secondary">Poznaj zasady współpracy</Link></div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-700">{["Od 2019 roku", "Aplikacje webowe", "Automatyzacje", "API", "Linux i VPS", "E-commerce"].map(x => <li key={x} className="flex items-center gap-2"><Check className="text-blue-600" size={17} />{x}</li>)}</ul>
        </div>
        <picture className="hero-illustration">
          <source media="(max-width: 767px)" srcSet="/hero-system-mobile.svg" width="720" height="390" />
          <img src="/hero-system-desktop.svg" width="760" height="680" alt="Aplikacja webowa połączona z API, automatyzacją i serwerem Linux" decoding="async" />
        </picture>
      </div>
    </section>
    <section className="section bg-slate-50"><div className="site-container"><Eyebrow>Jak mogę pomóc</Eyebrow><h2 className="section-title">Rozwój aplikacji, integracje i codzienne wsparcie projektu</h2>
      <div className="cards-grid mt-10">{services.slice(0, 6).map((s, i) => <article className="card card-link" key={s.id}><span className="card-index">0{i + 1}</span><h3>{s.title}</h3><p>{s.lead}</p><Link to={`/uslugi#${s.id}`}>Dowiedz się więcej <ArrowRight size={17} /></Link></article>)}</div>
    </div></section>
    <section className="section"><div className="site-container"><div className="section-heading-row"><div><Eyebrow>Wybrane projekty</Eyebrow><h2 className="section-title">Od pomysłu po działające wdrożenie</h2></div><Link to="/portfolio" className="text-link">Całe portfolio <ArrowRight size={18} /></Link></div>
      <div className="portfolio-grid mt-10">{projects.map(p => <article className="project-card" key={p.id}><p className="status">{p.status}</p><h3>{p.title}</h3><p>{p.problem}</p><Link to={`/portfolio#${p.id}`}>Zobacz opis <ArrowRight size={17} /></Link></article>)}</div>
    </div></section>
    <section className="section bg-slate-950 text-white"><div className="site-container"><Eyebrow>Jak wygląda współpraca?</Eyebrow><h2 className="section-title text-white">Od pojedynczego zadania po regularny rozwój projektu</h2><p className="mt-4 text-slate-300">Ustalamy zakres, priorytety i czas, który mogę przeznaczyć na Twój projekt. Wstępna rozmowa i orientacyjna wycena są bezpłatne.</p>
      <ol className="process-grid mt-10">{["Kontakt i poznanie potrzeb", "Ustalenie zakresu", "Wycena i harmonogram", "Realizacja", "Testy i wdrożenie", "Dalsze wsparcie"].map((x, i) => <li key={x}><span>{i + 1}</span><strong>{x}</strong></li>)}</ol>
    </div></section><FinalCta />
  </main>;
}

export function AboutPage() {
  const schema = [...baseSchema, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Start", item: "https://lemanczyk-it.pl/" }, { "@type": "ListItem", position: 2, name: "O mnie", item: "https://lemanczyk-it.pl/o-mnie" }] }];
  return <main id="main-content"><Seo title={pageMeta.about[0]} description={pageMeta.about[1]} path="/o-mnie" schema={schema} /><Breadcrumb current="O mnie" />
    <section className="about-hero" data-testid="about-intro"><div className="site-container about-hero-grid">
      <figure className="about-profile"><picture className="about-portrait"><source srcSet="/assets/about/michal-lemanczyk-344.webp 344w, /assets/about/michal-lemanczyk-516.webp 516w, /assets/about/michal-lemanczyk-689.webp 689w" type="image/webp" sizes="(max-width: 640px) min(78vw, 344px), (max-width: 1023px) 390px, 430px" /><img src="/assets/about/michal-lemanczyk-516.webp" width="516" height="688" alt="Michał Lemanczyk — programista Full Stack i właściciel Lemanczyk-IT" loading="eager" decoding="async" /></picture><figcaption><strong>Michał Lemanczyk</strong><span>Programista Full Stack</span></figcaption></figure>
      <div className="about-intro-copy"><Eyebrow>O mnie · Bydgoszcz</Eyebrow><h1>Tworzę aplikacje i dbam o ich techniczne zaplecze</h1><p className="lead">Nazywam się Michał Lemanczyk i jestem programistą Full Stack z Bydgoszczy. Od 2019 roku pracuję nad rozwojem i utrzymaniem mdd.pl oraz rozwiązań e-commerce. W ramach Lemanczyk-IT podejmuję dodatkową współpracę B2B.</p><p>Łączę pracę nad interfejsem, backendem i danymi z wdrożeniem aplikacji. Rozwijam stronę i CMS LekkaForma w Laravelu, własną platformę FastAPI oraz narzędzia Python do przetwarzania wideo i publikacji przez API.</p><ul className="about-highlights"><li><Check size={18} />Doświadczenie od 2019 roku</li><li><Check size={18} />Full Stack, API i automatyzacje</li><li><Check size={18} />Linux, VPS i wdrożenia</li></ul><div className="about-actions"><Link to="/kontakt" className="btn-primary">Porozmawiajmy</Link><Link to="/portfolio" className="btn-secondary">Zobacz portfolio</Link><a href={company.github} className="text-link" target="_blank" rel="noreferrer"><Github size={18} />GitHub</a></div></div>
    </div></section>
    <section className="section bg-slate-50" data-testid="about-experience"><div className="site-container prose-grid"><div><Eyebrow>Doświadczenie zawodowe</Eyebrow><h2>Rozwój e-commerce od 2019 roku</h2><p>Uczestniczę w rozwoju i utrzymaniu sklepów internetowych <a className="text-link inline" href="https://mdd.pl" target="_blank" rel="noreferrer">mdd.pl</a> oraz <a className="text-link inline" href="https://mdd.eu" target="_blank" rel="noreferrer">mdd.eu</a>. Zajmuję się funkcjonalnościami, poprawkami, optymalizacją, integracjami, SQL i rozwiązywaniem problemów technicznych.</p></div><aside className="highlight-box"><h2>Jednorazowe wsparcie lub stała współpraca</h2><p>Mogę pomóc przy konkretnej poprawce, wdrożeniu funkcji albo dołączyć do regularnego rozwoju projektu. Na dodatkową współpracę przeznaczam po kilka godzin dziennie poza pracą zawodową. Zakres, priorytety i terminy ustalamy wspólnie.</p><p><Link to="/uslugi#wspolpraca-b2b">Zobacz możliwości współpracy B2B</Link></p></aside></div></section>
    <section className="section"><div className="site-container"><Eyebrow>Jak pracuję</Eyebrow><h2 className="section-title">Technicznie rzetelnie, komunikacyjnie jasno</h2><div className="cards-grid mt-10">{["Najpierw realny problem", "Jasny zakres i komunikacja", "Czytelny, testowalny kod", "Bezpieczeństwo i backup", "Dokumentacja", "Wdrożenie i weryfikacja"].map(x => <div className="mini-card" key={x}><Check size={18} />{x}</div>)}</div></div></section><FinalCta /></main>;
}

export function ServicesPage() {
  const schemas = services.map(s => ({ "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.lead, provider: { "@type": "ProfessionalService", name: company.name, url: "https://lemanczyk-it.pl/" } }));
  return <main id="main-content"><Seo title={pageMeta.services[0]} description={pageMeta.services[1]} path="/uslugi" schema={schemas} /><Breadcrumb current="Usługi" /><PageHero eyebrow="Programista Full Stack · Bydgoszcz" title="Usługi i współpraca B2B" lead="Wspieram firmy i zespoły w rozwoju aplikacji, sklepów internetowych, API i automatyzacji. Możemy zacząć od jednego zadania albo ustalić regularną współpracę przy Twoim projekcie." />
    <section id="wspolpraca-b2b" className="section pt-0"><div className="site-container"><Eyebrow>Jak możemy współpracować</Eyebrow><h2 className="section-title">Jednorazowo lub na dłużej</h2><div className="cards-grid mt-8">
      <article className="card p-6 sm:p-8"><h3>Jednorazowe wsparcie</h3><p>Poprawka błędu, nowa funkcja, integracja API, skrypt albo pomoc przy wdrożeniu. Ustalamy zadanie, sposób sprawdzenia efektu i termin realizacji.</p></article>
      <article className="card p-6 sm:p-8"><h3>Długoterminowa współpraca</h3><p>Regularny rozwój aplikacji lub sklepu, praca nad kolejnymi funkcjami i wsparcie istniejącego zespołu. Ustalamy priorytety i dzielimy pracę na konkretne zadania.</p></article>
      <article className="card p-6 sm:p-8"><h3>Po kilka godzin dziennie</h3><p>Dodatkowe projekty realizuję poza pracą zawodową. Mogę przeznaczyć na współpracę po kilka godzin dziennie; dostępność i terminy uzgadniamy przed rozpoczęciem.</p></article>
    </div><p className="lead-small mt-6">Współpracujemy w formule B2B. Zakres, rozliczenie i harmonogram ustalamy na podstawie potrzeb projektu. Wstępna rozmowa i orientacyjna wycena są bezpłatne.</p><Link to="/kontakt" className="text-link mt-6">Omówmy zakres współpracy <ArrowRight size={17} /></Link></div></section>
    <section className="section pt-0"><div className="site-container"><Eyebrow>Zakres wsparcia</Eyebrow><h2 className="section-title">W czym mogę pomóc przy Twoim projekcie</h2><div className="grid gap-6 mt-8">{services.map((s, i) => <article id={s.id} className="service-detail" key={s.id}><div className="service-number">0{i + 1}</div><div><h2>{s.title}</h2><p className="lead-small">{s.lead}</p><h3>Przykładowe zadania</h3><ul>{s.items.map(x => <li key={x}><Check size={17} />{x}</li>)}</ul><p className="benefit">{s.benefit}</p><Link to="/kontakt" className="text-link">Porozmawiajmy o tym zakresie <ArrowRight size={17} /></Link></div></article>)}</div></div></section><FinalCta /></main>;
}

export function PortfolioPage() {
  const schemas = projects.map(p => ({ "@context": "https://schema.org", "@type": "CreativeWork", name: p.title, description: p.solution, url: `https://lemanczyk-it.pl/portfolio#${p.id}` }));
  return <main id="main-content"><Seo title={pageMeta.portfolio[0]} description={pageMeta.portfolio[1]} path="/portfolio" schema={schemas} /><Breadcrumb current="Portfolio" /><PageHero eyebrow="Portfolio" title="Aplikacje, CMS i automatyzacje w praktyce" lead="Rozwijana strona pracowni wnętrz, publiczne narzędzia Python i własna platforma FastAPI pokazują mój zakres pracy: interfejs, backend, dane, integracje i wdrożenia." />
    <section className="section pt-0"><div className="site-container grid gap-8">{projects.map(p => <article id={p.id} className="portfolio-detail" key={p.id}><div><p className="status">{p.status}</p><h2>{p.title}</h2><div className="project-copy"><h3>Problem</h3><p>{p.problem}</p><h3>Zakres rozwiązania</h3><p>{p.solution}</p><h3>Mój wkład</h3><p>{p.contribution}</p><h3>Rezultat</h3><p>{p.result}</p>{"note" in p && p.note && <p className="note">{p.note}</p>}</div></div><aside><h3>Technologie</h3><div className="tags">{p.tech.map(t => <span key={t}>{t}</span>)}</div><div className="mt-6 grid gap-3">{"live" in p && p.live && <a className="btn-primary justify-center" href={p.live} target="_blank" rel="noopener noreferrer">Zobacz publiczny serwis <ExternalLink size={17} /></a>}{"channel" in p && p.channel && <a className="btn-secondary justify-center" href={p.channel} target="_blank" rel="noopener noreferrer"><Youtube size={17} />Zobacz kanał YouTube</a>}{"repo" in p && p.repo && <a className="btn-secondary justify-center" href={p.repo} target="_blank" rel="noopener noreferrer"><Github size={17} />{"repoLabel" in p ? p.repoLabel : "Zobacz repozytorium"}</a>}{"repos" in p && p.repos.map(repo => <a key={repo.url} className="btn-secondary justify-center" href={repo.url} target="_blank" rel="noopener noreferrer"><Github size={17} />{repo.label}</a>)}</div></aside></article>)}</div></section>
    <section className="section bg-slate-50"><div className="site-container max-w-4xl"><Eyebrow>Doświadczenie zawodowe</Eyebrow><h2 className="section-title">Doświadczenie w rozwoju sklepów internetowych</h2><p className="lead mt-5">Od 2019 roku uczestniczę w rozwoju i utrzymaniu sklepów internetowych mdd.pl oraz mdd.eu. Zakres pracy obejmuje rozwój funkcjonalności, poprawki, optymalizację, integracje, pracę z danymi i rozwiązywanie problemów technicznych.</p></div></section><FinalCta /></main>;
}

export function TechnologiesPage() {
  const groups = [
    ["Języki", ["JavaScript ES6+", "TypeScript", "PHP", "Python", "HTML5", "CSS3", "SQL", "Bash", "SourcePawn"]],
    ["Frontend", ["React", "TypeScript", "Blade", "Tailwind CSS", "Vite", "responsywne interfejsy", "Fetch API / AJAX", "semantyczny HTML"]],
    ["Backend i API", ["PHP", "Laravel", "Python", "FastAPI", "REST i HTTP/JSON", "OpenAPI", "OAuth 2.0", "kolejki zadań"]],
    ["CMS i media", ["Filament", "portfolio i galerie PL/EN", "edycja i kolejność realizacji", "WebP i optymalizacja zdjęć", "FFmpeg", "OpenCV", "faster-whisper"]],
    ["Bazy danych", ["MariaDB", "MySQL", "SQLite", "SQL"]],
    ["Linux i wdrożenia", ["Ubuntu Server", "nginx i reverse proxy", "systemd", "SSH", "domeny i DNS", "HTTPS/TLS", "Git i GitHub", "GitHub Actions", "CI/CD", "automatyczne wdrożenia"]],
    ["Bezpieczeństwo i utrzymanie", ["auth i RBAC", "CSRF", "least privilege", "sudoers i allowlisty", "backup, restore i retencja", "testy integralności", "monitoring i health-checki", "watchdogi i diagnostyka"]],
    ["Integracje i architektura", ["YouTube Data API", "Steam", "RCON", "JSON", "przetwarzanie plików", "harmonogramy", "separacja usług i repozytoriów"]],
    ["Serwery gier", ["CS 1.6 i ReHLDS", "L4D2 i SourceMod", "SourcePawn", "Minecraft i Paper", "SteamCMD", "Workshop", "RCON"]],
  ];
  return <main id="main-content"><Seo title={pageMeta.technologies[0]} description={pageMeta.technologies[1]} path="/technologie" /><Breadcrumb current="Technologie" /><PageHero eyebrow="Warsztat" title="Technologie, z których korzystam w pracy i projektach" lead="Warsztat rozwijany w pracy nad e-commerce, stroną LekkaForma, platformą FastAPI i narzędziami Python. Dobieram rozwiązania do zadania i istniejącego środowiska projektu." />
    <section className="section pt-0"><div className="site-container tech-grid">{groups.map(([name, items]) => <section className="card p-6 sm:p-8" key={name as string}><h2>{name}</h2><div className="tags mt-5">{(items as string[]).map(x => <span key={x}>{x}</span>)}</div></section>)}</div></section><FinalCta /></main>;
}

export function ContactPage() {
  return <main id="main-content"><Seo title={pageMeta.contact[0]} description={pageMeta.contact[1]} path="/kontakt" /><Breadcrumb current="Kontakt" /><PageHero eyebrow="Kontakt i współpraca" title="Porozmawiajmy o Twoim projekcie" lead="Potrzebujesz jednej poprawki, nowej funkcji lub regularnego wsparcia programisty? Opisz projekt, zakres pomocy i planowany termin — ustalimy możliwości współpracy." />
    <section className="section pt-0"><div className="site-container grid gap-10 lg:grid-cols-[.72fr_1.28fr]"><div><h2>Jednorazowe zadanie lub stałe wsparcie</h2><p className="mt-4 leading-relaxed text-slate-600">Jestem programistą Full Stack z Bydgoszczy. Mogę przeznaczyć na dodatkową współpracę B2B po kilka godzin dziennie poza pracą zawodową. Dostępność, zakres i terminy ustalamy wspólnie.</p><p className="mt-4 leading-relaxed text-slate-600">Wstępna rozmowa i orientacyjna wycena są bezpłatne. Możemy zacząć od konkretnego zadania i ustalić dalsze wsparcie, jeśli projekt go potrzebuje.</p><div className="mt-7 grid gap-3"><a className="contact-row" href={`mailto:${company.email}`}><Mail /> <span><small>E-mail</small>{company.email}</span></a><a className="contact-row" href={`tel:${company.phoneHref}`}><Phone /> <span><small>Telefon</small>{company.phone}</span></a><a className="contact-row" href={company.github} target="_blank" rel="noreferrer"><Github /> <span><small>GitHub</small>Divithy-IT</span></a></div></div><ContactForm /></div></section></main>;
}

export function PrivacyPage() {
  return <main id="main-content"><Seo title={pageMeta.privacy[0]} description={pageMeta.privacy[1]} path="/polityka-prywatnosci" /><Breadcrumb current="Polityka prywatności" /><PageHero eyebrow="Dokument informacyjny" title="Polityka prywatności" lead="Poniższa treść wyjaśnia, jakie dane są przetwarzane przez serwis Lemanczyk-IT, panele i serwery gier." />
    <article className="section pt-0"><div className="site-container legal">
      <h2>1. Administrator danych</h2><p>Administratorem danych jest {company.name}, {company.address}, NIP {company.nip}. Kontakt: <a href={`mailto:${company.email}`}>{company.email}</a>.</p>
      <h2>2. Formularz kontaktowy</h2><p>Formularz może zbierać imię lub nazwę firmy, adres e-mail, opcjonalny telefon, temat, opis projektu, przedział budżetu i oczekiwany termin. Dane są używane wyłącznie do odpowiedzi, ustalenia możliwości współpracy i przygotowania oferty.</p>
      <section id="serwery-gier">
        <h2>3. Serwery gier i statystyki graczy</h2>
        <p>Podczas korzystania z serwerów CS 1.6, Left 4 Dead 2 i Minecraft przetwarzane mogą być: nick gracza, SteamID, SteamID64 lub UUID, adres IP i dane techniczne połączenia, czas wejścia i wyjścia, mapa, tryb gry oraz zdarzenia i statystyki rozgrywki. Dane nie służą do ustalania cywilnej tożsamości gracza.</p>
        <p>CS 1.6 zapisuje między innymi czas gry, zabójstwa, zgony i infekcje. L4D2 zapisuje między innymi sesje, kampanie, mapy, głosowania oraz statystyki walki i współpracy. Minecraft korzysta z UUID, pamięci nazw, logów wejść oraz statystyk świata, takich jak czas gry, zgony, zabite moby i wykopane bloki.</p>
      </section>
      <h2>4. Cele i podstawy prawne</h2><p>Dane formularza są przetwarzane w celu podjęcia działań na żądanie osoby przed zawarciem umowy oraz prowadzenia korespondencji. Dane techniczne i dane graczy są przetwarzane na podstawie prawnie uzasadnionego interesu administratora: uruchamiania serwerów i paneli, zapewnienia ciągłości rozgrywki, prowadzenia statystyk i rankingów, diagnostyki, bezpieczeństwa, egzekwowania zasad oraz przeciwdziałania nadużyciom. Podanie identyfikatora gry i danych połączenia jest technicznie konieczne do dołączenia do danego serwera. Nie są podejmowane decyzje wywołujące skutki prawne wyłącznie w sposób zautomatyzowany.</p>
      <h2>5. Dane widoczne publicznie</h2><p>Publiczne panele mogą pokazywać status serwera, bieżący nick gracza, wynik i czas bieżącej sesji oraz zagregowane albo przypisane do nicku statystyki rozgrywki. Pełne identyfikatory SteamID, SteamID64 i UUID nie są przeznaczone do publicznej prezentacji; pozostają dostępne tylko w zakresie administracyjnym niezbędnym do obsługi serwera. Gracz może zmienić swój nick niezależnie od administratora.</p>
      <h2>6. Okres przechowywania</h2><p>Standardowe, rotowane logi techniczne serwerów gier są utrzymywane przez maksymalnie 30 dni, chyba że konkretny fragment jest potrzebny dłużej do wyjaśnienia incydentu, obrony roszczeń albo egzekwowania bana. Profil i indywidualne statystyki gracza przestają być prezentowane w panelach po 30 dniach bez aktywności. Historyczne wyniki całego serwera mogą pozostać w postaci zagregowanej, bez wskazywania nieaktywnego gracza.</p><p>Dane wymagane przez samą grę do zachowania postępu — na przykład dane świata, ekwipunku i osiągnięć Minecraft — mogą być przechowywane dłużej, dopóki działa świat lub są potrzebne do jego ciągłości. Pozostałe identyfikatory i dane szczegółowe są usuwane albo anonimizowane po ustaniu celu i podczas okresowych przeglądów. Dane bana są przechowywane do jego cofnięcia. Kopie bezpieczeństwa podlegają ograniczonej rotacji i nie są używane do odtwarzania danych usuniętych na skutecznie zrealizowane żądanie, chyba że wymaga tego bezpieczeństwo lub obowiązek prawny.</p>
      <h2>7. Hosting i logi strony</h2><p>Serwis i panele działają na administrowanym VPS. Serwer WWW może zapisywać adres IP, czas żądania, adres zasobu, kod odpowiedzi i informacje o przeglądarce. Logi służą bezpieczeństwu, diagnostyce i utrzymaniu.</p>
      <h2>8. Cookies i zasoby zewnętrzne</h2><p>Serwis nie korzysta z analityki marketingowej ani reklamowych plików cookies. Formularz nie wymaga konta. Strona używa lokalnych zasobów. GitHub, mdd.pl, mdd.eu i publiczne serwisy projektów są linkami zewnętrznymi, które stosują własne zasady prywatności.</p>
      <h2>9. Odbiorcy, bezpieczeństwo i narzędzia AI</h2><p>Dane mogą być przetwarzane przez dostawców infrastruktury, poczty i zabezpieczeń wyłącznie w zakresie koniecznym do działania usług. Formularz korzysta z <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare Turnstile</a>. W celu egzekwowania limitu wysyłki serwer przechowuje krótkotrwale nieodwracalne skróty adresu IP i znormalizowanego e-maila.</p><p>Narzędzia AI mogą wspierać programowanie, redakcję i diagnostykę techniczną. Nie podejmują decyzji dotyczących użytkowników ani graczy. Materiał przekazywany do takich narzędzi powinien być wcześniej ograniczony do niezbędnego zakresu i pozbawiony sekretów oraz zbędnych identyfikatorów. Danych z formularza, pełnych adresów IP ani całych baz graczy nie należy przekazywać do narzędzi AI.</p>
      <h2>10. Prawa użytkownika i gracza</h2><p>Możesz żądać dostępu do danych, sprostowania, usunięcia lub ograniczenia przetwarzania oraz wnieść sprzeciw z przyczyn związanych z Twoją szczególną sytuacją. Możesz również złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych. Realizacja niektórych żądań może wymagać potwierdzenia identyfikatora konta gry, aby dane nie zostały ujawnione niewłaściwej osobie.</p>
      <h2>11. Kontakt i zmiany</h2><p>Pytania i żądania dotyczące prywatności wyślij na <a href={`mailto:${company.email}`}>{company.email}</a>. Zaktualizowana polityka obowiązuje od 20 sierpnia 2026 r. i może być zmieniana wraz ze sposobem działania usług.</p>
    </div></article></main>;
}

export function NotFoundPage() {
  return <main id="main-content" className="page-hero"><Seo title="Nie znaleziono strony | Lemanczyk-IT" description="Podany adres nie istnieje. Wróć na stronę główną Lemanczyk-IT." path="/404" robots="noindex,follow" /><div className="site-container text-center"><Eyebrow>Błąd 404</Eyebrow><h1>Ta strona nie istnieje</h1><p className="lead mx-auto">Adres mógł się zmienić albo zawiera błąd.</p><Link className="btn-primary mt-8" to="/">Wróć na stronę główną</Link></div></main>;
}
