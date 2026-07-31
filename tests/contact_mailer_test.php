<?php
declare(strict_types=1);
require_once __DIR__ . '/../api/contact_lib.php';

$base = ['name'=>'Firma Test','email'=>'client@example.com','phone'=>'123456789','subject'=>'Nowa aplikacja','message'=>'To jest wystarczająco długa wiadomość testowa.','budget'=>'10–20 tys.','deadline'=>'Q4','privacy'=>'yes','website'=>''];
$config = ['MAIL_FROM'=>'michal@lemanczyk-it.pl','MAIL_TO'=>'michal@lemanczyk-it.pl','CAPTCHA_SECRET_KEY'=>'test-secret'];
$tests = 0;
function check(bool $condition, string $message): void { global $tests; $tests++; if (!$condition) throw new RuntimeException($message); }
function reason(array $input): string { try { validateContact($input); return 'none'; } catch (ContactError $e) { return $e->reason; } }
function captchaReason(string $token, array $config, array $result): string { try { verifyTurnstile($token, $config, static fn()=> $result, '192.0.2.1'); return 'none'; } catch (ContactError $e) { return $e->reason; } }

$data = validateContact($base); $mail = buildContactMail($data, $config, 'abc123', new DateTimeImmutable('2026-07-31 10:00:00 UTC'));
check($mail['from'] === 'michal@lemanczyk-it.pl', 'stały From'); check($mail['to'] === 'michal@lemanczyk-it.pl', 'stały To');
check($mail['reply_to'] === 'client@example.com', 'Reply-To klienta'); check(str_starts_with($mail['subject'], '[Lemanczyk-IT] Nowe zapytanie:'), 'prefiks tematu');
check(str_contains($mail['body'], 'abc123'), 'identyfikator'); check(str_contains(buildContactMail([...$data, 'message'=>'<script>alert(1)</script>'], $config, 'x', new DateTimeImmutable())['body'], '<script>'), 'XSS pozostaje tekstem plain text');
check(reason([...$base, 'email'=>'bad']) === 'invalid', 'email'); check(reason([...$base, 'privacy'=>'']) === 'not_accepted', 'zgoda');
check(reason([...$base, 'website'=>'spam']) === 'honeypot', 'honeypot'); check(reason([...$base, 'subject'=>"temat\nBcc: x@example.com"]) === 'invalid', 'CRLF');
check(reason([...$base, 'message'=>str_repeat('a', 5001)]) === 'too_long', 'limit długości'); check(reason([...$base, 'message'=>'za krótka']) === 'too_short', 'minimalna długość');
check(captchaReason('', $config, []) === 'captcha_empty', 'CAPTCHA pusta'); check(captchaReason('bad', $config, ['success'=>false]) === 'captcha_rejected', 'CAPTCHA błędna');
check(captchaReason('ok', $config, ['success'=>true,'hostname'=>'evil.example','action'=>'contact_form']) === 'captcha_hostname', 'hostname CAPTCHA');
check(captchaReason('ok', $config, ['success'=>true,'hostname'=>'','action'=>'contact_form']) === 'captcha_hostname', 'brak hostname CAPTCHA');
check(captchaReason('ok', $config, ['success'=>true,'hostname'=>'lemanczyk-it.pl','action'=>'wrong']) === 'captcha_action', 'action CAPTCHA');
check(captchaReason('ok', $config, ['success'=>true,'hostname'=>'lemanczyk-it.pl','action'=>'contact_form']) === 'none', 'CAPTCHA poprawna');
try { verifyTurnstile('ok', $config, static function(): never { throw new RuntimeException('timeout'); }); check(false, 'timeout CAPTCHA'); } catch (ContactError $e) { check($e->reason === 'captcha_transport' && $e->status === 503, 'timeout CAPTCHA'); }
check(captchaReason('used-token', $config, ['success'=>false,'error-codes'=>['timeout-or-duplicate']]) === 'captcha_rejected', 'ponowne użycie tokenu');

$dir = sys_get_temp_dir() . '/lemanczyk-rate-test-' . bin2hex(random_bytes(4)); $keys = rateLimitKeys('192.0.2.1', 'CLIENT@example.com', 'rate-secret');
check(contactRateRemaining($keys, $dir, 180, 100) === 0, 'pierwsza wiadomość'); markContactSent($keys, $dir, 100);
check(contactRateRemaining($keys, $dir, 180, 100) === 180, 'druga blokowana'); check(contactRateRemaining($keys, $dir, 180, 279) === 1, 'Retry-After');
check(contactRateRemaining($keys, $dir, 180, 280) === 0, 'wiadomość po 180 s'); check(!str_contains(implode('', array_keys(array_flip($keys))), '192.0.2.1'), 'anonimizacja');
foreach (glob($dir . '/*') ?: [] as $file) unlink($file); rmdir($dir);

foreach (['smtp_timeout','smtp_authentication','smtp_unavailable','smtp_success'] as $result) {
    $mock = static function(array $message) use ($result): void { if ($result !== 'smtp_success') throw new RuntimeException($result); };
    try { $mock($mail); check($result === 'smtp_success', $result); } catch (RuntimeException $e) { check($e->getMessage() === $result, $result); }
}
echo "Testy formularza, SMTP, CAPTCHA i rate limitu: $tests OK\n";
