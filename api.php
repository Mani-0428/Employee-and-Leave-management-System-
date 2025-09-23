<?php
// api.php
header('Content-Type: application/json; charset=utf-8');
require_once 'db.php';

// Get PDO instance
$pdo = db();

// Helper: read JSON input (for POST/PUT)
function input_json() {
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);
    return is_array($data) ? $data : $_POST;
}

// Determine action
$action = $_REQUEST['action'] ?? ($_SERVER['REQUEST_METHOD'] === 'GET' ? 'list' : null);

try {
// --- LIST EMPLOYEES ---
if ($action === 'list') {
    $q = $_GET['q'] ?? '';
    $queue = $_GET['queue'] ?? ''; // all | active | inactive | probation
    $where = [];
    $params = [];

    $sql = "SELECT * FROM employees";

    // search filter
    if ($q !== '') {
        $where[] = "(name LIKE :q 
                     OR empId LIKE :q 
                     OR personalEmail LIKE :q 
                     OR officialEmail LIKE :q 
                     OR department LIKE :q 
                     OR ifsc LIKE :q 
                     OR pan LIKE :q 
                     OR aadhar LIKE :q)";
        $params[':q'] = "%$q%";
    }

    // queue filter
    if ($queue !== '' && $queue !== 'all') {
        if ($queue === 'active') {
            $where[] = "status = 'active'";
        } elseif ($queue === 'inactive') {
            $where[] = "status = 'inactive'";
        } elseif ($queue === 'probation') {
            // joined within last 3 months and still active
            $where[] = "DATEDIFF(CURDATE(), joiningDate) <= 90";
            $where[] = "status = 'active'";
        }
    }

    if ($where) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}



