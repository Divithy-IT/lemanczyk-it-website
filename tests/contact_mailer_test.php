<?php
declare(strict_types=1);
require_once __DIR__ . '/../api/contact_lib.php';

$base = ['name'=>'Firma Test','email'=>'client@example.com','phone'=>'123456789','subject'=>'Nowa aplikacja','message'=>'To jest wystarczająco długa wiadomość testowa.','budget'=>'10–20 tys.','deadline'=>'Q4','privacy'=>'yes','website'=>''];
$config = ['MAIL_FROM'=>'michal@lemanczyk-it.pl','MAIL_TO'=>'michal@lemanczyk-it.pl'];
$tests = 0;
function check(bool $condition, string $message): void { global $tests; $tests++; if (!$condition) throw new RuntimeException($message); }
function reason(array $input): string { try { validateContact($input); return 'none'; } catch (ContactError $e) { return $e->reason; } }

$data = validateContact($base); $mail = buildContactMail($data, $config, 'abc123', new DateTimeImmutable('2026-07-31 10:00:00 UTC'));
check($mail['from'] === 'michal@lemanczyk-it.pl', 'stały From');
check($mail['to'] === 'michal@lemanczyk-it.pl', 'stały To');
check($mail['reply_to'] === 'client@example.com', 'Reply-To klienta');
check(str_starts_with($mail['subject'], '[Lemanczyk-IT] Nowe zapytanie:'), 'prefiks tematu');
check(str_contains($mail['body'], 'abc123'), 'identyfikator');
check(reason([...$base, 'email'=>'bad']) === 'invalid_email', 'email');
check(reason([...$base, 'privacy'=>'']) === 'required', 'zgoda');
check(reason([...$base, 'website'=>'spam']) === 'honeypot', 'honeypot');
check(reason([...$base, 'subject'=>"temat\nBcc: x@example.com"]) === 'header_injection', 'newline injection');
check(reason([...$base, 'message'=>str_repeat('a', 5001)]) === 'field_too_long', 'limit długości');

$dir = sys_get_temp_dir() . '/lemanczyk-rate-test-' . bin2hex(random_bytes(4));
enforceContactRateLimit('test', $dir, 60);
try { enforceContactRateLimit('test', $dir, 60); check(false, 'rate limit'); } catch (ContactError $e) { check($e->reason === 'rate_limit', 'rate limit'); }
unlink($dir . '/' . hash('sha256', 'test')); rmdir($dir);

foreach (['smtp_timeout','smtp_authentication','smtp_unavailable'] as $failure) {
    $mockSmtp = static function(array $message) use ($failure): void { throw new RuntimeException($failure); };
    try { $mockSmtp($mail); check(false, $failure); } catch (RuntimeException $e) { check($e->getMessage() === $failure, $failure); }
}
echo "Testy formularza SMTP: $tests OK\n";
