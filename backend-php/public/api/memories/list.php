<?php
require_once __DIR__ . '/../../../core/db_connect.php';
require_once __DIR__ . '/../../../core/auth_check.php';

$authorId = checkAuth();
$tagsQuery = $_GET['tags'] ?? '';
$pdo = getDbConnection();

$sql = '
    SELECT
        m.id, m.comment, m."imageUrl", m.latitude, m.longitude, m."createdAt",
        u.name as "authorName",
        (
            SELECT json_agg(json_build_object(\'tag\', json_build_object(\'name\', t.name)))
            FROM "MemoryTag" mt JOIN "Tag" t ON mt."tagId" = t.id
            WHERE mt."memoryId" = m.id
        ) as tags
    FROM "Memory" m
    JOIN "User" u ON m."authorId" = u.id
';

$params = [$authorId];
$whereClauses = ['m."authorId" = ?'];

if (!empty($tagsQuery)) {
    $tags = explode(',', $tagsQuery);
    foreach ($tags as $index => $tag) {
        $placeholder = ':tag' . $index;
        $whereClauses[] = 'EXISTS (SELECT 1 FROM "MemoryTag" mt_filter JOIN "Tag" t_filter ON mt_filter."tagId" = t_filter.id WHERE mt_filter."memoryId" = m.id AND t_filter.name = ' . $placeholder . ')';
    }
}

$sql .= ' WHERE ' . implode(' AND ', $whereClauses);
$sql .= ' ORDER BY m."createdAt" DESC';

try {
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(1, $authorId);
    if (!empty($tagsQuery)) {
        $tags = explode(',', $tagsQuery);
        foreach ($tags as $index => $tag) {
            $stmt->bindValue(':tag' . $index, trim($tag));
        }
    }
    $stmt->execute();
    $memories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($memories as &$memory) {
        $memory['tags'] = $memory['tags'] ? json_decode($memory['tags']) : [];
        $memory['author'] = ['name' => $memory['authorName']];
        unset($memory['authorName']);
    }

    echo json_encode($memories);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch memories: ' . $e->getMessage()]);
}
