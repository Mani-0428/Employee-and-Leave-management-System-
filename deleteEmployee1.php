<?php
header('Content-Type: application/json');
require_once 'db.php';

$id = $_POST['id'] ?? null;

if (!$id) {
    echo json_encode(["ok" => false, "error" => "Missing employee ID"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM employees WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["ok" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}
