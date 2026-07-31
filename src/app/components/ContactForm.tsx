import { FormEvent, useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<{ kind: "idle" | "sending" | "success" | "error"; message?: string }>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: "sending" });
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/contact.php", { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Nie udało się wysłać wiadomości.");
      form.reset();
      setState({ kind: "success", message: data.message });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz e-mail." });
    }
  }

  return (
    <form className="card grid gap-5 p-6 sm:p-8" onSubmit={submit} noValidate>
      <div className="form-grid">
        <label>Imię lub firma <input name="name" required maxLength={120} autoComplete="name" /></label>
        <label>E-mail <input name="email" type="email" required maxLength={190} autoComplete="email" /></label>
      </div>
      <div className="form-grid">
        <label>Telefon <span className="text-slate-500">(opcjonalnie)</span><input name="phone" type="tel" maxLength={40} autoComplete="tel" /></label>
        <label>Temat <input name="subject" required maxLength={160} /></label>
      </div>
      <label>Opis projektu <textarea name="message" required minLength={20} maxLength={5000} rows={7} placeholder="Napisz, czego potrzebujesz, jaki problem chcesz rozwiązać i jaki termin bierzesz pod uwagę." /></label>
      <div className="form-grid">
        <label>Budżet <span className="text-slate-500">(opcjonalnie)</span>
          <select name="budget" defaultValue=""><option value="">Wybierz przedział</option><option>do 3 000 zł</option><option>3 000–8 000 zł</option><option>8 000–20 000 zł</option><option>powyżej 20 000 zł</option><option>do ustalenia</option></select>
        </label>
        <label>Termin <span className="text-slate-500">(opcjonalnie)</span><input name="deadline" maxLength={100} placeholder="Np. wrzesień 2026" /></label>
      </div>
      <div className="hp-field" aria-hidden="true"><label>Strona internetowa<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="flex-row-label"><input name="privacy" type="checkbox" value="yes" required /> <span>Akceptuję <a className="text-blue-700 underline" href="/polityka-prywatnosci">politykę prywatności</a> i przetwarzanie danych w celu odpowiedzi na wiadomość.</span></label>
      <button className="btn-primary justify-center sm:justify-self-start" type="submit" disabled={state.kind === "sending"}>{state.kind === "sending" ? "Wysyłanie…" : "Wyślij zapytanie"}</button>
      {state.kind !== "idle" && state.kind !== "sending" && <p role="status" className={state.kind === "success" ? "form-success" : "form-error"}>{state.message}</p>}
    </form>
  );
}
