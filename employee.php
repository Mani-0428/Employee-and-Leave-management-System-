<?php
header("Content-Type: application/json");
include "db.php";

$action = $_GET['action'] ?? '';

try {
    $pdo = db(); // get PDO connection

    // ---------------- FETCH ----------------
    if ($action === 'fetch') {
        $stmt = $pdo->query("SELECT * FROM employees ORDER BY id DESC");
        $data = $stmt->fetchAll();
        echo json_encode(["status" => "ok", "data" => $data]);
        exit;
    }

    // Read POST data (FormData)
    $input = $_POST;

  // ---------------- CREATE ----------------
if ($action === 'create') {
    $stmt = $pdo->prepare("
        INSERT INTO employees 
        (empId, name, personalEmail, officialEmail, department, joiningDate, dob, salary, exitDate, bloodGroup, personalPhone, emergencyContact, accountNumber, ifsc, pan, aadhar, status, wotAllowance, tenure, created_at, updated_at) 
        VALUES 
        (:empId, :name, :personalEmail, :officialEmail, :department, :joiningDate, :dob, :salary, :exitDate, :bloodGroup, :personalPhone, :emergencyContact, :accountNumber, :ifsc, :pan, :aadhar, :status, :wotAllowance, TIMESTAMPDIFF(MONTH, :joiningDate, IFNULL(:exitDate, NOW())), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ");

    $stmt->execute([
        ':empId'           => $input['empId'],
        ':name'            => $input['name'],
        ':personalEmail'   => $input['personalEmail'],
        ':officialEmail'   => $input['officialEmail'],
        ':department'      => $input['department'],
        ':joiningDate'     => $input['joiningDate'],
        ':dob'             => $input['dob'],
        ':salary'          => $input['salary'],
        ':exitDate'        => $input['exitDate'],
        ':bloodGroup'      => $input['bloodGroup'],
        ':personalPhone'   => $input['personalPhone'],
        ':emergencyContact'=> $input['emergencyContact'],
        ':accountNumber'   => $input['accountNumber'],
        ':ifsc'            => $input['ifsc'],
        ':pan'             => $input['pan'],
        ':aadhar'          => $input['aadhar'],
        ':status'          => $input['status'],
        ':tenure'          => $input['tenure'],
        ':wotAllowance'    => $input['wotAllowance'] ?? 0
    ]);

    echo json_encode(["status" => "ok", "id" => $input['empId']]);
    exit;
}


  // ---------------- UPDATE ----------------
if ($action === 'update') {
    $stmt = $pdo->prepare("
        UPDATE employees SET 
            empId = :empId,
            name = :name,
            personalEmail = :personalEmail,
            officialEmail = :officialEmail,
            department = :department,
            joiningDate = :joiningDate,
            dob = :dob,
            salary = :salary,
            exitDate = :exitDate,
            bloodGroup = :bloodGroup,
            personalPhone = :personalPhone,
            emergencyContact = :emergencyContact,
            accountNumber = :accountNumber,
            ifsc = :ifsc,
            pan = :pan,
            aadhar = :aadhar,
            status = :status,
            wotAllowance = :wotAllowance,
            tenure = TIMESTAMPDIFF(MONTH, joiningDate, IFNULL(exitDate, NOW())),
            updated_at = CURRENT_TIMESTAMP
        WHERE empId = :originalEmpId
    ");

    $stmt->execute([
        ':empId'           => $input['empId'],
        ':name'            => $input['name'],
        ':personalEmail'   => $input['personalEmail'],
        ':officialEmail'   => $input['officialEmail'],
        ':department'      => $input['department'],
        ':joiningDate'     => $input['joiningDate'],
        ':dob'             => $input['dob'],
        ':salary'          => $input['salary'],
        ':exitDate'        => $input['exitDate'],
        ':bloodGroup'      => $input['bloodGroup'],
        ':personalPhone'   => $input['personalPhone'],
        ':emergencyContact'=> $input['emergencyContact'],
        ':accountNumber'   => $input['accountNumber'],
        ':ifsc'            => $input['ifsc'],
        ':pan'             => $input['pan'],
        ':aadhar'          => $input['aadhar'],
        ':status'          => $input['status'],
        ':wotAllowance'    => $input['wotAllowance'] ?? 0,
        ':originalEmpId'   => $input['originalEmpId']
    ]);

    echo json_encode(["status" => "ok", "id" => $input['empId']]);
    exit;
}


    // ---------------- DELETE ----------------
    if ($action === 'delete') {
        $empId = $_GET['empId'] ?? '';
        $stmt = $pdo->prepare("DELETE FROM employees WHERE empId=:empId");
        $stmt->execute([':empId' => $empId]);
        echo json_encode(["status" => "ok"]);
        exit;
    }

    // ---------------- INVALID ACTION ----------------
    echo json_encode(["status" => "error", "message" => "Invalid action"]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
