<?php
require_once __DIR__ . '/../../../core/db_connect.php';
// Composerのオートローダーを読み込む
require_once __DIR__ . '/../../../vendor/autoload.php';

// JWTライブラリのクラスをインポート
use Firebase\JWT\JWT;

$pdo = getDbConnection();
$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required.']);
    exit();
}

$stmt = $pdo->prepare("SELECT id, password FROM \"User\" WHERE email = ?");
$stmt->execute([$data->email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($data->password, $user['password'])) {
    // .envファイルから秘密鍵を読み込む
    $env = parse_ini_file(__DIR__ . '/../../../../.env');
    $secret_key = $env['JWT_SECRET_KEY'] ?? 'YOUR_DEFAULT_SECRET_KEY';

    $issued_at = time();
    $expiration_time = $issued_at + 3600; // 1時間後に有効期限切れ

    // トークンに含める情報 (ペイロード)
    $payload = [
        'iat' => $issued_at,
        'exp' => $expiration_time,
        'data' => [
            'userId' => $user['id']
        ]
    ];

    // JWTをエンコード
    $jwt = JWT::encode($payload, $secret_key, 'HS256');

    http_response_code(200);
    // ★ 生成した本物のトークンを返す
    echo json_encode(['token' => $jwt]);

} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password.']);
}