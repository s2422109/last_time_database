<?php
// リクエストされたパスを取得 (例: /uploads/image.jpg や /api/users/login.php)
$requested_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// 公開ディレクトリのパスを取得
$public_dir = __DIR__;

// リクエストされたパスに対応する、ディスク上の実際のファイルパスを組み立てる
$file_path = $public_dir . $requested_path;

// 1. もしファイルが存在し、それがPHPファイルでなければ (画像やCSSなど)
if (file_exists($file_path) && !is_dir($file_path) && pathinfo($file_path, PATHINFO_EXTENSION) !== 'php') {
    // falseを返すと、PHPの簡易サーバーがそのファイルを静的ファイルとして直接配信してくれる
    return false;
}

// 2. もしファイルが存在し、それがPHPファイルであれば
if (file_exists($file_path) && pathinfo($file_path, PATHINFO_EXTENSION) === 'php') {
    // そのPHPファイルを実行する
    require $file_path;
    return true;
}

// 3. どのファイルにも一致しない場合は、404 Not Foundを返す
http_response_code(404);
echo "404 Not Found: The requested resource {$requested_path} was not found.";
return true;
