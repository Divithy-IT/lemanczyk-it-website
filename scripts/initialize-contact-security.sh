#!/usr/bin/env bash
set -euo pipefail

config=/etc/lemanczyk-it/contact-mailer.env
if [[ ${EUID} -ne 0 ]]; then echo "Uruchom skrypt przez sudo." >&2; exit 1; fi
if [[ ! -f "$config" ]]; then echo "Brak $config." >&2; exit 1; fi
temporary=$(mktemp /etc/lemanczyk-it/contact-mailer.env.XXXXXX)
trap 'rm -f "$temporary"' EXIT
cp "$config" "$temporary"
grep -q '^CAPTCHA_SITE_KEY=' "$temporary" || printf 'CAPTCHA_SITE_KEY=\n' >> "$temporary"
grep -q '^CAPTCHA_SECRET_KEY=' "$temporary" || printf 'CAPTCHA_SECRET_KEY=\n' >> "$temporary"
grep -q '^RATE_LIMIT_SECRET=.' "$temporary" || {
  sed -i '/^RATE_LIMIT_SECRET=/d' "$temporary"
  printf 'RATE_LIMIT_SECRET=%s\n' "$(openssl rand -hex 32)" >> "$temporary"
}
install -o www-data -g www-data -m 0600 "$temporary" "$config"
echo "Zainicjalizowano konfigurację CAPTCHA i anonimowego rate limitu."
