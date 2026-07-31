#!/usr/bin/env bash
set -euo pipefail

config=/etc/lemanczyk-it/contact-mailer.env
if [[ ${EUID} -ne 0 ]]; then
  echo "Uruchom skrypt przez sudo." >&2
  exit 1
fi
if [[ ! -f "$config" ]]; then
  echo "Brak $config — najpierw wdróż konfigurację serwera." >&2
  exit 1
fi
read -r -s -p "Hasło SMTP dla michal@lemanczyk-it.pl: " smtp_password
printf '\n'
if [[ -z "$smtp_password" || "$smtp_password" == *$'\n'* || "$smtp_password" == *$'\r'* ]]; then
  echo "Hasło jest puste albo ma niedozwolony znak nowej linii." >&2
  exit 1
fi
temporary=$(mktemp /etc/lemanczyk-it/contact-mailer.env.XXXXXX)
trap 'rm -f "$temporary"' EXIT
sed '/^SMTP_PASSWORD=/d' "$config" > "$temporary"
printf 'SMTP_PASSWORD=%s\n' "$smtp_password" >> "$temporary"
install -o www-data -g www-data -m 0600 "$temporary" "$config"
unset smtp_password
echo "Hasło zapisano bez wyświetlania go i bez dodawania do historii powłoki."
