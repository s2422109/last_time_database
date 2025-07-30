<?php
// エラーを詳細に表示する設定
ini_set('display_errors', 1);
error_reporting(E_ALL);

// GETパラメータからファイル名を取得
$filename = $_GET['file'] ?? '';

// セキュリティチェック
if (empty($filename) || strpos($filename, '..') !== false || strpos($filename, '/') !== false) {
    http_response_code(400);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['error' => '不正なファイル名です。']);
    exit();
}

// ★★★ ここからが診断の核心 ★★★

// 1. サーバーの公開ルート（玄関）のパスを取得
$document_root = $_SERVER['DOCUMENT_ROOT'];

// 2. uploadsディレクトリのフルパスを組み立てる
$uploads_dir_path = $document_root . '/uploads/';

// 3. 探すべき画像ファイルのフルパスを組み立てる
$image_filepath = $uploads_dir_path . $filename;

// 4. 診断情報を集める
$debug_info = [
    'error_message' => '画像ファイルが見つかりませんでした。',
    'filename_received' => $filename,
    'searched_filepath' => $image_filepath,
    'document_root' => $document_root,
    'uploads_dir_exists' => is_dir($uploads_dir_path) ? 'はい' : 'いいえ',
    'uploads_dir_is_readable' => is_readable($uploads_dir_path) ? 'はい' : 'いいえ',
    'files_in_uploads_dir' => is_dir($uploads_dir_path) ? scandir($uploads_dir_path) : 'ディレクトリが存在しません'
];
// ★★★ ここまでが診断部分 ★★★


if (file_exists($image_filepath)) {
    // 成功した場合の処理 (変更なし)
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $image_filepath);
    finfo_close($finfo);
    header('Content-Type: ' . $mime_type);
    header('Content-Length: ' . filesize($image_filepath));
    readfile($image_filepath);
    exit();
} else {
    // 失敗した場合、集めた診断情報をJSONで返す
    http_response_code(404);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($debug_info);
    exit();
}
