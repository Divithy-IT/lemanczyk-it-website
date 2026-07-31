<?php
declare(strict_types=1);
require_once __DIR__ . '/contact_lib.php';
require_once __DIR__ . '/SmtpMailer.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $ok, string $message): never {
    http_response_code($status); echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit;
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') throw new ContactError(405, 'Dozwolona jest wyłącznie metoda POST.', 'method');
    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '' && $origin !== 'https://lemanczyk-it.pl') throw new ContactError(403, 'Nieprawidłowe źródło żądania.', 'origin');
    $data = validateContact($_POST);
    $rateKey = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    enforceContactRateLimit($rateKey, '/var/lib/lemanczyk-it/contact-rate');
    $config = loadMailerConfig('/etc/lemanczyk-it/contact-mailer.env');
    $requestId = bin2hex(random_bytes(6));
    $mail = buildContactMail($data, $config, $requestId, new DateTimeImmutable());
    (new SmtpMailer($config))->send($mail);
    error_log('Contact form sent request_id=' . $requestId);
    respond(200, true, 'Dziękuję. Wiadomość została wysłana — odpowiem tak szybko, jak to możliwe.');
} catch (ContactError $error) {
    if ($error->reason === 'honeypot') respond(200, true, $error->getMessage());
    respond($error->status, false, $error->getMessage());
} catch (SmtpFailure $error) {
    error_log('Contact form delivery failed reason=' . $error->reason);
    respond(503, false, contactFailureMessage());
} catch (Throwable $error) {
    error_log('Contact form unexpected failure type=' . get_class($error));
    respond(503, false, contactFailureMessage());
}
