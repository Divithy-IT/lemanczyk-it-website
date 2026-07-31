import { useEffect, useRef, useState } from "react";
import { Github, Mail, Menu, Phone, X } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router";
import { company, navigation } from "../siteData";

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOutside);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOutside);
    };
  }, [open]);

  return (
    <header ref={headerRef} className="site-header sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <a className="skip-link" href="#main-content">Przejdź do treści</a>
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-3 font-['Sora'] text-xl font-bold" aria-label="Lemanczyk-IT — strona główna">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">&lt;/&gt;</span>
          <span>Lemanczyk<span className="text-blue-600">-IT</span></span>
        </NavLink>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Główna nawigacja">
          {navigation.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>{label}</NavLink>
          ))}
        </nav>
        <div className="mobile-menu-controls">
          <button className="icon-button mobile-menu-button" type="button" aria-label={open ? "Zamknij menu" : "Otwórz menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <nav id="mobile-menu" className={`mobile-menu ${open ? "mobile-menu-open" : ""} border-t border-slate-200 bg-white px-5 py-5`} aria-label="Nawigacja mobilna" aria-hidden={!open}>
        {navigation.map(([to, label]) => <NavLink key={to} to={to} className="rounded-xl px-4 py-3 font-semibold hover:bg-blue-50">{label}</NavLink>)}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-14 text-slate-300">
      <div className="site-container grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-['Sora'] text-2xl font-bold text-white">Lemanczyk<span className="text-blue-400">-IT</span></p>
          <p className="mt-4 max-w-md leading-relaxed">Dedykowane aplikacje webowe, automatyzacje, integracje API oraz rozwiązania Linux i VPS dla firm.</p>
          <p className="mt-4 text-sm">{company.name}<br />{company.address}<br />NIP: {company.nip}</p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Nawigacja</h2>
          <div className="mt-4 grid gap-2">
            {navigation.map(([to, label]) => <NavLink key={to} to={to} className="hover:text-white">{label}</NavLink>)}
            <NavLink to="/polityka-prywatnosci" className="hover:text-white">Polityka prywatności</NavLink>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Kontakt</h2>
          <div className="mt-4 grid gap-3">
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white"><Mail size={18} />{company.email}</a>
            <a href={`tel:${company.phoneHref}`} className="flex items-center gap-2 hover:text-white"><Phone size={18} />{company.phone}</a>
            <a href={company.github} className="flex items-center gap-2 hover:text-white" target="_blank" rel="noreferrer"><Github size={18} />GitHub</a>
          </div>
        </div>
      </div>
      <div className="site-container mt-10 border-t border-slate-800 pt-6 text-sm">© {new Date().getFullYear()} Lemanczyk-IT. Wszelkie prawa zastrzeżone.</div>
    </footer>
  );
}

export default function SiteChrome() {
  useEffect(() => {
    const legacy: Record<string, string> = {
      "#kontakt": "/kontakt",
      "#uslugi": "/uslugi",
      "#portfolio": "/portfolio",
      "#technologie": "/technologie",
      "#o-mnie": "/o-mnie",
    };
    if (window.location.pathname === "/" && legacy[window.location.hash]) {
      window.location.replace(legacy[window.location.hash]);
    }
  }, []);
  return <><Header /><div className="site-header-spacer" aria-hidden="true" /><Outlet /><Footer /></>;
}
