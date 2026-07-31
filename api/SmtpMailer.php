<?php
declare(strict_types=1);

final class SmtpFailure extends RuntimeException {
    public function __construct(public readonly string $reason) { parent::__construct($reason); }
}

function loadMailerConfig(string $path): array {
    if (!is_file($path) || !is_readable($path)) throw new SmtpFailure('config_unreadable');
    $config = parse_ini_file($path, false, INI_SCANNER_RAW);
    if (!is_array($config)) throw new SmtpFailure('config_invalid');
    foreach (['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURITY', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'MAIL_FROM', 'MAIL_TO'] as $key) {
        if (!isset($config[$key]) || trim((string)$config[$key]) === '') throw new SmtpFailure('config_missing_' . strtolower($key));
    }
    if (!filter_var($config['MAIL_FROM'], FILTER_VALIDATE_EMAIL) || !filter_var($config['MAIL_TO'], FILTER_VALIDATE_EMAIL)) throw new SmtpFailure('config_invalid_address');
    return $config;
}

final class SmtpMailer {
    private $socket = null;
    public function __construct(private readonly array $config) {}

    public function send(array $mail): void {
        $host = (string)$this->config['SMTP_HOST']; $port = (int)$this->config['SMTP_PORT']; $timeout = (float)($this->config['SMTP_TIMEOUT'] ?? 10);
        $scheme = strtolower((string)$this->config['SMTP_SECURITY']) === 'tls' ? 'tls://' : 'tcp://';
        $errno = 0; $error = '';
        $this->socket = @stream_socket_client($scheme . $host . ':' . $port, $errno, $error, $timeout, STREAM_CLIENT_CONNECT);
        if (!is_resource($this->socket)) throw new SmtpFailure($errno === 0 ? 'smtp_timeout' : 'smtp_unavailable');
        stream_set_timeout($this->socket, (int)ceil($timeout));
        try {
            $this->expect([220]); $this->command('EHLO lemanczyk-it.pl', [250]);
            if (strtolower((string)$this->config['SMTP_SECURITY']) === 'starttls') {
                $this->command('STARTTLS', [220]);
                if (!stream_socket_enable_crypto($this->socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new SmtpFailure('smtp_tls');
                $this->command('EHLO lemanczyk-it.pl', [250]);
            }
            $this->command('AUTH LOGIN', [334]);
            $this->command(base64_encode((string)$this->config['SMTP_USERNAME']), [334]);
            $this->command(base64_encode((string)$this->config['SMTP_PASSWORD']), [235], true);
            $this->command('MAIL FROM:<' . $mail['from'] . '>', [250]);
            $this->command('RCPT TO:<' . $mail['to'] . '>', [250, 251]);
            $this->command('DATA', [354]);
            $headers = [
                'From: ' . $mail['from_name'] . ' <' . $mail['from'] . '>',
                'To: <' . $mail['to'] . '>', 'Reply-To: <' . $mail['reply_to'] . '>',
                'Subject: =?UTF-8?B?' . base64_encode($mail['subject']) . '?=',
                'Date: ' . date(DATE_RFC2822), 'MIME-Version: 1.0',
                'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: 8bit',
            ];
            $payload = implode("\r\n", $headers) . "\r\n\r\n" . str_replace(["\r\n", "\r"], "\n", $mail['body']);
            $payload = preg_replace('/(?m)^\./', '..', str_replace("\n", "\r\n", $payload));
            fwrite($this->socket, $payload . "\r\n.\r\n"); $this->expect([250]);
            $this->command('QUIT', [221]);
        } finally { if (is_resource($this->socket)) fclose($this->socket); }
    }

    private function command(string $command, array $codes, bool $sensitive = false): void {
        if (!is_resource($this->socket) || fwrite($this->socket, $command . "\r\n") === false) throw new SmtpFailure('smtp_write');
        try { $this->expect($codes); } catch (SmtpFailure $error) { if ($sensitive) throw new SmtpFailure('smtp_authentication'); throw $error; }
    }
    private function expect(array $codes): void {
        $line = ''; $code = 0;
        do {
            $line = fgets($this->socket, 2048);
            if ($line === false) { $meta = stream_get_meta_data($this->socket); throw new SmtpFailure(($meta['timed_out'] ?? false) ? 'smtp_timeout' : 'smtp_disconnected'); }
            $code = (int)substr($line, 0, 3);
        } while (isset($line[3]) && $line[3] === '-');
        if (!in_array($code, $codes, true)) throw new SmtpFailure($code === 535 ? 'smtp_authentication' : 'smtp_response_' . $code);
    }
}