if ($_GET['action'] === 'get' && isset($_GET['id'])) {
    $stmt = $pdo->prepare("SELECT * FROM employees WHERE id = :id");
    $stmt->execute([':id' => $_GET['id']]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

    // --- CREATE EMPLOYEE ---
    if ($action === 'create') {
        $data = input_json();
        $stmt = $pdo->prepare("INSERT INTO employees
            (name, empId, department, bloodGroup, personalEmail, officialEmail, personalPhone, emergencyContact, joiningDate, dob, salary, wotAllowance, exitDate, accountNumber, ifsc, pan, aadhar, status)
            VALUES (:name,:empId,:department,:bloodGroup,:personalEmail,:officialEmail,:personalPhone,:emergencyContact,:joiningDate,:dob,:salary,:wotAllowance,:exitDate,:accountNumber,:ifsc,:pan,:aadhar,:status)");
        $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':empId' => $data['empId'] ?? '',
            ':department' => $data['department'] ?? null,
            ':bloodGroup' => $data['bloodGroup'] ?? null,
            ':personalEmail' => $data['personalEmail'] ?? null,
            ':officialEmail' => $data['officialEmail'] ?? null,
            ':personalPhone' => $data['personalPhone'] ?? null,
            ':emergencyContact' => $data['emergencyContact'] ?? null,
            ':joiningDate' => $data['joiningDate'] ?: null,
            ':dob' => $data['dob'] ?: null,
            ':salary' => $data['salary'] ?? 0,
            ':wotAllowance' => !empty($data['wotAllowance']) ? 1 : 0,
            ':exitDate' => $data['exitDate'] ?: null,
            ':accountNumber' => $data['accountNumber'] ?? null,
            ':ifsc' => $data['ifsc'] ?? null,
            ':pan' => $data['pan'] ?? null,
            ':aadhar' => $data['aadhar'] ?? null,
            ':status' => $data['status'] ?? 'active'
        ]);
        echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    // --- UPDATE EMPLOYEE ---
    if ($action === 'update') {
        $data = input_json();
        if (empty($data['id'])) throw new Exception("id required");

        // Check empId uniqueness
        if (!empty($data['empId'])) {
            $check = $pdo->prepare("SELECT id FROM employees WHERE empId = :empId AND id <> :id");
            $check->execute([
                ':empId' => $data['empId'],
                ':id' => $data['id']
            ]);
            if ($check->fetch()) {
                throw new Exception("Employee ID already exists. Please use a unique empId.");
            }
        }

        $stmt = $pdo->prepare("UPDATE employees SET
            name=:name,
            empId=:empId,
            department=:department,
            bloodGroup=:bloodGroup,
            personalEmail=:personalEmail,
            officialEmail=:officialEmail,
            personalPhone=:personalPhone,
            emergencyContact=:emergencyContact,
            joiningDate=:joiningDate,
            dob=:dob,
            salary=:salary,
            wotAllowance=:wotAllowance,
            exitDate=:exitDate,
            accountNumber=:accountNumber,
            ifsc=:ifsc,
            pan=:pan,
            aadhar=:aadhar,
            tenure=:tenure,
            status=:status
            WHERE id=:id
        ");
        $stmt->execute([
            ':name' => $data['name'] ?? '',
            ':empId' => $data['empId'] ?? '',
            ':department' => $data['department'] ?? null,
            ':bloodGroup' => $data['bloodGroup'] ?? null,
            ':personalEmail' => $data['personalEmail'] ?? null,
            ':officialEmail' => $data['officialEmail'] ?? null,
            ':personalPhone' => $data['personalPhone'] ?? null,
            ':emergencyContact' => $data['emergencyContact'] ?? null,
            ':joiningDate' => $data['joiningDate'] ?: null,
            ':dob' => $data['dob'] ?: null,
            ':salary' => $data['salary'] ?? 0,
            ':wotAllowance' => !empty($data['wotAllowance']) ? 1 : 0,
            ':exitDate' => $data['exitDate'] ?: null,
            ':accountNumber' => $data['accountNumber'] ?? null,
            ':ifsc' => $data['ifsc'] ?? null,
            ':pan' => $data['pan'] ?? null,
            ':aadhar' => $data['aadhar'] ?? null,
            ':tenure' => $data['tenure'] ?? 0,
            ':status' => $data['status'] ?? 'active',
            ':id' => $data['id']
        ]);
        echo json_encode(['ok' => true]);
        exit;
    }

    // --- DELETE EMPLOYEE ---
    if ($action === 'delete') {
        $data = input_json();
        $id = $data['id'] ?? null;
        if (!$id) throw new Exception('id required');

        $stmt = $pdo->prepare("DELETE FROM employees WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(['ok' => true]);
        exit;
    }

    // --- BULK IMPORT (CSV/JSON) ---
    if ($action === 'bulk_import') {
        $files = [];
        if (!empty($_FILES['files'])) {
            foreach ($_FILES['files']['tmp_name'] as $i => $tmp) {
                $files[] = [
                    'tmp_name' => $_FILES['files']['tmp_name'][$i],
                    'name' => $_FILES['files']['name'][$i],
                    'type' => $_FILES['files']['type'][$i]
                ];
            }
        } elseif (!empty($_FILES['file'])) {
            $files[] = $_FILES['file'];
        } else {
            throw new Exception('No files uploaded');
        }

        $imported = 0;
        foreach ($files as $f) {
            $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
            if ($ext === 'csv') {
                if (($handle = fopen($f['tmp_name'], 'r')) !== false) {
                    $headers = fgetcsv($handle);
                    if ($headers === false) continue;
                    $map = array_map('strtolower', array_map('trim', $headers));

                    while (($row = fgetcsv($handle)) !== false) {
                        $rowAssoc = [];
                        foreach ($map as $i => $h) $rowAssoc[$h] = $row[$i] ?? null;

                        $stmt = $pdo->prepare("INSERT INTO employees
                            (name, empId, department, bloodGroup, personalEmail, officialEmail, personalPhone, emergencyContact, joiningDate, dob, salary, wotAllowance, exitDate, accountNumber, ifsc, pan, aadhar, status)
                            VALUES (:name,:empId,:department,:bloodGroup,:personalEmail,:officialEmail,:personalPhone,:emergencyContact,:joiningDate,:dob,:salary,:wotAllowance,:exitDate,:accountNumber,:ifsc,:pan,:aadhar,:status)");
                        $stmt->execute([
                            ':name'=>$rowAssoc['name'] ?? '',
                            ':empId'=>$rowAssoc['empid'] ?? ($rowAssoc['employee id'] ?? ''),
                            ':department'=>$rowAssoc['department'] ?? null,
                            ':bloodGroup'=>$rowAssoc['bloodgroup'] ?? null,
                            ':personalEmail'=>$rowAssoc['personalemail'] ?? null,
                            ':officialEmail'=>$rowAssoc['officialemail'] ?? null,
                            ':personalPhone'=>$rowAssoc['personalphone'] ?? null,
                            ':emergencyContact'=>$rowAssoc['emergencycontact'] ?? null,
                            ':joiningDate'=>!empty($rowAssoc['joiningdate']) ? date('Y-m-d', strtotime($rowAssoc['joiningdate'])) : null,
                            ':dob'=>!empty($rowAssoc['dob']) ? date('Y-m-d', strtotime($rowAssoc['dob'])) : null,
                            ':salary'=>floatval($rowAssoc['salary'] ?? 0),
                            ':wotAllowance'=>!empty($rowAssoc['wotallowance']) ? 1 : 0,
                            ':exitDate'=>!empty($rowAssoc['exitdate']) ? date('Y-m-d', strtotime($rowAssoc['exitdate'])) : null,
                            ':accountNumber'=>$rowAssoc['accountnumber'] ?? null,
                            ':ifsc'=>$rowAssoc['ifsc'] ?? $rowAssoc['ifsc code'] ?? null,
                            ':pan'=>$rowAssoc['pan'] ?? null,
                            ':aadhar'=>$rowAssoc['aadhar'] ?? null,
                            ':tenure'=>$rowAssoc['tenure'] ?? 0,
                            ':status'=>$rowAssoc['status'] ?? 'active'
                        ]);
                        $imported++;
                    }
                    fclose($handle);
                }
            } elseif ($ext === 'json') {
                $arr = json_decode(file_get_contents($f['tmp_name']), true);
                if (!is_array($arr)) continue;
                foreach ($arr as $rowAssoc) {
                    $stmt = $pdo->prepare("INSERT INTO employees
                        (name, empId, department, bloodGroup, personalEmail, officialEmail, personalPhone, emergencyContact, joiningDate, dob, salary, wotAllowance, exitDate, accountNumber, ifsc, pan, aadhar, status)
                        VALUES (:name,:empId,:department,:bloodGroup,:personalEmail,:officialEmail,:personalPhone,:emergencyContact,:joiningDate,:dob,:salary,:wotAllowance,:exitDate,:accountNumber,:ifsc,:pan,:aadhar,:status)");
                    $stmt->execute([
                        ':name'=>$rowAssoc['name'] ?? '',
                        ':empId'=>$rowAssoc['empId'] ?? ($rowAssoc['empid'] ?? ''),
                        ':department'=>$rowAssoc['department'] ?? null,
                        ':bloodGroup'=>$rowAssoc['bloodGroup'] ?? null,
                        ':personalEmail'=>$rowAssoc['personalEmail'] ?? null,
                        ':officialEmail'=>$rowAssoc['officialEmail'] ?? null,
                        ':personalPhone'=>$rowAssoc['personalPhone'] ?? null,
                        ':emergencyContact'=>$rowAssoc['emergencyContact'] ?? null,
                        ':joiningDate'=>!empty($rowAssoc['joiningDate']) ? date('Y-m-d', strtotime($rowAssoc['joiningDate'])) : null,
                        ':dob'=>!empty($rowAssoc['dob']) ? date('Y-m-d', strtotime($rowAssoc['dob'])) : null,
                        ':salary'=>floatval($rowAssoc['salary'] ?? 0),
                        ':wotAllowance'=>!empty($rowAssoc['wotAllowance']) ? 1 : 0,
                        ':exitDate'=>!empty($rowAssoc['exitDate']) ? date('Y-m-d', strtotime($rowAssoc['exitDate'])) : null,
                        ':accountNumber'=>$rowAssoc['accountNumber'] ?? null,
                        ':ifsc'=>$rowAssoc['ifsc'] ?? null,
                        ':pan'=>$rowAssoc['pan'] ?? null,
                        ':aadhar'=>$rowAssoc['aadhar'] ?? null,
                        ':status'=>$rowAssoc['status'] ?? 'active'
                    ]);
                    $imported++;
                }
            }
        }

        echo json_encode(['ok'=>true,'imported'=>$imported]);
        exit;
    }

    // --- UNKNOWN ACTION ---
    throw new Exception('Unknown action: ' . $action);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    exit;
}
