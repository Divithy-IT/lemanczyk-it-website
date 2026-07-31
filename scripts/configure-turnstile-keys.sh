#!/usr/bin/env bash
set -euo pipefail

config=/etc/lemanczyk-it/contact-mailer.env
if [[ ${EUID} -ne 0 ]]; then echo "Uruchom skrypt przez sudo." >&2; exit 1; fi
if [[ ! -f "$config" ]]; then echo "Brak $config." >&2; exit 1; fi
read -r -p "Publiczny Turnstile site key: " site_key
read -r -s -p "Prywatny Turnstile secret key: " secret_key
printf '\n'
if [[ -z "$site_key" || -z "$secret_key" || "$site_key$secret_key" == *$'\n'* || "$site_key$secret_key" == *$'\r'* ]]; then echo "Klucze są puste albo nieprawidłowe." >&2; exit 1; fi
temporary=$(mktemp /etc/lemanczyk-it/contact-mailer.env.XXXXXX)
trap 'rm -f "$temporary"' EXIT
sed '/^CAPTCHA_SITE_KEY=/d; /^CAPTCHA_SECRET_KEY=/d' "$config" > "$temporary"
printf 'CAPTCHA_SITE_KEY=%s\nCAPTCHA_SECRET_KEY=%s\n' "$site_key" "$secret_key" >> "$temporary"
install -o www-data -g www-data -m 0600 "$temporary" "$config"
unset site_key secret_key
echo "Klucze zapisano w konfiguracji poza repozytorium."
