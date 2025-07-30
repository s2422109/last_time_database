<?php
// ★ ../ を一つ追加して、正しいパスに修正
require_once __DIR__ . '/../../../core/db_connect.php';

$pdo = getDbConnection();
$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required.']);
    exit();
}

$hashed_password = password_hash($data->password, PASSWORD_BCRYPT);

try {
    // ★ テーブル名とカラム名は大文字小文字を区別するため、ダブルクォートで囲む
    $stmt = $pdo->prepare("INSERT INTO \"User\" (email, name, password, \"createdAt\") VALUES (?, ?, ?, NOW())");
    $stmt->execute([$data->email, $data->name, $hashed_password]);

    http_response_code(201);
    echo json_encode(['message' => 'User created successfully.']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create user. ' . $e->getMessage()]);
}
