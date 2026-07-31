<?php
declare(strict_types=1);

final class ContactError extends RuntimeException {
    public function __construct(public readonly int $status, string $message, public readonly string $reason) {
        parent::__construct($message);
    }
}

function contactField(array $input, string $name, int $max): string {
    $value = trim((string)($input[$name] ?? ''));
    if (mb_strlen($value) > $max) throw new ContactError(422, 'Jedno z pól jest zbyt długie.', 'field_too_long');
    return $value;
}

function validateContact(array $input): array {
    if (trim((string)($input['website'] ?? '')) !== '') throw new ContactError(200, 'Dziękuję. Wiadomość została przyjęta.', 'honeypot');
    $data = [
        'name' => contactField($input, 'name', 120),
        'email' => contactField($input, 'email', 190),
        'phone' => contactField($input, 'phone', 40),
        'subject' => contactField($input, 'subject', 160),
        'message' => contactField($input, 'message', 5000),
        'budget' => contactField($input, 'budget', 80),
        'deadline' => contactField($input, 'deadline', 100),
    ];
    if ($data['name'] === '' || $data['subject'] === '' || mb_strlen($data['message']) < 20 || ($input['privacy'] ?? '') !== 'yes') {
        throw new ContactError(422, 'Uzupełnij wymagane pola i zaakceptuj politykę prywatności.', 'required');
    }
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) throw new ContactError(422, 'Podaj poprawny adres e-mail i temat.', 'invalid_email');
    foreach (['email', 'subject', 'name'] as $headerField) {
        if (preg_match('/[\r\n]/', $data[$headerField])) throw new ContactError(422, 'Podaj poprawny adres e-mail i temat.', 'header_injection');
    }
    return $data;
}

function buildContactMail(array $data, array $config, string $requestId, DateTimeImmutable $sentAt): array {
    $subject = '[Lemanczyk-IT] Nowe zapytanie: ' . $data['subject'];
    $optional = static fn(string $value): string => $value === '' ? 'nie podano' : $value;
    $body = implode("\n", [
        'Nowe zapytanie z formularza Lemanczyk-IT', '',
        'Identyfikator: ' . $requestId,
        'Czas wysłania (UTC): ' . $sentAt->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s'), '',
        'Imię / firma: ' . $data['name'],
        'E-mail: ' . $data['email'],
        'Telefon: ' . $optional($data['phone']),
        'Temat: ' . $data['subject'],
        'Budżet: ' . $optional($data['budget']),
        'Termin: ' . $optional($data['deadline']), '',
        'Wiadomość:', $data['message'], '',
    ]);
    return [
        'from' => $config['MAIL_FROM'], 'from_name' => 'Lemanczyk-IT formularz',
        'to' => $config['MAIL_TO'], 'reply_to' => $data['email'],
        'subject' => $subject, 'body' => $body,
    ];
}

function enforceContactRateLimit(string $key, string $directory, int $seconds = 60): void {
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) throw new ContactError(503, contactFailureMessage(), 'rate_storage');
    $file = $directory . '/' . hash('sha256', $key);
    $handle = @fopen($file, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) throw new ContactError(503, contactFailureMessage(), 'rate_storage');
    $previous = (int)stream_get_contents($handle);
    $now = time();
    if ($now - $previous < $seconds) { fclose($handle); throw new ContactError(429, 'Odczekaj chwilę przed wysłaniem kolejnej wiadomości.', 'rate_limit'); }
    ftruncate($handle, 0); rewind($handle); fwrite($handle, (string)$now); fflush($handle); flock($handle, LOCK_UN); fclose($handle);
}

function contactFailureMessage(): string {
    return 'Nie udało się teraz wysłać wiadomości. Spróbuj ponownie później lub napisz bezpośrednio na michal@lemanczyk-it.pl.';
}
