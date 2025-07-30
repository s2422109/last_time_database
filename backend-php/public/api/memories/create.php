<?php
require_once __DIR__ . '/../../../core/db_connect.php';
require_once __DIR__ . '/../../../core/auth_check.php';

$authorId = checkAuth();
$upload_dir = $_SERVER['DOCUMENT_ROOT'] . '/uploads/';

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'ファイルが正しくアップロードされませんでした。']);
    exit();
}

$file_ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
$file_name = 'image-' . time() . '-' . uniqid() . '.' . $file_ext;
$target_file = $upload_dir . $file_name;

if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
    // ★★★ ここで、データベースに保存する値として「ファイル名」を使います ★★★
    $imageUrl_for_db = $file_name;
} else {
    http_response_code(500);
    echo json_encode(['error' => 'ファイルの保存に失敗しました。']);
    exit();
}

$comment = $_POST['comment'] ?? '';
$latitude = $_POST['latitude'] ?? 0;
$longitude = $_POST['longitude'] ?? 0;
$tagsJson = $_POST['tags'] ?? '[]';
$tags = json_decode($tagsJson, true);
$pdo = getDbConnection();
try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare('INSERT INTO "Memory" (comment, "imageUrl", latitude, longitude, "authorId", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, NOW(), NOW())');
    // ★ データベースにはファイル名だけを保存します
    $stmt->execute([$comment, $imageUrl_for_db, $latitude, $longitude, $authorId]);
    $memoryId = $pdo->lastInsertId('"Memory_id_seq"');
    if (!empty($tags) && is_array($tags)) {
        foreach ($tags as $tagName) {
            $stmt = $pdo->prepare('SELECT id FROM "Tag" WHERE name = ?');
            $stmt->execute([$tagName]);
            $tag = $stmt->fetch(PDO::FETCH_ASSOC);
            $tagId = $tag ? $tag['id'] : null;
            if (!$tagId) {
                $stmt = $pdo->prepare('INSERT INTO "Tag" (name) VALUES (?)');
                $stmt->execute([$tagName]);
                $tagId = $pdo->lastInsertId('"Tag_id_seq"');
            }
            $stmt = $pdo->prepare('INSERT INTO "MemoryTag" ("memoryId", "tagId") VALUES (?, ?)');
            $stmt->execute([$memoryId, $tagId]);
        }
    }
    $pdo->commit();
    http_response_code(201);
    // ★★★ ここで、レスポンスに必ず「filename」を含めて返します ★★★
    echo json_encode(['message' => 'Memory created successfully', 'memoryId' => $memoryId, 'filename' => $imageUrl_for_db]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'データベースへの保存に失敗しました: ' . $e->getMessage()]);
}
