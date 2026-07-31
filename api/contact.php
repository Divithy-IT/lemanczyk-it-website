<?php
declare(strict_types=1);
require_once __DIR__ . '/contact_lib.php'; require_once __DIR__ . '/SmtpMailer.php';
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $ok, string $code, string $message, int $retryAfter = 0, ?string $field = null, ?string $reason = null): never {
    http_response_code($status); if ($retryAfter > 0) header('Retry-After: ' . $retryAfter);
    $payload = ['ok' => $ok, 'code' => $code, 'message' => $message];
    if ($field !== null) $payload['field'] = $field; if ($reason !== null) $payload['reason'] = $reason;
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit;
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') throw new ContactError(405, 'method_not_allowed', 'Dozwolona jest wyłącznie metoda POST.', 'method');
    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '' && !in_array($origin, ['https://lemanczyk-it.pl', 'https://www.lemanczyk-it.pl'], true)) throw new ContactError(403, 'invalid_origin', 'Nieprawidłowe źródło żądania.', 'origin');
    $data = validateContact($_POST);
    $config = loadMailerConfig('/etc/lemanczyk-it/contact-mailer.env');
    verifyTurnstile(trim((string)($_POST['cf-turnstile-response'] ?? '')), $config, 'turnstileHttpRequest', (string)($_SERVER['REMOTE_ADDR'] ?? ''));
    $keys = rateLimitKeys((string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), $data['email'], (string)($config['RATE_LIMIT_SECRET'] ?? ''));
    $lock = acquireContactRateLock($keys, '/var/lib/lemanczyk-it/contact-rate');
    try {
        $remaining = contactRateRemaining($keys, '/var/lib/lemanczyk-it/contact-rate');
        if ($remaining > 0) throw new ContactError(429, 'rate_limited', 'Kolejną wiadomość możesz wysłać za około 3 minuty.', 'rate_limit', $remaining);
        $requestId = bin2hex(random_bytes(6));
        (new SmtpMailer($config))->send(buildContactMail($data, $config, $requestId, new DateTimeImmutable()));
        markContactSent($keys, '/var/lib/lemanczyk-it/contact-rate');
    } finally { releaseContactRateLock($lock); }
    error_log('Contact form sent request_id=' . $requestId);
    respond(200, true, 'sent', 'Wiadomość została wysłana. Dziękuję za kontakt.');
} catch (ContactError $error) {
    if ($error->reason === 'honeypot') { error_log('Contact form security event=honeypot'); respond(200, true, 'accepted', $error->getMessage()); }
    debugContactValidation($_POST, $error);
    respond($error->status, false, $error->publicCode, $error->getMessage(), $error->retryAfter, $error->field, $error->publicCode === 'validation_error' ? $error->reason : null);
} catch (SmtpFailure $error) {
    error_log('Contact form delivery failed reason=' . $error->reason); respond(503, false, 'delivery_failed', contactFailureMessage());
} catch (Throwable $error) {
    error_log('Contact form unexpected failure type=' . get_class($error)); respond(503, false, 'delivery_failed', contactFailureMessage());
}
