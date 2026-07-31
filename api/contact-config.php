<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store'); header('X-Content-Type-Options: nosniff');
$path = '/etc/lemanczyk-it/contact-mailer.env'; $config = is_readable($path) ? parse_ini_file($path, false, INI_SCANNER_RAW) : false;
$siteKey = is_array($config) ? trim((string)($config['CAPTCHA_SITE_KEY'] ?? '')) : '';
echo json_encode(['ok' => true, 'captcha' => ['provider' => 'turnstile', 'enabled' => $siteKey !== '', 'siteKey' => $siteKey]], JSON_UNESCAPED_SLASHES);
