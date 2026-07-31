import { ArrowRight, Check, ExternalLink, Github, Mail, Phone, Youtube } from "lucide-react";
import { Link } from "react-router";
import { company, projects, services } from "../siteData";
import { ContactForm } from "./ContactForm";
import { Seo } from "./Seo";

const pageMeta = {
  home: ["Programista Full Stack – aplikacje, automatyzacje i VPS | Lemanczyk-IT", "Dedykowane aplikacje webowe, automatyzacje, integracje API oraz rozwiązania Linux i VPS. Doświadczenie programistyczne od 2019 roku."],
  about: ["Programista Full Stack z doświadczeniem od 2019 roku | Lemanczyk-IT", "Poznaj Michała Lemanczyka — programistę rozwijającego aplikacje, sklepy internetowe, automatyzacje, API oraz rozwiązania Linux i VPS."],
  services: ["Usługi programistyczne – aplikacje, API, automatyzacje i Linux | Lemanczyk-IT", "Aplikacje webowe, panele administracyjne, automatyzacje, integracje API, rozwój e-commerce oraz wdrożenia na Linux i VPS."],
  portfolio: ["Portfolio programisty – aplikacje webowe i automatyzacje | Lemanczyk-IT", "Zobacz projekty: panel zarządzania serwerami gier, automatyzację materiałów wideo, LekkaForma i stronę Lemanczyk-IT."],
  technologies: ["Technologie – Python, JavaScript, SQL, Linux i API | Lemanczyk-IT", "Technologie wykorzystywane w pracy i projektach: Python, JavaScript, FastAPI, SQL, Linux, nginx, API, GitHub Actions i narzędzia serwerowe."],
  contact: ["Kontakt i wycena usług programistycznych | Lemanczyk-IT", "Opisz aplikację, automatyzację, integrację API lub problem z serwerem. Wstępna rozmowa i orientacyjna wycena są bezpłatne."],
  privacy: ["Polityka prywatności | Lemanczyk-IT", "Informacje o przetwarzaniu danych z formularza kontaktowego, logach technicznych i prywatności w serwisie Lemanczyk-IT."],
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
  return <section className="section"><div className="site-container"><div className="cta-panel"><div><Eyebrow>Porozmawiajmy</Eyebrow><h2>Masz pomysł, problem techniczny albo proces, który warto zautomatyzować?</h2><p>Napisz, czego potrzebujesz. Sprawdzę możliwości i zaproponuję rozwiązanie.</p></div><div className="flex flex-wrap gap-3"><Link to="/kontakt" className="btn-light">Napisz wiadomość</Link><Link to="/portfolio" className="btn-outline-light">Zobacz realizacje</Link></div></div></div></section>;
}
function Breadcrumb({ current }: { current: string }) { return <nav className="site-container breadcrumb" aria-label="Okruszki"><Link to="/">Start</Link><span aria-hidden="true">/</span><span aria-current="page">{current}</span></nav>; }

