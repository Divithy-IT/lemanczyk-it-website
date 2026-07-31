<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $ok, string $message): never {
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function field(string $name, int $max): string {
    $value = trim((string)($_POST[$name] ?? ''));
    if (mb_strlen($value) > $max) respond(422, false, 'Jedno z pól jest zbyt długie.');
    return $value;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, false, 'Dozwolona jest wyłącznie metoda POST.');
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '' && $origin !== 'https://lemanczyk-it.pl') respond(403, false, 'Nieprawidłowe źródło żądania.');
if (trim((string)($_POST['website'] ?? '')) !== '') respond(200, true, 'Dziękuję. Wiadomość została przyjęta.');

$name = field('name', 120);
$email = field('email', 190);
$phone = field('phone', 40);
$subject = field('subject', 160);
$message = field('message', 5000);
$budget = field('budget', 80);
$deadline = field('deadline', 100);
$privacy = (string)($_POST['privacy'] ?? '');
if ($name === '' || $subject === '' || mb_strlen($message) < 20 || $privacy !== 'yes') respond(422, false, 'Uzupełnij wymagane pola i zaakceptuj politykę prywatności.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email . $subject)) respond(422, false, 'Podaj poprawny adres e-mail i temat.');

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateFile = sys_get_temp_dir() . '/lemanczyk-contact-' . hash('sha256', $ip);
$now = time();
$previous = is_file($rateFile) ? (int)file_get_contents($rateFile) : 0;
if ($now - $previous < 60) respond(429, false, 'Odczekaj chwilę przed wysłaniem kolejnej wiadomości.');
file_put_contents($rateFile, (string)$now, LOCK_EX);

$cleanSubject = '[lemanczyk-it.pl] ' . $subject;
$body = "Nowe zapytanie ze strony lemanczyk-it.pl\n\nImię/firma: $name\nE-mail: $email\nTelefon: $phone\nBudżet: $budget\nTermin: $deadline\n\nWiadomość:\n$message\n";
$headers = [
    'From: formularz@lemanczyk-it.pl',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Form-Origin: lemanczyk-it.pl',
];
$isLocalMock = in_array($ip, ['127.0.0.1', '::1'], true) && ($_SERVER['HTTP_X_CONTACT_TEST'] ?? '') === 'mock';
if (!$isLocalMock && !mail('michal@lemanczyk-it.pl', $cleanSubject, $body, implode("\r\n", $headers))) {
    error_log('Contact form: mail transport failed');
    respond(503, false, 'Wiadomość nie mogła zostać wysłana. Napisz bezpośrednio na michal@lemanczyk-it.pl.');
}
respond(200, true, $isLocalMock ? 'Test formularza zakończony powodzeniem.' : 'Dziękuję. Wiadomość została wysłana — odpowiem tak szybko, jak to możliwe.');
