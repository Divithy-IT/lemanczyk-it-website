import type { MouseEvent } from "react";

const HEADER_OFFSET = 96;

export function handleSectionLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
  targetId: string,
) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const target = document.getElementById(targetId);

  if (!target) {
    return;
  }

  event.preventDefault();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

  window.history.pushState(null, "", `#${targetId}`);
  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}

export function handleScrollToTop(event: MouseEvent<HTMLAnchorElement>) {
  if (typeof window === "undefined") {
    return;
  }

  event.preventDefault();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.history.pushState(null, "", window.location.pathname);
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}
