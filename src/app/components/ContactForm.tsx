import { FormEvent, useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    turnstile?: { render: (element: HTMLElement, options: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void };
  }
}

type FormState = { kind: "idle" | "sending" | "success" | "error"; message?: string };
const fallbackMessage = "Nie udało się teraz wysłać wiadomości. Spróbuj ponownie później lub napisz bezpośrednio na michal@lemanczyk-it.pl.";

export function ContactForm() {
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [captcha, setCaptcha] = useState<"loading" | "ready" | "unavailable">("loading");
  const [captchaToken, setCaptchaToken] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const captchaElement = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let active = true;
    async function setupCaptcha() {
      try {
        const response = await fetch("/api/contact-config.php", { headers: { Accept: "application/json" } });
        const contentType = response.headers.get("content-type") || "";
        if (!response.ok || !contentType.includes("application/json")) throw new Error("captcha_config");
        const config = await response.json();
        if (!config?.captcha?.enabled || !config.captcha.siteKey) throw new Error("captcha_not_configured");
        let script = document.querySelector<HTMLScriptElement>('script[data-turnstile="true"]');
        if (!script) {
          script = document.createElement("script"); script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
          script.async = true; script.defer = true; script.dataset.turnstile = "true"; document.head.appendChild(script);
        }
        if (!window.turnstile) await new Promise<void>((resolve, reject) => { script!.addEventListener("load", () => resolve(), { once: true }); script!.addEventListener("error", () => reject(new Error("captcha_script")), { once: true }); });
        if (!active || !captchaElement.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(captchaElement.current, {
          sitekey: config.captcha.siteKey, theme: "light", language: "pl", appearance: "interaction-only", execution: "render", retry: "auto", "refresh-expired": "auto", action: "contact_form",
          callback: (token: string) => { setCaptchaToken(token); setCaptcha("ready"); },
          "expired-callback": () => { setCaptchaToken(""); setCaptcha("loading"); },
          "error-callback": () => { setCaptchaToken(""); setCaptcha("unavailable"); },
        });
        setCaptcha("ready");
      } catch (error) {
        if (import.meta.env.DEV) console.warn("Contact CAPTCHA unavailable", error);
        if (active) setCaptcha("unavailable");
      }
    }
    setupCaptcha();
    return () => { active = false; if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current); };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown > 0]);

  useEffect(() => { if (state.kind === "success" || state.kind === "error") messageRef.current?.focus(); }, [state.kind]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "sending" || cooldown > 0) return;
    if (!captchaToken) { setState({ kind: "error", message: "Potwierdź zabezpieczenie formularza przed wysłaniem." }); return; }
    setState({ kind: "sending" });
    const form = event.currentTarget;
    try {
      const body = new FormData(form); body.set("cf-turnstile-response", captchaToken);
      const response = await fetch("/api/contact.php", { method: "POST", body, headers: { Accept: "application/json" } });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) {
        if (import.meta.env.DEV) console.warn("Contact endpoint returned non-JSON", response.status, contentType);
        throw new Error(fallbackMessage);
      }
      const data = await response.json();
      if (!response.ok || !data?.ok) {
        if (response.status === 429) setCooldown(Number(response.headers.get("retry-after")) || 180);
        throw new Error(typeof data?.message === "string" ? data.message : fallbackMessage);
      }
      form.reset(); setCaptchaToken(""); setCooldown(180); if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      setState({ kind: "success", message: "Wiadomość została wysłana. Dziękuję za kontakt. Odpowiem tak szybko, jak będzie to możliwe." });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : fallbackMessage });
    }
  }

  const disabled = state.kind === "sending" || cooldown > 0 || captcha !== "ready" || !captchaToken;
  return (
    <form className="card grid gap-5 p-6 sm:p-8" onSubmit={submit} aria-busy={state.kind === "sending"}>
      <div className="form-grid"><label>Imię lub firma <input name="name" required maxLength={120} autoComplete="name" /></label><label>E-mail <input name="email" type="email" required maxLength={190} autoComplete="email" /></label></div>
      <div className="form-grid"><label>Telefon <span className="text-slate-500">(opcjonalnie)</span><input name="phone" type="tel" maxLength={40} autoComplete="tel" /></label><label>Temat <input name="subject" required maxLength={160} /></label></div>
      <label>Opis projektu <textarea name="message" required minLength={20} maxLength={5000} rows={7} placeholder="Napisz, czego potrzebujesz, jaki problem chcesz rozwiązać i jaki termin bierzesz pod uwagę." /></label>
      <div className="form-grid"><label>Budżet <span className="text-slate-500">(opcjonalnie)</span><select name="budget" defaultValue=""><option value="">Wybierz przedział</option><option>do 3 000 zł</option><option>3 000–8 000 zł</option><option>8 000–20 000 zł</option><option>powyżej 20 000 zł</option><option>do ustalenia</option></select></label><label>Termin <span className="text-slate-500">(opcjonalnie)</span><input name="deadline" maxLength={100} placeholder="Np. wrzesień 2026" /></label></div>
      <div className="hp-field" aria-hidden="true"><label>Strona internetowa<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="flex-row-label"><input name="privacy" type="checkbox" value="yes" required /> <span>Akceptuję <a className="text-blue-700 underline" href="/polityka-prywatnosci">politykę prywatności</a> i przetwarzanie danych w celu odpowiedzi na wiadomość.</span></label>
      <div className="captcha-wrap"><div ref={captchaElement} />{captcha === "loading" && <p>Ładowanie zabezpieczenia formularza…</p>}{captcha === "unavailable" && <p className="captcha-fallback">Zabezpieczenie formularza nie zostało załadowane. Możesz napisać bezpośrednio na <a href="mailto:michal@lemanczyk-it.pl">michal@lemanczyk-it.pl</a>.</p>}</div>
      <p className="captcha-note"><ShieldCheck size={16} aria-hidden="true" /> <span>Formularz jest chroniony przez Cloudflare Turnstile oraz limit wysyłki. Obowiązują <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">zasady prywatności</a> i <a href="https://www.cloudflare.com/website-terms/" target="_blank" rel="noopener noreferrer">warunki Cloudflare</a>.</span></p>
      <button className="btn-primary justify-center sm:justify-self-start" type="submit" disabled={disabled}>{state.kind === "sending" ? "Wysyłanie…" : cooldown > 0 ? `Ponowna wysyłka za ${cooldown} s` : "Wyślij zapytanie"}</button>
      {cooldown > 0 && <p className="form-cooldown">Kolejną wiadomość możesz wysłać po zakończeniu odliczania.</p>}
      {state.kind !== "idle" && state.kind !== "sending" && <p ref={messageRef} tabIndex={-1} role="status" aria-live="polite" className={state.kind === "success" ? "form-success" : "form-error"}>{state.message}</p>}
    </form>
  );
}
