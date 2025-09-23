<?php
require '../db.php'; // adjust path if needed

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok'=>false,'error'=>'Invalid JSON']);
    exit;
}

$pdo = db();
$inserted = 0;

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("INSERT INTO employees 
        (id, name, empId, personalEmail, officialEmail, department, joiningDate, dob, salary, exitDate, bloodGroup, personalPhone, emergencyContact, accountNumber, ifsc, pan, aadhar, wotAllowance, status)
        VALUES 
        (:id, :name, :empId, :personalEmail, :officialEmail, :department, :joiningDate, :dob, :salary, :exitDate, :bloodGroup, :personalPhone, :emergencyContact, :accountNumber, :ifsc, :pan, :aadhar, :wotAllowance, :status)
        ON DUPLICATE KEY UPDATE 
            name = VALUES(name), personalEmail=VALUES(personalEmail), officialEmail=VALUES(officialEmail), department=VALUES(department),
            joiningDate=VALUES(joiningDate), dob=VALUES(dob), salary=VALUES(salary), exitDate=VALUES(exitDate),
            bloodGroup=VALUES(bloodGroup), personalPhone=VALUES(personalPhone), emergencyContact=VALUES(emergencyContact),
            accountNumber=VALUES(accountNumber), ifsc=VALUES(ifsc), pan=VALUES(pan), aadhar=VALUES(aadhar),
            wotAllowance=VALUES(wotAllowance), status=VALUES(status)
    ");

    foreach ($input as $emp) {
        $stmt->execute([
            ':id'              => $emp['id'] ?? uniqid(),
            ':name'            => $emp['name'] ?? '',
            ':empId'           => $emp['empId'] ?? '',
            ':personalEmail'   => $emp['personalEmail'] ?? '',
            ':officialEmail'   => $emp['officialEmail'] ?? '',
            ':department'      => $emp['department'] ?? '',
            ':joiningDate'     => $emp['joiningDate'] ?? null,
            ':dob'             => $emp['dob'] ?? null,
            ':salary'          => $emp['salary'] ?? 0,
            ':exitDate'        => $emp['exitDate'] ?? null,
            ':bloodGroup'      => $emp['bloodGroup'] ?? '',
            ':personalPhone'   => $emp['personalPhone'] ?? '',
            ':emergencyContact'=> $emp['emergencyContact'] ?? '',
            ':accountNumber'   => $emp['accountNumber'] ?? '',
            ':ifsc'            => $emp['ifsc'] ?? '',
            ':pan'             => $emp['pan'] ?? '',
            ':aadhar'          => $emp['aadhar'] ?? '',
            ':wotAllowance'    => isset($emp['wotAllowance']) ? (int)$emp['wotAllowance'] : 0,
            ':status'          => $emp['status'] ?? 'Active'
        ]);
        $inserted++;
    }

    $pdo->commit();

    echo json_encode(['ok'=>true,'inserted'=>$inserted]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['ok'=>false,'error'=>$e->getMessage()]);
}