export function HomePage() {
  return <main id="main-content">
    <Seo title={pageMeta.home[0]} description={pageMeta.home[1]} path="/" schema={baseSchema} />
    <section className="hero">
      <div className="site-container grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
        <div><Eyebrow>Programista Full Stack · B2B</Eyebrow><h1>Dedykowane aplikacje webowe, automatyzacje i rozwiązania serwerowe</h1>
          <p className="lead">Jestem programistą Full Stack z doświadczeniem rozwijanym od 2019 roku. Tworzę strony internetowe, aplikacje webowe, panele administracyjne, automatyzacje, integracje API oraz rozwiązania działające na serwerach Linux.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/portfolio" className="btn-primary">Zobacz portfolio <ArrowRight size={18} /></Link><Link to="/kontakt" className="btn-secondary">Opisz swój projekt</Link></div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-700">{["Od 2019 roku", "Aplikacje webowe", "Automatyzacje", "API", "Linux i VPS", "E-commerce"].map(x => <li key={x} className="flex items-center gap-2"><Check className="text-blue-600" size={17} />{x}</li>)}</ul>
        </div>
        <picture className="hero-illustration">
          <source media="(max-width: 767px)" srcSet="/hero-system-mobile.svg" width="720" height="390" />
          <img src="/hero-system-desktop.svg" width="760" height="680" alt="Aplikacja webowa połączona z API, automatyzacją i serwerem Linux" fetchPriority="high" decoding="async" />
        </picture>
      </div>
    </section>
    <section className="section bg-slate-50"><div className="site-container"><Eyebrow>Jak mogę pomóc</Eyebrow><h2 className="section-title">Rozwiązania skupione na problemie, nie na liście technologii</h2>
      <div className="cards-grid mt-10">{services.slice(0, 6).map((s, i) => <article className="card card-link" key={s.id}><span className="card-index">0{i + 1}</span><h3>{s.title}</h3><p>{s.lead}</p><Link to={`/uslugi#${s.id}`}>Dowiedz się więcej <ArrowRight size={17} /></Link></article>)}</div>
    </div></section>
    <section className="section"><div className="site-container"><div className="section-heading-row"><div><Eyebrow>Wybrane projekty</Eyebrow><h2 className="section-title">Od pomysłu po działające wdrożenie</h2></div><Link to="/portfolio" className="text-link">Całe portfolio <ArrowRight size={18} /></Link></div>
      <div className="portfolio-grid mt-10">{projects.map(p => <article className="project-card" key={p.id}><p className="status">{p.status}</p><h3>{p.title}</h3><p>{p.problem}</p><Link to={`/portfolio#${p.id}`}>Zobacz opis <ArrowRight size={17} /></Link></article>)}</div>
    </div></section>
    <section className="section bg-slate-950 text-white"><div className="site-container"><Eyebrow>Jak wygląda współpraca?</Eyebrow><h2 className="section-title text-white">Przejrzysty proces od pierwszej rozmowy do wsparcia</h2><p className="mt-4 text-slate-300">Wstępna rozmowa i orientacyjna wycena są bezpłatne.</p>
      <ol className="process-grid mt-10">{["Kontakt i poznanie potrzeb", "Ustalenie zakresu", "Wycena i harmonogram", "Realizacja", "Testy i wdrożenie", "Dalsze wsparcie"].map((x, i) => <li key={x}><span>{i + 1}</span><strong>{x}</strong></li>)}</ol>
    </div></section><FinalCta />
  </main>;
}

