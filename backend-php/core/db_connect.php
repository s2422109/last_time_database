<?php
// エラーを画面に表示するための設定 (開発時のみ)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// ヘッダー設定
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// OPTIONSリクエストへの対応 (CORSプリフライトリクエスト)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

function getDbConnection() {
    // .envファイルから接続情報を読み込む (Node.jsと同じ)
    $env = parse_ini_file(__DIR__ . '/../../.env');
    $dbUrl = $env['DATABASE_URL'];

    // PostgreSQLの接続文字列をパース
    preg_match("/postgresql:\/\/(.*):(.*)@(.*):(.*)\/(.*)/", $dbUrl, $matches);
    $user = $matches[1];
    $password = $matches[2];
    $host = $matches[3];
    $port = $matches[4];
    $dbname = $matches[5];

    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

    try {
        $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        return $pdo;
    } catch (PDOException $e) {
        // 接続失敗時はエラーメッセージを返して終了
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}