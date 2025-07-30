<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function checkAuth() {
    // Apacheなどのサーバー環境でもヘッダーを取得できるように、より堅牢な方法を使います
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
    if (!$authHeader) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    }

    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication token required']);
        exit();
    }

    $jwt = $matches[1];
    if (!$jwt || $jwt === 'undefined') { // "undefined"という文字列も弾く
        http_response_code(401);
        echo json_encode(['error' => 'Authentication token is invalid.']);
        exit();
    }

    // .envファイルから秘密鍵を読み込む
    $env = parse_ini_file(__DIR__ . '/../../.env');
    $secret_key = $env['JWT_SECRET_KEY'] ?? 'YOUR_DEFAULT_SECRET_KEY';

    try {
        // トークンをデコード
        $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));
        // デコードされたユーザーIDを返す
        return $decoded->data->userId;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token: ' . $e->getMessage()]);
        exit();
    }
}
