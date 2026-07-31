<?php
declare(strict_types=1);

final class ContactError extends RuntimeException {
    public function __construct(public readonly int $status, public readonly string $publicCode, string $message, public readonly string $reason, public readonly int $retryAfter = 0, public readonly ?string $field = null) {
        parent::__construct($message);
    }
}

function contactField(array $input, string $name, int $max): string {
    $value = trim((string)($input[$name] ?? ''));
    if (mb_strlen($value) > $max) throw new ContactError(422, 'validation_error', 'Sprawdź wymagane pola formularza.', 'too_long', 0, $name);
    return $value;
}

function validateContact(array $input): array {
    if (trim((string)($input['website'] ?? '')) !== '') throw new ContactError(200, 'accepted', 'Wiadomość została wysłana. Dziękuję za kontakt.', 'honeypot');
    $data = [
        'name' => contactField($input, 'name', 120), 'email' => contactField($input, 'email', 190),
        'phone' => contactField($input, 'phone', 40), 'subject' => contactField($input, 'subject', 160),
        'message' => contactField($input, 'message', 5000), 'budget' => contactField($input, 'budget', 80),
        'deadline' => contactField($input, 'deadline', 100),
    ];
    if ($data['name'] === '') throw new ContactError(422, 'validation_error', 'Uzupełnij pole „Imię lub firma”.', 'missing', 0, 'name');
    if ($data['email'] === '') throw new ContactError(422, 'validation_error', 'Uzupełnij adres e-mail.', 'missing', 0, 'email');
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) throw new ContactError(422, 'validation_error', 'Podaj poprawny adres e-mail.', 'invalid', 0, 'email');
    if ($data['subject'] === '') throw new ContactError(422, 'validation_error', 'Uzupełnij temat wiadomości.', 'missing', 0, 'subject');
    if ($data['message'] === '') throw new ContactError(422, 'validation_error', 'Uzupełnij opis projektu.', 'missing', 0, 'message');
    if (mb_strlen($data['message']) < 20) throw new ContactError(422, 'validation_error', 'Opis projektu musi mieć co najmniej 20 znaków.', 'too_short', 0, 'message');
    if (($input['privacy'] ?? '') !== 'yes') throw new ContactError(422, 'validation_error', 'Zaakceptuj politykę prywatności.', 'not_accepted', 0, 'privacy');
    foreach (['email', 'subject', 'name'] as $headerField) {
        if (preg_match('/[\r\n]/', $data[$headerField])) throw new ContactError(422, 'validation_error', 'Pole zawiera niedozwolone znaki.', 'invalid', 0, $headerField);
    }
    return $data;
}

function debugContactValidation(array $input, ContactError $error): void {
    if (getenv('CONTACT_DEBUG') !== '1' || $error->publicCode !== 'validation_error') return;
    $safe = [];
    foreach (['name','email','phone','subject','message','budget','deadline','website','privacy','cf-turnstile-response'] as $field) {
        $value = (string)($input[$field] ?? '');
        $safe[$field] = ['received' => array_key_exists($field, $input), 'empty' => trim($value) === '', 'length' => mb_strlen($value)];
        if ($field === 'cf-turnstile-response') unset($safe[$field]['length']);
    }
    error_log('Contact validation debug=' . json_encode(['fields' => $safe, 'failed_field' => $error->field, 'reason' => $error->reason], JSON_UNESCAPED_SLASHES));
}

function buildContactMail(array $data, array $config, string $requestId, DateTimeImmutable $sentAt): array {
    $optional = static fn(string $value): string => $value === '' ? 'nie podano' : $value;
    return [
        'from' => $config['MAIL_FROM'], 'from_name' => 'Lemanczyk-IT formularz', 'to' => $config['MAIL_TO'],
        'reply_to' => $data['email'], 'subject' => '[Lemanczyk-IT] Nowe zapytanie: ' . $data['subject'],
        'body' => implode("\n", ['Nowe zapytanie z formularza Lemanczyk-IT', '', 'Identyfikator: ' . $requestId,
            'Czas wysłania (UTC): ' . $sentAt->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s'), '',
            'Imię / firma: ' . $data['name'], 'E-mail: ' . $data['email'], 'Telefon: ' . $optional($data['phone']),
            'Temat: ' . $data['subject'], 'Budżet: ' . $optional($data['budget']), 'Termin: ' . $optional($data['deadline']), '',
            'Wiadomość:', $data['message'], '']),
    ];
}

