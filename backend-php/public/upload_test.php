<?php
// エラーを詳細に表示する設定
ini_set('display_errors', 1);
error_reporting(E_ALL);

// CORS設定
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 1. 保存先ディレクトリのパスを定義
// __DIR__ はこのファイルがある場所 (public) なので、その中の 'uploads' フォルダを指定
$upload_dir = __DIR__ . '/uploads/';

// 2. ディレクトリの存在と書き込み権限をチェック
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}
if (!is_writable($upload_dir)) {
    http_response_code(500);
    echo json_encode(['error' => 'ディレクトリに書き込み権限がありません', 'path' => realpath($upload_dir)]);
    exit();
}

// 3. ファイルがリクエストに含まれているかチェック
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'ファイルが正しくアップロードされませんでした', 'file_info' => $_FILES]);
    exit();
}

// 4. ファイルを移動する
$file_ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
$file_name = 'test-image-' . time() . '.' . $file_ext;
$target_file = $upload_dir . $file_name;

if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
    // 5. 成功した場合、成功メッセージとURL、物理パスを返す
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'];
    $imageUrl = $protocol . $host . '/uploads/' . $file_name;

    http_response_code(200);
    echo json_encode([
        'message' => 'ファイルアップロード成功！',
        'url' => $imageUrl,
        'physical_path' => $target_file
    ]);
} else {
    // 6. 移動に失敗した場合、エラーを返す
    http_response_code(500);
    echo json_encode(['error' => 'ファイルの移動に失敗しました。']);
}