export function AboutPage() {
  const schema = [...baseSchema, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Start", item: "https://lemanczyk-it.pl/" }, { "@type": "ListItem", position: 2, name: "O mnie", item: "https://lemanczyk-it.pl/o-mnie" }] }];
  return <main id="main-content"><Seo title={pageMeta.about[0]} description={pageMeta.about[1]} path="/o-mnie" schema={schema} /><Breadcrumb current="O mnie" /><PageHero eyebrow="O mnie" title="Programista, który łączy aplikację z jej technicznym zapleczem" lead="Od 2019 roku pracuję jako programista, uczestnicząc w rozwoju i utrzymaniu sklepów internetowych mdd.pl oraz mdd.eu." />
    <section className="section pt-0"><div className="site-container prose-grid"><div><h2>Doświadczenie zawodowe i własne projekty</h2><p>Zajmuję się rozwojem funkcjonalności, utrzymaniem, poprawkami, optymalizacją, integracjami, SQL i rozwiązywaniem problemów technicznych.</p><p>Poza pracą zawodową tworzę własne projekty i przyjmuję dodatkowe zlecenia programistyczne w ramach działalności gospodarczej. Szukam współpracy B2B realizowanej po godzinach.</p><p>Rozwijam kompetencje w obszarze aplikacji webowych, automatyzacji, integracji API oraz administracji Linux. Dzięki temu mogę spojrzeć na rozwiązanie szerzej: od interfejsu, przez backend i dane, po wdrożenie na VPS.</p><div className="mt-7 flex flex-wrap gap-3"><a href={company.github} className="btn-secondary" target="_blank" rel="noreferrer"><Github size={18} />Zobacz GitHub</a><Link to="/kontakt" className="btn-primary">Porozmawiajmy</Link></div></div>
      <aside className="highlight-box"><h2>Doświadczenie e-commerce</h2><p>Od 2019 roku uczestniczę w rozwoju i utrzymaniu sklepów internetowych <a href="https://mdd.pl" target="_blank" rel="noreferrer">mdd.pl</a> oraz <a href="https://mdd.eu" target="_blank" rel="noreferrer">mdd.eu</a>.</p><p>To doświadczenie zawodowe — nie przedstawiam sklepów jako projektu własnej działalności ani nie publikuję ich prywatnego kodu.</p></aside>
    </div></section>
    <section className="section bg-slate-50"><div className="site-container"><Eyebrow>Jak pracuję</Eyebrow><h2 className="section-title">Technicznie rzetelnie, komunikacyjnie jasno</h2><div className="cards-grid mt-10">{["Realny problem", "Jasny zakres", "Czytelny kod", "Testy", "Bezpieczeństwo", "Dokumentacja", "Backup przed zmianami", "Wdrożenie i weryfikacja"].map(x => <div className="mini-card" key={x}><Check size={18} />{x}</div>)}</div></div></section><FinalCta /></main>;
}

export function ServicesPage() {
  const schemas = services.map(s => ({ "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.lead, provider: { "@type": "ProfessionalService", name: company.name, url: "https://lemanczyk-it.pl/" } }));
  return <main id="main-content"><Seo title={pageMeta.services[0]} description={pageMeta.services[1]} path="/uslugi" schema={schemas} /><Breadcrumb current="Usługi" /><PageHero eyebrow="Usługi programistyczne" title="Od pojedynczej poprawki po kompletny system" lead="Pomagam firmom tworzyć, rozwijać i utrzymywać rozwiązania webowe, automatyzować procesy i bezpiecznie uruchamiać aplikacje na serwerach." />
    <section className="section pt-0"><div className="site-container grid gap-6">{services.map((s, i) => <article id={s.id} className="service-detail" key={s.id}><div className="service-number">0{i + 1}</div><div><h2>{s.title}</h2><p className="lead-small">{s.lead}</p><h3>Przykładowe zastosowania</h3><ul>{s.items.map(x => <li key={x}><Check size={17} />{x}</li>)}</ul><p className="benefit"><strong>Korzyść:</strong> rozwiązanie dopasowane do konkretnego procesu, łatwiejsze w obsłudze i dalszym rozwoju.</p><Link to="/kontakt" className="text-link">Zapytaj o ten zakres <ArrowRight size={17} /></Link></div></article>)}</div></section><FinalCta /></main>;
}

export function PortfolioPage() {
  const schemas = projects.map(p => ({ "@context": "https://schema.org", "@type": "CreativeWork", name: p.title, description: p.solution, url: p.live }));
  return <main id="main-content"><Seo title={pageMeta.portfolio[0]} description={pageMeta.portfolio[1]} path="/portfolio" schema={schemas} /><Breadcrumb current="Portfolio" /><PageHero eyebrow="Portfolio" title="Projekty, w których kod spotyka się z działającym wdrożeniem" lead="Wybrane rozwiązania pokazują doświadczenie z aplikacjami webowymi, automatyzacją, API, danymi oraz infrastrukturą Linux." />
    <section className="section pt-0"><div className="site-container grid gap-8">{projects.map(p => <article id={p.id} className="portfolio-detail" key={p.id}><div><p className="status">{p.status}</p><h2>{p.title}</h2><div className="project-copy"><h3>Problem</h3><p>{p.problem}</p><h3>Zakres rozwiązania</h3><p>{p.solution}</p><h3>Mój wkład</h3><p>{p.contribution}</p><h3>Rezultat</h3><p>{p.result}</p>{"note" in p && p.note && <p className="note">{p.note}</p>}</div></div><aside><h3>Technologie</h3><div className="tags">{p.tech.map(t => <span key={t}>{t}</span>)}</div><div className="mt-6 grid gap-3">{"live" in p && p.live && <a className="btn-primary justify-center" href={p.live} target="_blank" rel="noopener noreferrer">Zobacz publiczny serwis <ExternalLink size={17} /></a>}{"channel" in p && p.channel && <a className="btn-secondary justify-center" href={p.channel} target="_blank" rel="noopener noreferrer"><Youtube size={17} />Zobacz kanał YouTube</a>}{"repo" in p && p.repo && <a className="btn-secondary justify-center" href={p.repo} target="_blank" rel="noopener noreferrer"><Github size={17} />Zobacz repozytorium</a>}</div></aside></article>)}</div></section>
    <section className="section bg-slate-50"><div className="site-container max-w-4xl"><Eyebrow>Doświadczenie zawodowe</Eyebrow><h2 className="section-title">Doświadczenie w rozwoju sklepów internetowych</h2><p className="lead mt-5">Od 2019 roku uczestniczę w rozwoju i utrzymaniu sklepów internetowych mdd.pl oraz mdd.eu. Zakres pracy obejmuje rozwój funkcjonalności, poprawki, optymalizację, integracje, pracę z danymi i rozwiązywanie problemów technicznych.</p></div></section><FinalCta /></main>;
}

export function TechnologiesPage() {
  const groups = [
    ["Języki", ["JavaScript ES6+", "Python", "HTML5", "CSS3", "SQL", "Bash", "SourcePawn"]],
    ["Frontend", ["JavaScript", "responsywne interfejsy", "Fetch API / AJAX", "semantyczny HTML", "CSS", "dashboardy", "panele użytkowników"]],
    ["Backend", ["Python", "FastAPI", "REST API", "autoryzacja i role", "integracje API", "automatyzacja", "przetwarzanie danych"]],
    ["Bazy danych", ["MariaDB", "MySQL", "SQLite", "SQL"]],
    ["Linux i infrastruktura", ["Ubuntu Server", "Linux", "nginx", "systemd", "SSH", "Git", "GitHub", "GitHub Actions", "CI/CD", "TLS/HTTPS", "DNS", "monitoring", "backup i restore", "watchdog", "logi", "cron"]],
    ["Integracje i automatyzacja", ["REST API", "YouTube Data API", "Steam", "RCON", "JSON", "przetwarzanie plików", "harmonogramy"]],
    ["Serwery gier", ["SourceMod", "SourcePawn", "SteamCMD", "Workshop", "RCON", "Minecraft", "Left 4 Dead 2"]],
  ];
  return <main id="main-content"><Seo title={pageMeta.technologies[0]} description={pageMeta.technologies[1]} path="/technologie" /><Breadcrumb current="Technologie" /><PageHero eyebrow="Warsztat" title="Technologie, z których korzystam w pracy i projektach" lead="Dobieram narzędzia do problemu i istniejącego środowiska. Lista pokazuje praktyczny warsztat, nie deklarację eksperckiej specjalizacji w każdym elemencie." />
    <section className="section pt-0"><div className="site-container tech-grid">{groups.map(([name, items]) => <section className="card p-6 sm:p-8" key={name as string}><h2>{name}</h2><div className="tags mt-5">{(items as string[]).map(x => <span key={x}>{x}</span>)}</div></section>)}</div></section><FinalCta /></main>;
}

export function ContactPage() {
  return <main id="main-content"><Seo title={pageMeta.contact[0]} description={pageMeta.contact[1]} path="/kontakt" /><Breadcrumb current="Kontakt" /><PageHero eyebrow="Kontakt i wycena" title="Opowiedz krótko o projekcie albo problemie" lead="Szukasz programisty do rozwoju aplikacji, automatyzacji, integracji API, obsługi serwera albo naprawy istniejącego systemu? Odpowiem, czy mogę pomóc, i zaproponuję dalsze kroki." />
    <section className="section pt-0"><div className="site-container grid gap-10 lg:grid-cols-[.72fr_1.28fr]"><div><h2>Współpraca B2B po godzinach</h2><p className="mt-4 leading-relaxed text-slate-600">Podejmuję dodatkowe projekty realizowane poza godzinami pracy zawodowej. Wstępna rozmowa i orientacyjna wycena są bezpłatne.</p><div className="mt-7 grid gap-3"><a className="contact-row" href={`mailto:${company.email}`}><Mail /> <span><small>E-mail</small>{company.email}</span></a><a className="contact-row" href={`tel:${company.phoneHref}`}><Phone /> <span><small>Telefon</small>{company.phone}</span></a><a className="contact-row" href={company.github} target="_blank" rel="noreferrer"><Github /> <span><small>GitHub</small>Divithy-IT</span></a></div></div><ContactForm /></div></section></main>;
}

export function PrivacyPage() {
  return <main id="main-content"><Seo title={pageMeta.privacy[0]} description={pageMeta.privacy[1]} path="/polityka-prywatnosci" /><Breadcrumb current="Polityka prywatności" /><PageHero eyebrow="Dokument informacyjny" title="Polityka prywatności" lead="Poniższa treść wyjaśnia, jakie dane przetwarza serwis i w jakim celu. Jest rozsądnym projektem informacyjnym, a nie indywidualną poradą prawną." />
    <article className="section pt-0"><div className="site-container legal">
      <h2>1. Administrator danych</h2><p>Administratorem danych jest {company.name}, {company.address}, NIP {company.nip}. Kontakt: <a href={`mailto:${company.email}`}>{company.email}</a>.</p>
      <h2>2. Formularz kontaktowy</h2><p>Formularz może zbierać imię lub nazwę firmy, adres e-mail, opcjonalny telefon, temat, opis projektu, przedział budżetu i oczekiwany termin. Dane są używane wyłącznie do odpowiedzi, ustalenia możliwości współpracy i przygotowania oferty.</p>
      <h2>3. Podstawa i okres przetwarzania</h2><p>Podstawą jest podjęcie działań na żądanie osoby przed zawarciem umowy oraz prawnie uzasadniony interes polegający na prowadzeniu korespondencji i ochronie przed nadużyciami. Dane będą przechowywane przez czas potrzebny do obsługi zapytania, a następnie przez okres uzasadniony ewentualnymi roszczeniami lub obowiązkami prawnymi.</p>
      <h2>4. Hosting i logi techniczne</h2><p>Serwis działa na własnym VPS. Serwer może zapisywać techniczne logi, w tym adres IP, czas żądania, adres zasobu, kod odpowiedzi i informacje o przeglądarce. Logi służą bezpieczeństwu, diagnostyce i utrzymaniu.</p>
      <h2>5. Cookies i zasoby zewnętrzne</h2><p>Serwis nie korzysta z analityki marketingowej ani reklamowych plików cookies. Formularz nie wymaga konta. Strona używa lokalnych zasobów. GitHub, mdd.pl, mdd.eu i publiczne serwisy projektów są linkami zewnętrznymi, które stosują własne zasady prywatności.</p>
      <h2>6. Odbiorcy i bezpieczeństwo</h2><p>Dane mogą być przetwarzane przez dostawców infrastruktury i poczty wyłącznie w zakresie koniecznym do działania usług. Formularz stosuje walidację, honeypot i ograniczenie częstotliwości żądań. Nie należy przesyłać haseł, tokenów ani innych sekretów.</p>
      <h2>7. Prawa użytkownika</h2><p>Możesz żądać dostępu, sprostowania, usunięcia lub ograniczenia przetwarzania, wnieść sprzeciw oraz skargę do Prezesa Urzędu Ochrony Danych Osobowych — w granicach wynikających z przepisów.</p>
      <h2>8. Kontakt i zmiany</h2><p>Pytania dotyczące prywatności wyślij na <a href={`mailto:${company.email}`}>{company.email}</a>. Polityka obowiązuje od 31 lipca 2026 r. i może być aktualizowana wraz ze zmianą działania serwisu.</p>
    </div></article></main>;
}

export function NotFoundPage() {
  return <main id="main-content" className="page-hero"><Seo title="Nie znaleziono strony | Lemanczyk-IT" description="Podany adres nie istnieje. Wróć na stronę główną Lemanczyk-IT." path="/404" /><div className="site-container text-center"><Eyebrow>Błąd 404</Eyebrow><h1>Ta strona nie istnieje</h1><p className="lead mx-auto">Adres mógł się zmienić albo zawiera błąd.</p><Link className="btn-primary mt-8" to="/">Wróć na stronę główną</Link></div></main>;
}