function verifyTurnstile(string $token, array $config, callable $request, ?string $remoteIp = null): void {
    if ($token === '' || strlen($token) > 2048) throw new ContactError(400, 'captcha_failed', 'Nie udało się potwierdzić zabezpieczenia formularza. Spróbuj ponownie.', 'captcha_empty');
    if (empty($config['CAPTCHA_SECRET_KEY'])) throw new ContactError(503, 'captcha_unavailable', contactFailureMessage(), 'captcha_not_configured');
    $payload = ['secret' => $config['CAPTCHA_SECRET_KEY'], 'response' => $token];
    if ($remoteIp !== null && filter_var($remoteIp, FILTER_VALIDATE_IP)) $payload['remoteip'] = $remoteIp;
    try { $result = $request('https://challenges.cloudflare.com/turnstile/v0/siteverify', $payload, 8); }
    catch (Throwable) { throw new ContactError(503, 'captcha_unavailable', 'Zabezpieczenie formularza jest chwilowo niedostępne. Spróbuj ponownie później lub napisz bezpośrednio na michal@lemanczyk-it.pl.', 'captcha_transport'); }
    if (!is_array($result) || ($result['success'] ?? false) !== true) throw new ContactError(400, 'captcha_failed', 'Nie udało się potwierdzić zabezpieczenia formularza. Spróbuj ponownie.', 'captcha_rejected');
    $hostname = strtolower((string)($result['hostname'] ?? ''));
    if ($hostname !== '' && !in_array($hostname, ['lemanczyk-it.pl', 'www.lemanczyk-it.pl'], true)) throw new ContactError(400, 'captcha_failed', 'Nie udało się potwierdzić zabezpieczenia formularza. Spróbuj ponownie.', 'captcha_hostname');
}

function turnstileHttpRequest(string $url, array $payload, int $timeout): array {
    if (!function_exists('curl_init')) throw new RuntimeException('captcha_transport_unavailable');
    $handle = curl_init($url);
    curl_setopt_array($handle, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => http_build_query($payload), CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => $timeout, CURLOPT_CONNECTTIMEOUT => min(4, $timeout), CURLOPT_HTTPHEADER => ['Accept: application/json'],
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS, CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2]);
    $body = curl_exec($handle); $status = (int)curl_getinfo($handle, CURLINFO_RESPONSE_CODE); curl_close($handle);
    if (!is_string($body) || $status !== 200) throw new RuntimeException('captcha_transport_failed');
    $decoded = json_decode($body, true, 16, JSON_THROW_ON_ERROR);
    return is_array($decoded) ? $decoded : [];
}

function rateLimitKeys(string $ip, string $email, string $secret): array {
    if ($secret === '') throw new RuntimeException('rate_secret_missing');
    return [hash_hmac('sha256', 'ip:' . $ip, $secret), hash_hmac('sha256', 'email:' . mb_strtolower(trim($email)), $secret)];
}

function contactRateRemaining(array $keys, string $directory, int $cooldown = 180, ?int $now = null): int {
    $now ??= time(); $remaining = 0;
    foreach ($keys as $key) {
        $file = $directory . '/' . $key;
        if (is_file($file)) $remaining = max($remaining, $cooldown - ($now - (int)file_get_contents($file)));
    }
    return max(0, $remaining);
}

function acquireContactRateLock(array $keys, string $directory) {
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) throw new RuntimeException('rate_storage_unavailable');
    $lockName = hash('sha256', implode(':', $keys)); $handle = @fopen($directory . '/lock-' . $lockName, 'c');
    if ($handle === false || !flock($handle, LOCK_EX)) throw new RuntimeException('rate_storage_unavailable');
    return $handle;
}

function releaseContactRateLock($handle): void {
    if (is_resource($handle)) { flock($handle, LOCK_UN); fclose($handle); }
}

function markContactSent(array $keys, string $directory, ?int $now = null): void {
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) throw new RuntimeException('rate_storage_unavailable');
    $now ??= time();
    foreach ($keys as $key) {
        $file = $directory . '/' . $key; $handle = @fopen($file, 'c+');
        if ($handle === false || !flock($handle, LOCK_EX)) throw new RuntimeException('rate_storage_unavailable');
        ftruncate($handle, 0); rewind($handle); fwrite($handle, (string)$now); fflush($handle); flock($handle, LOCK_UN); fclose($handle);
        @chmod($file, 0600);
    }
}

function contactFailureMessage(): string {
    return 'Nie udało się teraz wysłać wiadomości. Spróbuj ponownie później lub napisz bezpośrednio na michal@lemanczyk-it.pl.';
}
