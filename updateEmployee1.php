<?php
header('Content-Type: application/json');
require_once 'db.php';

// Read POST data
$id = $_POST['id'] ?? null;
$name = $_POST['name'] ?? '';
$empId = $_POST['empId'] ?? '';
$department = $_POST['department'] ?? '';
$personalEmail = $_POST['personalEmail'] ?? '';
$officialEmail = $_POST['officialEmail'] ?? '';
$personalPhone = $_POST['personalPhone'] ?? '';
$emergencyContact = $_POST['emergencyContact'] ?? '';
$dob = $_POST['dob'] ?? null;
$joiningDate = $_POST['joiningDate'] ?? null;
$salary = $_POST['salary'] ?? 0;
$bloodGroup = $_POST['bloodGroup'] ?? '';

if (!$id) {
    echo json_encode(["ok" => false, "error" => "Missing employee ID"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE employees
        SET name=?, empId=?, department=?, personalEmail=?, officialEmail=?,
            personalPhone=?, emergencyContact=?, dob=?, joiningDate=?, salary=?, bloodGroup=?
        WHERE id=?
    ");
    $stmt->execute([
        $name, $empId, $department, $personalEmail, $officialEmail,
        $personalPhone, $emergencyContact, $dob, $joiningDate, $salary, $bloodGroup,
        $id
    ]);

    echo json_encode(["ok" => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}
