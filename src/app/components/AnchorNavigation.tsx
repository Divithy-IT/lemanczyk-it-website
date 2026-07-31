import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router";

const legacyRootAnchors: Record<string, string> = {
  "#kontakt": "/kontakt", "#uslugi": "/uslugi", "#portfolio": "/portfolio",
  "#technologie": "/technologie", "#o-mnie": "/o-mnie",
};

function targetId(hash: string) {
  if (!hash || hash === "#") return "";
  try { return decodeURIComponent(hash.slice(1)); } catch { return hash.slice(1); }
}

function scrollToCurrentAnchor() {
  const id = targetId(window.location.hash);
  if (!id) { window.scrollTo({ top: 0, behavior: "auto" }); return true; }
  const target = document.getElementById(id);
  if (!target) return false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  return true;
}

export function AnchorNavigation() {
  const location = useLocation();

  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;
    const update = () => document.documentElement.style.setProperty("--site-header-height", `${header.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const legacy = location.pathname === "/" ? legacyRootAnchors[location.hash] : undefined;
    if (legacy) { window.location.replace(legacy); return; }
    let observer: MutationObserver | undefined;
    const frame = requestAnimationFrame(() => {
      if (scrollToCurrentAnchor()) return;
      observer = new MutationObserver(() => { if (scrollToCurrentAnchor()) observer?.disconnect(); });
      observer.observe(document.getElementById("root") ?? document.body, { childList: true, subtree: true });
    });
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [location.pathname, location.hash, location.key]);

  useEffect(() => {
    const handleHashChange = () => requestAnimationFrame(scrollToCurrentAnchor);
    const handleClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (link?.origin === window.location.origin && link.hash && link.pathname === window.location.pathname) requestAnimationFrame(scrollToCurrentAnchor);
    };
    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleClick);
    return () => { window.removeEventListener("hashchange", handleHashChange); document.removeEventListener("click", handleClick); };
  }, []);

  return null;
}
